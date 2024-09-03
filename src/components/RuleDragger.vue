<template>
  <tr class=""
    :class="{'table__moving': index === tmp, 'table__target': index === tmp }"
    @click="active = index" :draggable="tmp >= 0 && total > 1"
    @dragover.prevent="" @drop="onDragDrop(index)" @dragstart="onDragStart(index)"
    @dragend="dragging = false; setTmp(-1)">
    
    <td class="table__handle">
      <button class="handle" @mousedown="setTmp(index)" @mouseup="setTmp(-1)" title="drag to move" :disabled="total < 2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical"
          viewBox="0 0 16 16">
          <path
            d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
        </svg>

        <!-- {{ tmp }} -->
      </button>
    </td>

    <slot />
  </tr>
</template>

<script setup lang="ts">
import { ref, toRefs, type PropType } from "vue";
// import { FolderType } from "../interaces";

const props = defineProps({
  index: {
    type: Number,
    required: true
  }, 
  tmp: {
    type: Number,
    required: true
  }, 
  total: {
    type: Number,
    required: true
  }, 
});

const propRefs = toRefs(props);
const index = propRefs.index;
const tmp = propRefs.tmp;
const total = propRefs.total;
// const activeFolder = propRefs.activeFolder;

const emit = defineEmits(["onMoveRule", "onSetTmp"]);

// const tmp = ref(-1);
const active = ref(0);
const dragging = ref(false);

function onDragStart(newTmp: number) {
  // tmp.value = index;
  setTmp(newTmp);
}

function onDragDrop(index: number) {
  moveRule(tmp.value, index);
}

function moveRule(from: number, to: number) {
  emit("onMoveRule", from, to);
  // console.log(`moveRule from: ${from}, to: ${to}`);
  setTmp(-1)
}

function setTmp(newTmp: number) {
  emit("onSetTmp", newTmp);
}

// function toggle(folder: any) {
//   emit("toggleActive", folder);
// }

// function setFolder(index: number) {
//   emit("setFolder", index);
// }
</script>
