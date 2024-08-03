<template>
  <div class="folder" :class="{ 'folder--active': folder.active }">
    <div class="folder__header mb10">
      <h2>{{ folder.name }}</h2>
      <button @click="showSettings = !showSettings" class="btn-icon" :class="{ 'btn-icon--active': showSettings }">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
          class="bi bi-sliders2-vertical" viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M0 10.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1H3V1.5a.5.5 0 0 0-1 0V10H.5a.5.5 0 0 0-.5.5M2.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m3-6.5A.5.5 0 0 0 6 6h1.5v8.5a.5.5 0 0 0 1 0V6H10a.5.5 0 0 0 0-1H6a.5.5 0 0 0-.5.5M8 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2A.5.5 0 0 0 8 1m3 9.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1H14V1.5a.5.5 0 0 0-1 0V10h-1.5a.5.5 0 0 0-.5.5m2.5 1.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5" />
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

    <div class="tabs mb20">
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
