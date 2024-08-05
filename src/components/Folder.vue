<template>
  <div class="folder" :class="{ 'folder--active': folder.active }">
    <div class="folder__header mb10">
      <h3>Folder ({{ folder.name }})</h3>
      <button @click="showSettings = !showSettings" class="btn-icon" :class="{ 'btn-icon--active': showSettings }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
          class="bi bi-gear-wide-connected" viewBox="0 0 16 16">
          <path
            d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z" />
        </svg>
      </button>
    </div>

    <div v-if="showSettings" class="panel mb20">
      <div class="panel__close">
        <button class="btn-icon" @click="showSettings = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
            viewBox="0 0 16 16">
            <path
              d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
          </svg>
        </button>
      </div>

      <div v-if="showDeleteConfirmation" class="panel__modal">
        <h3 class="mb10">Confirm folder deletion</h3>
        <div class="panel__modal__actions">
          <button class="btn btn--danger" @click="deleteFolder">Delete</button>
          <button class="btn" @click="showDeleteConfirmation = false">Cancel</button>
        </div>
      </div>
      <h3 class="mb10">Folder settings</h3>
      <div class="mb10">
        <div class="field">
          <label class="field__label" for="">Folder name</label>
          <input class="field__input" type="text" v-model="folder.name" placeholder="Folder name" />
        </div>
      </div>
      <div>
        <button @click="showDeleteConfirmation = true" class="btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg"
            viewBox="0 0 16 16">
            <path
              d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
          </svg>
          Delete folder
        </button>
      </div>
    </div>

    <div class="tabs mb15">
      <div class="tabs__tab" v-for="(tab, index) in folder.tabs" :class="{ 'tabs__tab--active': index === activeTab }">
        <button class="tabs__tab__label" @click="activeTab = index">
          {{ tab.name }}
        </button>

        <div class="toggle" @click="tab.active = !tab.active" :class="{ 'toggle--active': tab.active }">
          <div class="toggle__text">
            {{ tab.active ? "On" : "Off" }}
          </div>
        </div>
      </div>
      <div class="tabs__tab">
        <button class="btn-icon" @click="addTab">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg"
            viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
          </svg>
        </button>
      </div>
    </div>

    <div v-for="(tab, index) in folder.tabs">
      <Tab v-if="index === activeTab" :tab="tab" @deleteTab="deleteTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue";

import Tab from "./Tab.vue";

const props = defineProps({
  folder: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["deleteFolder"]);

const { folder } = toRefs(props);

const activeTab = ref(0);
const showSettings = ref(false);
const showDeleteConfirmation = ref(false);

function deleteTab(targetTab: any) {
  folder.value.tabs = folder.value.tabs.filter((tab: any) => tab !== targetTab);
  activeTab.value = 0;
}

function addTab() {
  folder.value.tabs.push({
    name: "New tab",
    active: true,
    requestHeaders: [],
    responseHeaders: [],
    blockedRequests: [],
  });
}

function deleteFolder() {
  emit("deleteFolder", folder.value);
  showDeleteConfirmation.value = false;
}
</script>
