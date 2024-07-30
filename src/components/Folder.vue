
<template>
  <div class="folder">
    <div class="folder__header mb20">
      <h2>{{ folder.name }}</h2>
      <button @click="showSettings = !showSettings">Settings</button>
    </div>
    
    <div v-if="showSettings" class="panel mb20">
      <div class="mb20">
        <input type="text" v-model="folder.name" placeholder="Folder name">
      </div>
      <div>
        <button @click="folder.active = !folder.active">{{ folder.active ? "Disable" : "Activate"}}</button>
        <button @click="deleteFolder()">Delete</button>
      </div>
    </div>

    <div class="tabs mb20">
      <button class="tabs__tab" v-for="(tab, index) in folder.tabs"
        :class="{'tabs__tab--active': index === activeTab}"
        @click="activeTab = index"
      >
        {{ tab.name }} <span v-if="tab.active" class="tabs__tab__active"></span>
      </button>
      <button>Add</button>
    </div>
    
    <div class="tab" v-for="(tab, index) in folder.tabs">
      <div v-if="index === activeTab">
        <h3>{{tab.name}}</h3>
        <div class="mb20">
          <input type="text" v-model="tab.name" placeholder="Tab name">
        </div>
        <div class="mb20">
          isActive: {{ tab.active}} <button @click="tab.active = !tab.active">toggle</button>
        </div>

        <div class="panel">
          <h2 class="mb20">Block requests ({{tab.blockedRequests.length}})</h2>
          <div v-if="!tab.blockedRequests.length">No blocked requests</div>
  
          
          <div>
            <div class="row" v-for="(request) in tab.blockedRequests">
              <div class="row__col row__col--checkbox">
                <div class="field">
                  <input class="" type="checkbox" v-model="request.active"  />
                </div>
              </div>
              <div class="row__col">
                <div class="field">
                  <input class="field__input" type="text" v-model="request.condition.urlFilter" placeholder="urlFilter" />
                </div>
              </div>
              <!-- <div class="row__col">
                <div class="field">
                  <input class="field__input" type="text" v-model="request.value"  placeholder="request value" />
                </div>
              </div> -->
              <div class="row__col row__col--checkbox">
                <button @click="deleteBlockRequest(request)">Delete</button>
              </div>
            </div>
  
          </div>
  
          <button class="mt20" @click="addBlockedRequest(tab)">Add request</button>
        </div>

        <div class="panel">
          <h2 class="mb20">Request headers ({{tab.requestHeaders.length}})</h2>
          <div v-if="!tab.requestHeaders.length">No request headers</div>
  
          
          <div class="request-header">
            <!-- <div v-if="request.rule">
              {{ request.rule.field }}
              {{ request.rule.comparison }}
              {{ request.rule.value }}
            </div> -->
            <div class="row" v-for="(header) in tab.requestHeaders">
              <div class="row__col row__col--checkbox">
                <div class="field">
                  <input class="" type="checkbox" v-model="header.active"  />
                </div>
              </div>
              <div class="row__col">
                <div class="field">
                  <input class="field__input" type="text" v-model="header.name" placeholder="Header name" />
                </div>
              </div>
              <div class="row__col">
                <div class="field">
                  <input class="field__input" type="text" v-model="header.value"  placeholder="Header value" />
                </div>
              </div>
              <div class="row__col row__col--checkbox">
                <button @click="deleteRequestHeader(header)">Delete</button>
              </div>
            </div>
  
          </div>
  
          <button class="mt20" @click="addRequestHeader(tab)">Add request header</button>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
const props = defineProps(['folder'])
const emit = defineEmits(["deleteFolder"])


const folder = props.folder;

const activeTab = ref(0);
const showSettings = ref(false);

function addRequestHeader(tab:any) {
  tab.requestHeaders.push({
    active: false,
    name: "",
    value: "",
  })
} 

function addBlockedRequest(tab:any) {
  tab.blockedRequests.push({
    active: false,
    condition: {
      urlFilter: ""
    }
  })
} 

function deleteFolder() {
  emit("deleteFolder", props.folder)
} 

function deleteRequestHeader(targetHeader:any) {
  folder.tabs[activeTab.value].requestHeaders = folder.tabs[activeTab.value].requestHeaders.filter((header:any) => header !== targetHeader)
}

function deleteBlockRequest(targetRequest:any) {
  folder.tabs[activeTab.value].blockedRequests = folder.tabs[activeTab.value].blockedRequests.filter((request:any) => request !== targetRequest)
}

</script>