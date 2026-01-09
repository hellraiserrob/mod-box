<template>
  <div
    class="folders"
    :class="{ 'folders--compact': compact }"
  >
    <!-- Sidebar -->
    <div class="folders__list">
      <div class="folders__list__wrapper">
        <h1 class="mb20 logo" :class="{ 'logo--compact': compact }">
          <img src="/images/48_48.png" alt="Modbox" />
          <span v-if="!compact">ModBox</span>
        </h1>
        <h3 v-if="!compact" class="mb10">Folders</h3>
        <div v-if="!data.folders.length">No folders</div>

        <FolderDragger
          :folders="data.folders"
          @moveFolder="moveFolder"
          @toggleActive="toggleActive"
          @setFolder="setFolder"
          :activeFolder="activeFolder"
          :showSettings="showSettings"
          :compact="compact"
        />

        <button
          class="mt10 mb20"
          @click="addFolder"
          title="Add folder"
          :class="{
            btn: !compact,
            'btn-icon btn-icon--with--border': compact,
          }"
        >
          <template v-if="compact">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-plus"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
              />
            </svg>
          </template>
          <template v-else>Add</template>
        </button>

        <hr />

        <div class="folders__list__settings">
          <h3 v-if="!compact" class="mb10">Global</h3>
          <div v-if="!compact" class="folders__list__item">
            <button
              class="folders__list__item__label"
              @click="$emit('toggleGlobalActive')"
            >
              Rules enabled
              <div class="badge">{{ totalActiveRules }}</div>
            </button>
            <div
              class="toggle toggle--warning"
              @click="$emit('toggleGlobalActive')"
              :class="{ 'toggle--active': data.active }"
            >
              <div class="toggle__text">
                {{ data.active ? "On" : "Off" }}
              </div>
            </div>
          </div>

          <div
            class="folders__list__item"
            :class="{
              'folders__list__item--active': showSettings,
              'folders__list__item--compact': compact,
            }"
          >
            <button
              class="folders__list__item__label"
              @click="showSettings = true"
              title="Global settings"
            >
              <template v-if="!compact">Settings</template>
              <template v-else>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-gear-wide-connected"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z"
                  />
                </svg>
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Area -->
    <div class="folders__detail" :class="{ 'folders__detail--compact': compact }">
      <template v-if="!showSettings">
        <div v-for="(folder, index) in data.folders" :key="`folder-${index}`">
          <Folder
            v-if="index === activeFolder"
            :folder="folder"
            @deleteFolder="deleteFolder"
            @cloneFolder="cloneFolder"
            @toggleActive="toggleActive"
          />
        </div>
      </template>
      <Settings
        v-else
        :folders="data.folders"
        :compact="compact"
        @toggleCompact="toggleCompact"
        @reset="$emit('reset')"
        @importFolders="importFolders"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType } from "vue";
import * as _ from "lodash";

import { DataType, FolderType } from "../interfaces";
import { isChrome } from "../utils";

import Folder from "./Folder.vue";
import FolderDragger from "./FolderDragger.vue";
import Settings from "./Settings.vue";

const props = defineProps({
  data: {
    type: Object as PropType<DataType>,
    required: true,
  },
  totalActiveRules: {
    type: Number,
    required: true,
  },
  initialActiveFolder: {
    type: Number,
    default: 0,
  },
  initialCompact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  toggleGlobalActive: [];
  reset: [];
  importFolders: [folders: FolderType[]];
  compactChanged: [compact: boolean];
  activeFolderChanged: [index: number, saveTab: boolean];
}>();

/**
 * Local state
 */
const activeFolder = ref(props.initialActiveFolder);
const compact = ref(props.initialCompact);
const showSettings = ref(false);

/**
 * Folder management
 */
function addFolder() {
  props.data.folders.push({
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

  setFolder(props.data.folders.length - 1);
}

function deleteFolder(targetFolder: FolderType) {
  const index = props.data.folders.indexOf(targetFolder);
  if (index > -1) {
    props.data.folders.splice(index, 1);
  }
  setFolder(0);
}

function cloneFolder(folder: FolderType) {
  props.data.folders.push({ ..._.cloneDeep(folder), name: "Cloned folder" });
  setFolder(props.data.folders.length - 1);
}

function moveFolder(from: number, to: number) {
  const folder = props.data.folders[from];
  props.data.folders.splice(from, 1);
  props.data.folders.splice(to, 0, folder);
  setFolder(to, false);
}

function toggleActive(folder: FolderType) {
  folder.active = !folder.active;
}

function setFolder(index: number, saveTab: boolean = true) {
  activeFolder.value = index;
  showSettings.value = false;
  emit("activeFolderChanged", index, saveTab);
}

/**
 * Settings
 */
function toggleCompact() {
  compact.value = !compact.value;
  emit("compactChanged", compact.value);
}

function importFolders(folders: FolderType[]) {
  emit("importFolders", folders);
}

/**
 * Restore active folder from storage
 */
onMounted(async () => {
  if (isChrome) {
    const chromeData = await chrome.storage.local.get(["activeFolder", "compact"]);
    if (chromeData.activeFolder) {
      activeFolder.value = parseInt(chromeData.activeFolder);
    }
    if (chromeData.compact) {
      compact.value = chromeData.compact === "true";
    }
  } else {
    const af = window.localStorage.getItem("activeFolder");
    const cp = window.localStorage.getItem("compact");
    if (af) {
      activeFolder.value = parseInt(af);
    }
    if (cp) {
      compact.value = cp === "true";
    }
  }
});
</script>
