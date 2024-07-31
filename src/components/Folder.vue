<template>
  <div class="folder" :class="{'folder--active' : folder.active }">
    <div class="folder__header mb10">
      <h2>Folder: {{ folder.name }}</h2>
      <button @click="showSettings = !showSettings" class="btn" :class="{ 'btn--active': showSettings }">
        <!-- <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 14.187v-4.374c-2.148-.766-2.726-.802-3.027-1.529-.303-.729.083-1.169 1.059-3.223l-3.093-3.093c-2.026.963-2.488 1.364-3.224 1.059-.727-.302-.768-.889-1.527-3.027h-4.375c-.764 2.144-.8 2.725-1.529 3.027-.752.313-1.203-.1-3.223-1.059l-3.093 3.093c.977 2.055 1.362 2.493 1.059 3.224-.302.727-.881.764-3.027 1.528v4.375c2.139.76 2.725.8 3.027 1.528.304.734-.081 1.167-1.059 3.223l3.093 3.093c1.999-.95 2.47-1.373 3.223-1.059.728.302.764.88 1.529 3.027h4.374c.758-2.131.799-2.723 1.537-3.031.745-.308 1.186.099 3.215 1.062l3.093-3.093c-.975-2.05-1.362-2.492-1.059-3.223.3-.726.88-.763 3.027-1.528zm-4.875.764c-.577 1.394-.068 2.458.488 3.578l-1.084 1.084c-1.093-.543-2.161-1.076-3.573-.49-1.396.581-1.79 1.693-2.188 2.877h-1.534c-.398-1.185-.791-2.297-2.183-2.875-1.419-.588-2.507-.045-3.579.488l-1.083-1.084c.557-1.118 1.066-2.18.487-3.58-.579-1.391-1.691-1.784-2.876-2.182v-1.533c1.185-.398 2.297-.791 2.875-2.184.578-1.394.068-2.459-.488-3.579l1.084-1.084c1.082.538 2.162 1.077 3.58.488 1.392-.577 1.785-1.69 2.183-2.875h1.534c.398 1.185.792 2.297 2.184 2.875 1.419.588 2.506.045 3.579-.488l1.084 1.084c-.556 1.121-1.065 2.187-.488 3.58.577 1.391 1.689 1.784 2.875 2.183v1.534c-1.188.398-2.302.791-2.877 2.183zm-7.125-5.951c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm0-2c-2.762 0-5 2.238-5 5s2.238 5 5 5 5-2.238 5-5-2.238-5-5-5z"/></svg> -->
        Folder settings
      </button>
    </div>

    <div v-if="showSettings" class="panel mb20">
      <h2 class="mb20">Folder settings</h2>
      <div class="mb10">
        <div class="field">
          <label class="field__label" for="">Folder name</label>
          <input class="field__input" type="text" v-model="folder.name" placeholder="Folder name">
        </div>
      </div>
      <div>
        <button @click="deleteFolder" class="btn">
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
            <path
              d="M12 11.293l10.293-10.293.707.707-10.293 10.293 10.293 10.293-.707.707-10.293-10.293-10.293 10.293-.707-.707 10.293-10.293-10.293-10.293.707-.707 10.293 10.293z" />
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
        <button class="btn" @click="addTab">Add tab</button>
      </div>
    </div>

    <div v-for="(tab, index) in folder.tabs">
      <Tab v-if="index === activeTab" :tab="tab" @deleteTab="deleteTab" />
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

import Tab from "./Tab.vue";

const props = defineProps(['folder'])
const emit = defineEmits(["deleteFolder"])


const folder = props.folder;

const activeTab = ref(0);
const showSettings = ref(false);

function deleteTab(targetTab: any) {
  folder.tabs = folder.tabs.filter((tab: any) => tab !== targetTab)
}

function addTab() {
  folder.tabs.push({
    name: "New tab",
    active: true,
    requestHeaders: [],
    responseHeaders: [],
    blockedRequests: [],
  })
}


function deleteFolder() {
  emit("deleteFolder", folder)
}

</script>