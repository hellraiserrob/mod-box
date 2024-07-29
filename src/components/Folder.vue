
<template>
  <div class="folder">
    <h2>{{ folder.name }}</h2>
    <div class="mb20">
      isActive: {{ folder.active}} <button @click="folder.active = !folder.active">toggle</button>
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
          isActive: {{ tab.active}} <button @click="tab.active = !tab.active">toggle</button>
        </div>

        <h2>Request headers ({{tab.requestHeaders.length}})</h2>
        <div v-if="!tab.requestHeaders.length">No request headers</div>

        <div class="request-header" v-for="(request, index) in tab.requestHeaders">
          <div v-if="request.rule">
            {{ request.rule.field }}
            {{ request.rule.comparison }}
            {{ request.rule.value }}
          </div>

          <input class="request-header__input" type="text" v-model="request.name" />
          <input class="request-header__input" type="text" v-model="request.value" />
        </div>

        <button class="mt20" @click="addRequestHeader(tab)">Add request header</button>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
const props = defineProps(['folder'])

const folder = props.folder;
const activeTab = ref(0);

function addRequestHeader(tab) {
  tab.requestHeaders.push({
    name: "",
    value: ""
  })
} 

</script>