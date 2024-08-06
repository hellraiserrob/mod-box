<template>
  <div class="dragger" ref="parent">
    {{ tmp >= 0 }}
    <div
      v-for="(item, index) in items"
      class="dragger__item"
      :class="{ 'dragger__item--active': active === index }"
      @click="active = index"
      :draggable="tmp >= 0"
      @dragover.prevent=""
      @drop="onDragDrop($event, index)"
      @dragstart="onDragStart($event, index)"
      @dragend="dragging = false; tmp = -1"
    >
      <div
        class="dragger__item__handle"
        @mousedown="tmp = index"  
        @mouseup="tmp = -1"  
      ></div>
      {{ item.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tmp = ref(-1);
const active = ref(0);
const dragging = ref(false);
const items = ref([{ name: "item 1" }, { name: "item 2" }, { name: "item 3" }]);

// const resetValue = model.value;

function onDragStart($event: any, index: number) {
  // console.log($event);
  // dragging.value = true;
  tmp.value = index;
  console.log(`dragStart ${index}`);
}

function onDragDrop($event: any, index: number) {
  // console.log($event);
  console.log(`dragDrop ${index}`);

  switcher(tmp.value, index);
}

function switcher(from: number, to: number) {
  const target = items.value[from];

  items.value.splice(from, 1);
  items.value.splice(to, 0, target);
  active.value = to;
  tmp.value = -1;
}
</script>
