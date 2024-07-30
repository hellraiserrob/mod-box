<template>
  <div>
    <h1>ModBox</h1>
    <div v-if="data.folders" class="folders">
      <div class="folders__list">
        <h2>Folders</h2>
        <div v-if="!data.folders.length">No folders</div>
        <div
          v-for="(folder, index) in data.folders"
          class="folders__list__item"
          @click="activeFolder = index"
          :class="{ 'folders__list__item--active': index === activeFolder }"
        >
          {{ folder.name }}
          <span v-if="folder.active" class="folders__list__item__active"></span>
        </div>
        <button class="mt20" @click="addFolder">Add folder</button>
      </div>
      <div class="folders__detail">
        <div v-for="(folder, index) in data.folders">
          <Folder
            v-if="index === activeFolder"
            :folder="folder"
            @deleteFolder="deleteFolder"
          />
        </div>

        <button class="mt20" @click="save">Save</button>

        <!-- <textarea name="" id="" cols="30" rows="10" :value="JSON.stringify(data)"></textarea> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Ref } from "vue";

import Folder from "./components/Folder.vue";

interface Tab {
  name: string;
  active: boolean;
  requestHeaders?: any[];
  responseHeaders?: any[];
  blockedRequests?: any[];
}

interface Folder {
  name: string;
  active: boolean;
  tabs: Tab[];
}

interface Data {
  active: boolean;
  folders: Folder[];
}

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

const data: Ref<Data> = ref({
  active: true,
  folders: [],
});

const activeFolder: Ref<number> = ref(0);

/**
 * methods
 */

function addFolder() {
  data.value.folders?.push({
    name: "New folder",
    active: true,
    tabs: [
      {
        name: "default tab",
        active: true,
        requestHeaders: [],
        responseHeaders: [],
        blockedRequests: [],
      },
    ],
  });
}

function deleteFolder(targetFolder: Folder) {
  data.value.folders = data.value.folders.filter(
    (folder) => folder !== targetFolder
  );

  activeFolder.value = 0;
}

function generateRules() {
  const rules: any = [];
  let id = 1;

  if (!data.value.active) {
    return [];
  }

  data.value.folders.forEach((folder) => {
    if (folder.active) {
      folder.tabs.forEach((tab) => {
        if (tab.active) {
          tab.blockedRequests?.forEach((request) => {
            if (request.active) {
              rules.push({
                id,
                priority: 1,
                action: { type: "block" },
                condition: request.condition,
              });

              id += 1;
            }
          });

          tab.requestHeaders?.forEach((request) => {
            if (request.active) {
              rules.push({
                id,
                priority: 1,
                action: { 
                  type: "modifyHeaders",
                  requestHeaders: [{ header: request.name, operation: "set", value: request.value }]
                },
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter : request.condition.urlFilter }),
                }
              });

              id += 1;
            }
          });
        }
      });
    }
  });

  return rules;
}

async function save() {
  const newRules = generateRules();

  console.log(newRules);
  // console.log(data.value);

  if (isChrome) {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map((rule: any) => rule.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: newRules,
    });

    chrome.storage.local.set({ data: JSON.stringify(data.value) }).then(() => {
      console.log("Chrome data is set");
    });
  } else {
    window.localStorage.setItem("[ModBox]Data", JSON.stringify(data.value));
  }
}

async function getData() {
  const chromeData = await chrome.storage.local.get(["data"]);

  //   chrome.storage.local.get(["key"]).then((result) => {
  //   console.log("Value is " + result.key);
  // });

  console.log(chromeData.data);
  console.log(activeFolder.value);

  if (chromeData.data) {
    console.log("restore data from chrome storage");
    data.value = JSON.parse(chromeData.data);
  } else {
    console.log("nothing to restore from chrome");
    data.value = fallbackData;
  }
}

/**
 * lifecycle hooks
 */

onMounted(() => {
  if (isChrome) {
    getData();
  } else {
    const lsData = window.localStorage.getItem("[ModBox]Data");

    if (lsData) {
      console.log("restore data from ls");
      data.value = JSON.parse(lsData);
    } else {
      console.log("nothing to restore from ls");
      data.value = fallbackData;
    }
  }
});
</script>
