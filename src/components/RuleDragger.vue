<template>
  <tr class=""
    :class="{
      'table__moving': index === tmp,
      'table__target--bottom': index === target && target > tmp && target !== tmp,
      'table__target--top': index === target && target < tmp
    }"
    @click="active = index" :draggable="tmp >= 0 && total > 1"
    @dragover.prevent="setTarget(index)"
    @dragstart="onDragStart(index)"
    @drop="onDragDrop(index)"
    @dragend="dragging = false; setTmp(-1); setTarget(-1)"
    @dragenter="setTarget(index)"
    >
    
    <td class="table__handle">
      <button class="handle" @mousedown="setTmp(index)" @mouseup="setTmp(-1)" :title="total > 1 ? 'drag to move' : ''" :disabled="total < 2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical"
          viewBox="0 0 16 16">
          <path
            d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0M7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
        </svg>
      </button>
    </td>

    <slot />
  </tr>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue";

const props = defineProps({
  index: {
    type: Number,
    required: true
  }, 
  tmp: {
    type: Number,
    required: true
  },
  target: {
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
const target = propRefs.target;
const total = propRefs.total;
// const activeFolder = propRefs.activeFolder;

const emit = defineEmits(["onMoveRule", "onSetTmp", "onSetTarget"]);

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

function setTarget(newTarget: number) {
  emit("onSetTarget", newTarget);
}
</script>
