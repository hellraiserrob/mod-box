<template>
  <div>
    <h1>ModBox</h1>
    <div class="folders">
      <div class="folders__list">
        <h2>Folders / Project</h2>
        <div 
          v-for="(folder, index) in data.folders"
          class="folders__list__item"
          @click="activeFolder = index"
          :class="{'folders__list__item--active': index === activeFolder}"
        >
          {{ folder.name }} <span v-if="folder.active" class="folders__list__item__active"></span>
        </div>
        <button class="mt20" @click="addFolder">Add folder</button>
      </div>
      <div class="folders__detail">
        <div v-for="(folder, index) in data.folders">
          <Folder v-if="index === activeFolder" :folder="folder" @deleteFolder="deleteFolder" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import Folder from "./components/Folder.vue";
    
  const data = ref({
    folders: [{
      name: "default folder",
      active: true,
      tabs: [{
        name: "cdt",
        active: true,
        requestHeaders: [{
          active: true,
          name: "test-header",
          value: "some value",
        }]
      }, {
        name: "preprod",
        active: true,
        requestHeaders: []
      }]
    }, {
      name: "another folder",
      active: false,
      tabs: [{
        name: "cdt",
        active: true,
        requestHeaders: [{
          active: true,
          name: "test-header",
          value: "some value",
        }]
      }]
    }]
  })

  const activeFolder = ref(0);

  function addFolder() {
    data.value.folders.push({
      name: "New folder",
      active: true,
      tabs: [{
        name: "default tab",
        active: true,
        requestHeaders: []
      }]
    })
  }

  function deleteFolder(targetFolder:any) {
    data.value.folders = data.value.folders.filter(folder => folder !== targetFolder);
  }

</script>

