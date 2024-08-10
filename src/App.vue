<template>
  <div>
    <div v-if="error" class="error">There was an error setting the rules, did you use an invalid header name</div>
    <div v-if="data.folders" class="folders">
      <div class="folders__list">
        <h1 class="mb20 logo">
          <img src="/images/16_16.png" alt="Modbox">
          ModBox
        </h1>
        <h3 class="mb10">Folders</h3>
        <div v-if="!data.folders.length">No folders</div>

        <Dragger :folders="data.folders" @moveFolder="moveFolder" @toggleActive="toggleActive" @setFolder="setFolder" :activeFolder="activeFolder" />

        <button class="mt20 mb20 btn" @click="addFolder">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg"
            viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
          </svg>
          Add folder
        </button>

        <h3 class="mb10">Global setting</h3>
        <div class="folders__list__item">
          <button class="folders__list__item__label" @click="data.active = !data.active">{{ data.active ? "Disable all"
            :
            "Enable all" }} <div class="badge">{{ totalActiveRules }}</div></button>
          <div class="toggle toggle--warning" @click="data.active = !data.active"
            :class="{ 'toggle--active': data.active }">
            <div class="toggle__text">
              {{ data.active ? "On" : "Off" }}
            </div>
          </div>
        </div>
        <div class="folders__list__item">
          <button class="folders__list__item__label" @click="reset">Reset all</button>
        </div>

      </div>
      <div class="folders__detail">
        <div v-for="(folder, index) in data.folders">
          <Folder v-if="index === activeFolder" :folder="folder" @deleteFolder="deleteFolder" @cloneFolder="cloneFolder" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Ref } from "vue";
import * as _ from "lodash";

import { DataType, FolderType } from "./interaces"
import { generateRules } from "./utils"

import Folder from "./components/Folder.vue";
import Dragger from "./components/FolderDragger.vue";

/**
 * static variables
 */

const isChrome: boolean =
  chrome && chrome.declarativeNetRequest && chrome.storage;
const fallbackData = {
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
        },
      ],
    },
  ],
};

/**
 * reactive variables
 */

const data: Ref<DataType> = ref({
  active: true,
  folders: [],
});

const activeFolder: Ref<number> = ref(0);
const totalActiveRules: Ref<number> = ref(0);
const error = ref(false);

/**
 * methods
 */

// move the position of a folder
function moveFolder(from: number, to: number) {
  const folder = data.value.folders[from];

  data.value.folders.splice(from, 1);
  data.value.folders.splice(to, 0, folder);

  setFolder(to);
}

function toggleActive(folder: FolderType) {
  folder.active = !folder.active;
}

function setFolder(index: number) {
  activeFolder.value = index;
  window.localStorage.setItem("activeFolder", `${activeFolder.value}`);

  if(isChrome) {
    chrome.storage.local.set({ activeFolder: `${activeFolder.value}` }).then(() => {
      console.log("Chrome storage activeFolder set");
    });
  }
}

function cloneFolder(folder: FolderType) {
  data.value.folders.push({..._.cloneDeep(folder), name: "Cloned folder"})

  setFolder(data.value.folders.length - 1);
}

function reset() {
  data.value = fallbackData;

  setFolder(0);
  save();
}

function addFolder() {
  data.value.folders?.push({
    name: "New folder",
    active: true,
    tabs: [
      {
        name: "default tab",
        active: true,
        requestDomains: "",
        requestHeaders: [],
        responseHeaders: [],
        blockedRequests: [],
      },
    ],
  });

  setFolder(data.value.folders.length - 1);
}

function deleteFolder(targetFolder: FolderType) {
  data.value.folders = data.value.folders.filter(
    (folder) => folder !== targetFolder
  );

  setFolder(0);
}

async function save() {
  const activeRules = generateRules(data.value);
  totalActiveRules.value = activeRules.length;
  console.log(activeRules);

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
      console.log(e);
    }

    chrome.storage.local.set({ rules: JSON.stringify(data.value) }).then(() => {
      console.log("Chrome storage rules set");
    });

    chrome.storage.local.set({ totalActiveRules: `${activeRules.length}` }).then(() => {
      console.log("Chrome storage totalActiveRules set");
    });

    // set badge
    chrome.action.setBadgeBackgroundColor({ color: "blue" })
    chrome.action.setBadgeText({ text: totalActiveRules.value > 0 ? `${totalActiveRules.value}` : '' });

  } else {
    window.localStorage.setItem("rules", JSON.stringify(data.value));
  }
}

async function getData() {
  const chromeData = await chrome.storage.local.get(["rules", "activeFolder"]);

  if (chromeData.rules) {
    console.log("restore rules from chrome storage");
    data.value = JSON.parse(chromeData.rules);
    // save();
  } else {
    console.log("nothing to restore from chrome");
    data.value = fallbackData;
  }

  if (chromeData.activeFolder) {
    activeFolder.value = parseInt(chromeData.activeFolder);
  }
}


/**
 * watch
 */

watch(
  () => data,
  () => {
    save()
  },
  { deep: true }
)

/**
 * lifecycle hooks
 */

onMounted(() => {
  if (isChrome) {
    getData();
  } else {
    const rules = window.localStorage.getItem("rules");
    const af = window.localStorage.getItem("activeFolder");

    if (rules) {
      console.log("restore data from ls");
      data.value = JSON.parse(rules);
    } else {
      console.log("nothing to restore from ls");
      data.value = fallbackData;
    }

    if (af) {
      activeFolder.value = parseInt(af);
    }

    // if(rules || af) {
    //   save()
    // }
  }

  // save()
});
</script>
