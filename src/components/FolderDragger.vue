<template>
  <div v-for="(folder, index) in folders" class="folders__list__item"
    :class="{ 
      'folders__list__item--active': index === activeFolder && !showSettings,
      'folders__list__item--bottom': index === target && target > tmp && target !== tmp,
      'folders__list__item--top': index === target && target < tmp,
      'folders__list__item--compact': compact,
      'folders__list__item--disabled': !folder.active,
    }"
    @click="active = index"
    :draggable="tmp >= 0"
    @dragover.prevent="target = index"
    @drop="onDragDrop(index)"
    @dragstart="onDragStart(index)"
    @dragend="dragging = false; tmp = -1; target = -1"
    @dragenter="target = index"
  >
    <button :title="'select ' + folder.name" @click="setFolder(index)" class="folders__list__item__label">{{
      name(folder) }}</button>

    <div v-if="folders.length > 1 && !compact" class="folders__list__item__handle" @mousedown="tmp = index" @mouseup="tmp = -1" title="drag to move">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical"
        viewBox="0 0 16 16">
        <path
          d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
      </svg>
    </div>

    <button v-if="!compact" class="toggle" @click="toggle(folder)" :class="{ 'toggle--active': folder.active }"
      :title="folder.active ? 'Disable folder rules' : 'Enable folder rules'">
      <div class="toggle__text">
        {{ folder.active ? "On" : "Off" }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, type PropType } from "vue";
import { FolderType } from "../interaces";

const props = defineProps({
  folders: {
    type: Array as PropType<FolderType[]>,
    required: true,
  },
  activeFolder: {
    type: Number,
    required: true,
  },
  showSettings: {
    type: Boolean,
    required: true,
  },
  compact: {
    type: Boolean,
    required: true,
  },
});

const propRefs = toRefs(props);
const folders = propRefs.folders;
const activeFolder = propRefs.activeFolder;
const compact = propRefs.compact;

const emit = defineEmits(["moveFolder", "toggleActive", "setFolder"]);

const tmp = ref(-1);
const target = ref(-1);
const active = ref(0);
const dragging = ref(false);

function onDragStart(index: number) {
  tmp.value = index;
}

function onDragDrop(index: number) {
  switcher(tmp.value, index);
}

function switcher(from: number, to: number) {
  emit("moveFolder", from, to);
  tmp.value = -1;
}

function toggle(folder: any) {
  emit("toggleActive", folder);
}

function setFolder(index: number) {
  emit("setFolder", index);
}

function name(folder:FolderType) {
  if(compact.value) {
    const words = folder.name.split(" ");
    let letters = "";
    
    words.forEach(word => {
      letters += word.substring(0,1)
    })

    return letters.substring(0,2)
  }

  return folder.name
}
</script>
