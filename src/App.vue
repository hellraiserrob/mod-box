<template>
  <div>
    <div v-if="data.folders" class="folders">
      <div class="folders__list">
        <h1 class="mb10">ModBox</h1>
        <h2 class="mb10">Folders</h2>
        <div v-if="!data.folders.length">No folders</div>
        <div v-for="(folder, index) in data.folders" class="folders__list__item"
          :class="{ 'folders__list__item--active': index === activeFolder }">
          <button :title="'selectet ' + folder.name" @click="activeFolder = index" class="folders__list__item__label">{{
            folder.name }}</button>
          <!-- <span v-if="folder.active" class="folders__list__item__active"></span> -->

          <button class="toggle" @click="folder.active = !folder.active" :class="{ 'toggle--active': folder.active }"
            :title="folder.active ? 'Disable folder rules' : 'Enable folder rules'">
            <div class="toggle__text">
              {{ folder.active ? "On" : "Off" }}
            </div>
          </button>
        </div>
        <button class="mt20 mb20 btn" @click="addFolder">
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
            <path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z" />
          </svg>
          Add folder
        </button>

        <h2 class="mb10">Global setting</h2>
        <div class="folders__list__item">
          <button class="folders__list__item__label" @click="data.active = !data.active">{{ data.active ? "Disable all"
            :
            "Enable all"}} <div class="badge">{{ totalRules }}</div></button>
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


        <button class="mt20 btn" @click="save">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M12 1c6.065 0 11 4.935 11 11s-4.935 11-11 11-11-4.935-11-11 4.935-11 11-11zm0-1c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z" />
          </svg>
          Save all
        </button>
      </div>
      <div class="folders__detail">
        <div v-for="(folder, index) in data.folders">
          <Folder v-if="index === activeFolder" :folder="folder" @deleteFolder="deleteFolder" />
        </div>

        <!-- <textarea name="" id="" cols="30" rows="10" :value="JSON.stringify(data)"></textarea> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Ref } from "vue";

import { DataType, FolderType } from "./interaces"
import Folder from "./components/Folder.vue";

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

const data: Ref<DataType> = ref({
  active: true,
  folders: [],
});

const activeFolder: Ref<number> = ref(0);
const totalRules: Ref<number> = ref(0);

/**
 * methods
 */

function reset() {
  data.value = fallbackData;
  activeFolder.value = 0;
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
        requestHeaders: [],
        responseHeaders: [],
        blockedRequests: [],
      },
    ],
  });

  activeFolder.value = data.value.folders.length - 1;
}

function deleteFolder(targetFolder: FolderType) {
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
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: request.condition.requestDomains.split(",") }),
                },
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
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
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
  totalRules.value = newRules.length;
  console.log(newRules);

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

    // set badge
    chrome.action.setBadgeBackgroundColor({ color: "blue" })
    chrome.action.setBadgeText({ text: totalRules.value });
  } else {
    window.localStorage.setItem("[ModBox]Data", JSON.stringify(data.value));
  }
}

async function getData() {
  const chromeData = await chrome.storage.local.get(["data"]);

  // chrome.storage.local.get(["key"]).then((result) => {
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

  save()
});
</script>
