<template>
  <Dragger />
  <div>
    <div v-if="data.folders" class="folders">
      <div class="folders__list">
        <h1 class="mb20 logo">
          <img src="/images/16_16.png" alt="Modbox">
          ModBox
        </h1>
        <h3 class="mb10">Folders</h3>
        <div v-if="!data.folders.length">No folders</div>
        <div ref="parent">
          <div v-for="(folder, index) in data.folders" class="folders__list__item"
          :key="index"
            :class="{ 'folders__list__item--active': index === activeFolder }">
            <button :title="'selectet ' + folder.name" @click="setFolder(index)"
              class="folders__list__item__label">{{
                folder.name }}</button>

            <button class="toggle" @click="folder.active = !folder.active" :class="{ 'toggle--active': folder.active }"
              :title="folder.active ? 'Disable folder rules' : 'Enable folder rules'">
              <div class="toggle__text">
                {{ folder.active ? "On" : "Off" }}
              </div>
            </button>
          </div>
        </div>
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


        <!-- <button class="mt20 btn" @click="save">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy" viewBox="0 0 16 16">
            <path d="M11 2H9v3h2z"/>
            <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
          </svg>
          Save all
        </button> -->
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
import { ref, onMounted, watch } from "vue";
import type { Ref } from "vue";
// import { useDragAndDrop } from "@formkit/drag-and-drop/vue";

import { DataType, FolderType } from "./interaces"
import Folder from "./components/Folder.vue";
import Dragger from "./components/Dragger.vue";

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
const totalActiveRules: Ref<number> = ref(0);

/**
 * drag and drop
 */
//  const [parent, tapes] = useDragAndDrop(fallbackData.folders);
// console.log(tapes.value);


/**
 * methods
 */

function setFolder(index: number) {
  activeFolder.value = index;
  window.localStorage.setItem("activeFolder", `${activeFolder.value}`);
}

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
          // blocking rules
          tab.blockedRequests?.forEach((request) => {
            if (request.active) {
              rules.push({
                id,
                priority: 1,
                action: { type: "block" },
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: request.condition.requestDomains.split(",") }),
                  ...(request.condition.document && { resourceTypes: ["main_frame"] }),
                },
              });

              id += 1;
            }
          });

          // request rules
          tab.requestHeaders?.forEach((request) => {
            if (request.active && request.name !== "") {
              rules.push({
                id,
                priority: 1,
                action: {
                  type: "modifyHeaders",
                  requestHeaders: [{ header: request.name, operation: "set", value: request.value }]
                },
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: request.condition.requestDomains.split(",") }),
                  resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"]
                }
              });

              id += 1;
            }
          });

          // response rules
          tab.responseHeaders?.forEach((request) => {
            if (request.active && request.name !== "") {
              rules.push({
                id,
                priority: 1,
                action: {
                  type: "modifyHeaders",
                  responseHeaders: [{ header: request.name, operation: "set", value: request.value }]
                },
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: request.condition.requestDomains.split(",") }),
                  resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"]
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
  const activeRules = generateRules();
  totalActiveRules.value = activeRules.length;
  console.log(activeRules);

  if (isChrome) {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map((rule: any) => rule.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: activeRules,
    });

    chrome.storage.local.set({ rules: JSON.stringify(data.value) }).then(() => {
      console.log("Chrome storage rules set");
    });

    chrome.storage.local.set({ totalActiveRules: `${activeRules.length}` }).then(() => {
      console.log("Chrome storage totalActiveRules set");
    });
    
    chrome.storage.local.set({ activeFolder: `${activeFolder.value}` }).then(() => {
      console.log("Chrome storage activeFolder set");
    });

    // set badge
    // chrome.action.setBadgeBackgroundColor({ color: "blue" })
    // chrome.action.setBadgeText({ text: totalActiveRules.value > 0 ? `${totalActiveRules.value}` : '' });

  } else {
    window.localStorage.setItem("rules", JSON.stringify(data.value));
    window.localStorage.setItem("activeFolder", `${activeFolder.value}`);
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
