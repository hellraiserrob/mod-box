<template>
  <div>
    <div v-if="error" class="error">
      There was an error setting the rules, did you use an invalid header name
    </div>
    <div
      v-if="data.folders"
      class="folders"
      :class="{ 'folders--compact': compact }"
    >
      <div class="folders__list">
        <div class="folders__list__wrapper">
          <!-- <button class="folders__list__toggle" @click="compact = !compact">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
          </svg>
        </button> -->

          <h1 class="mb20 logo">
            <img src="/images/16_16.png" alt="Modbox" />
            ModBox
          </h1>
          <h3 class="mb10">Folders</h3>
          <div v-if="!data.folders.length">No folders</div>

          <Dragger
            :folders="data.folders"
            @moveFolder="moveFolder"
            @toggleActive="toggleActive"
            @setFolder="setFolder"
            :activeFolder="activeFolder"
            :showSettings="showSettings"
          />

          <button class="mt20 mb20 btn" @click="addFolder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-plus-lg"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
              />
            </svg>
            Add folder
          </button>

          <div class="folders__list__settings">
            <h3 class="mb10">Global</h3>
            <div class="folders__list__item">
              <button
                class="folders__list__item__label"
                @click="data.active = !data.active"
              >
                {{ data.active ? "Disable all" : "Enable all" }}
                <div class="badge">{{ totalActiveRules }}</div>
              </button>
              <div
                class="toggle toggle--warning"
                @click="data.active = !data.active"
                :class="{ 'toggle--active': data.active }"
              >
                <div class="toggle__text">
                  {{ data.active ? "On" : "Off" }}
                </div>
              </div>
            </div>
            <div
              class="folders__list__item"
              :class="{ 'folders__list__item--active': showSettings }"
            >
              <!-- <button class="folders__list__item__label" @click="reset">Reset all</button> -->
              <button
                class="folders__list__item__label"
                @click="showSettings = true"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="folders__detail">
        <div v-if="!showSettings" v-for="(folder, index) in data.folders">
          <Folder
            v-if="index === activeFolder"
            :folder="folder"
            @deleteFolder="deleteFolder"
            @cloneFolder="cloneFolder"
          />
        </div>
        <div v-else>
          <div class="folder__header mb10">
            <h3>Settings</h3>
            <!-- <button @click="showSettings = !showSettings" class="btn-icon" :class="{ 'btn-icon--active': showSettings }">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-gear-wide-connected" viewBox="0 0 16 16">
                <path
                  d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z" />
              </svg>
            </button> -->
          </div>

          <div class="panel panel--large mb20">
            <div v-if="showDeleteConfirmation" class="panel__modal">
              <h3 class="mb10">Confirm rules deletion</h3>
              <div class="panel__modal__actions">
                <button class="btn btn--danger" @click="reset">Delete</button>
                <button class="btn" @click="showDeleteConfirmation = false">
                  Cancel
                </button>
              </div>
            </div>

            <h3 class="mb10">Delete all rules</h3>
            <p class="mb20">
              If you want to totally reset all of your rules. This cannot be
              undone so please use carefully.
            </p>

            <div class="panel__actions">
              <button @click="showDeleteConfirmation = true" class="btn">
                Delete all
              </button>
            </div>
          </div>
          
          <div class="panel panel--large">
            <h3 class="mb10">Import / Export</h3>
            <p class="mb20">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellendus, dolorum iste.
            </p>

            <div class="mb20">
              <label class="checkbox" :class="{'checkbox--active' : selectedExport.includes(index)}" v-for="(folder, index) in data.folders">
                <input type="checkbox" v-model="selectedExport" :value="index" />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                </svg>
                {{  folder.name }}
              </label>
            </div>

            <div class="panel__actions btn-group">
              <button class="btn" @click="download" :disabled="!selectedExport.length">
                Export
              </button>
              <button class="btn">
                Import
              </button>
            </div>
          </div>

          <div class="panel panel--large">
            <h3 class="mb10">About</h3>
            <p class="mb20">
              ModBox is a hobby project with the aim of providing developers and hackers with a tool for testing and debugging.
            </p>

            <div class="panel__actions">
              <a href="https://www.linkedin.com/in/frontendrob/" class="btn" target="_blank">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { Ref } from "vue";
import * as _ from "lodash";

import { DataType, FolderType } from "./interaces";
import { generateRules, isChrome } from "./utils";

import Folder from "./components/Folder.vue";
import Dragger from "./components/FolderDragger.vue";

/**
 * static variables
 */

const fallbackData = {
  version: 1,
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
 * reactive variables
 */

const data: Ref<DataType> = ref({
  version: 1,
  active: true,
  folders: [],
});

const activeFolder: Ref<number> = ref(0);
const totalActiveRules: Ref<number> = ref(0);
const error = ref(false);
const compact = ref(false);
const showSettings = ref(false);
const showDeleteConfirmation = ref(false);
const selectedExport = ref([]);

/**
 * methods
 */

function download() {
  const exportData:FolderType[] = data.value.folders.filter((folder, index) => {
    return selectedExport.value.includes(index);
  });

  const json = JSON.stringify(exportData);
  const blob = new Blob([json], {type: "application/json"});
  const url  = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `modbox-export-${Math.floor(Date.now() / 1000)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

// move the position of a folder
function moveFolder(from: number, to: number) {
  const folder = data.value.folders[from];

  data.value.folders.splice(from, 1);
  data.value.folders.splice(to, 0, folder);

  setFolder(to, false);
}

function toggleActive(folder: FolderType) {
  folder.active = !folder.active;
}

function setFolder(index: number, saveTab: Boolean = true) {
  activeFolder.value = index;
  showSettings.value = false;

  if (isChrome) {
    chrome.storage.local
      .set({ activeFolder: `${activeFolder.value}` })
      .then(() => {
        console.log("Chrome storage activeFolder set");
      });

    if (saveTab) {
      chrome.storage.local.set({ activeTab: "0" }).then(() => {
        console.log("Chrome storage activeTab set");
      });
    }
  } else {
    window.localStorage.setItem("activeFolder", `${activeFolder.value}`);
    if (saveTab) {
      window.localStorage.setItem("activeTab", "0");
    }
  }
}

function cloneFolder(folder: FolderType) {
  data.value.folders.push({ ..._.cloneDeep(folder), name: "Cloned folder" });

  setFolder(data.value.folders.length - 1);
}

function reset() {
  data.value = { ...fallbackData };
  showSettings.value = false;
  showDeleteConfirmation.value = false;

  setFolder(0);
  // save();
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
        redirectRequests: [],
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

    chrome.storage.local
      .set({ totalActiveRules: `${activeRules.length}` })
      .then(() => {
        console.log("Chrome storage totalActiveRules set");
      });

    // set badge
    chrome.action.setBadgeBackgroundColor({ color: "blue" });
    chrome.action.setBadgeText({
      text: totalActiveRules.value > 0 ? `${totalActiveRules.value}` : "",
    });
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
    save();
  },
  { deep: true }
);

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
