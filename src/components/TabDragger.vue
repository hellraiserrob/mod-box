<template>
  <div v-for="(tab, index) in tabs" class="tabs__tab" :class="{ 'tabs__tab--active': index === activeTab }"
    @click="active = index" :draggable="tmp >= 0" @dragover.prevent="" @drop="onDragDrop(index)"
    @dragstart="onDragStart(index)" @dragend="dragging = false; tmp = -1">

    <div v-if="tabs.length > 1" class="tabs__tab__handle" @mousedown="tmp = index" @mouseup="tmp = -1" title="drag to move">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-horizontal"
        viewBox="0 0 16 16">
        <path
          d="M2 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
      </svg>
    </div>

    <button :title="'select ' + tab.name" @click="setTab(index)" class="tabs__tab__label">{{
      tab.name }}
    </button>

    <button class="toggle" @click="toggle(tab)" :class="{ 'toggle--active': tab.active }"
      :title="tab.active ? 'Disable folder rules' : 'Enable folder rules'">
      <div class="toggle__text">
        {{ tab.active ? "On" : "Off" }}
      </div>
    </button>
  </div>

</template>

<script setup lang="ts">
import { ref, toRefs, type PropType } from "vue";
import { TabType } from "../interaces";

const props = defineProps({
  tabs: {
    type: Array as PropType<TabType[]>,
    required: true,
  },
  activeTab: {
    type: Number,
    required: true,
  },
});

const propRefs = toRefs(props);
const tabs = propRefs.tabs;
const activeTab = propRefs.activeTab;

const emit = defineEmits(["moveTab", "toggleTab", "setTab"]);

const tmp = ref(-1);
const active = ref(0);
const dragging = ref(false);

function onDragStart(index: number) {
  tmp.value = index;
}

function onDragDrop(index: number) {
  emit("moveTab", tmp.value, index);
  tmp.value = -1;
}

function toggle(tab: any) {
  emit("toggleTab", tab);
}

function setTab(index: number) {
  emit("setTab", index);
}
</script>
