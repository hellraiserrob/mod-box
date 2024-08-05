<template>
  <div class="dragger" ref="parent">
    <div
     v-for="(item, index) in items"
     class="dragger__item"
     draggable="true"
     @dragstart="onDragStart($event, index)"
     @drop="onDragDrop($event, index)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, toRefs } from "vue";
import type { Ref } from "vue";

const model = defineModel();
const props = defineProps(["placeholder", "locked"]);

const input:Ref<HTMLInputElement | null> = ref(null);
const isEditing = ref(false);

const { placeholder, locked } = toRefs(props);

const items = ref([{ name: "item 1"}, { name: "item 2"}])

const resetValue = model.value;

function onDragStart($event:any, index:number) {
  console.log($event);
  console.log(index);
}

function onDragDrop($event:any, index:number) {
  console.log($event);
  console.log(index);
}
</script>
