<template>
  <div>
    <div v-if="error" class="error error--top">
      There was an error setting the rules, did you use an invalid header name
    </div>
    <FolderPanel
      v-if="data.folders"
      :data="data"
      :totalActiveRules="totalActiveRules"
      @toggleGlobalActive="toggleGlobalActive"
      @reset="reset"
      @importFolders="importFolders"
      @compactChanged="saveCompact"
      @activeFolderChanged="saveActiveFolder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Ref } from "vue";

import { DataType, FolderType } from "./interfaces";
import { generateRules, isChrome } from "./utils";

import FolderPanel from "./components/FolderPanel.vue";

/**
 * Default data structure
 */
const fallbackData: DataType = {
  active: true,
  folders: [
    {
      name: "Default folder",
      active: true,
      tabs: [
        {
          name: "Default tab",
          active: true,
          requestDomains: "",
          requestHeaders: [],
          responseHeaders: [],
          blockedRequests: [],
          redirectRequests: [],
        },
      ],
    },
  ],
};

/**
 * Reactive state
 */
const data: Ref<DataType> = ref({
  active: true,
  folders: [],
});

const totalActiveRules = ref(0);
const error = ref(false);

/**
 * Event handlers from FolderPanel
 */
function toggleGlobalActive() {
  data.value.active = !data.value.active;
}

function reset() {
  data.value = structuredClone(fallbackData);
}

function importFolders(folders: FolderType[]) {
  data.value.folders.push(...folders);
}

function saveCompact(compact: boolean) {
  if (isChrome) {
    chrome.storage.local.set({ compact: `${compact}` }).then(() => {
      console.log("Chrome storage compact set");
    });
  } else {
    window.localStorage.setItem("compact", `${compact}`);
  }
}

function saveActiveFolder(index: number, saveTab: boolean) {
  if (isChrome) {
    chrome.storage.local.set({ activeFolder: `${index}` }).then(() => {
      console.log("Chrome storage activeFolder set");
    });
    if (saveTab) {
      chrome.storage.local.set({ activeTab: "0" }).then(() => {
        console.log("Chrome storage activeTab set");
      });
    }
  } else {
    window.localStorage.setItem("activeFolder", `${index}`);
    if (saveTab) {
      window.localStorage.setItem("activeTab", "0");
    }
  }
}

/**
 * Data persistence
 */
async function save() {
  const activeRules = generateRules(data.value);
  totalActiveRules.value = activeRules.length;

  if (isChrome) {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map((rule: any) => rule.id);

    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: activeRules,
      });
      error.value = false;
    } catch (e) {
      error.value = true;
      console.error(e);
    }

    chrome.storage.local.set({ rules: JSON.stringify(data.value) });
    chrome.storage.local.set({ totalActiveRules: `${activeRules.length}` });

    // Update badge
    chrome.action.setBadgeBackgroundColor({ color: "blue" });
    chrome.action.setBadgeText({
      text: totalActiveRules.value > 0 ? `${totalActiveRules.value}` : "",
    });
  } else {
    window.localStorage.setItem("rules", JSON.stringify(data.value));
  }
}

async function loadData() {
  if (isChrome) {
    const chromeData = await chrome.storage.local.get(["rules"]);
    if (chromeData.rules) {
      data.value = JSON.parse(chromeData.rules);
    } else {
      data.value = fallbackData;
    }
  } else {
    const rules = window.localStorage.getItem("rules");
    if (rules) {
      data.value = JSON.parse(rules);
    } else {
      data.value = fallbackData;
    }
  }
}

/**
 * Watchers
 */
watch(
  () => data,
  () => save(),
  { deep: true }
);

/**
 * Lifecycle
 */
onMounted(() => {
  loadData();
});
</script>
