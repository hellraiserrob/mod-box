<template>
  <div ref="root" class="dropdown" :class="{ 'dropdown--open': isOpen }">
    <button @click="toggle" class="dropdown__trigger">
      {{ model || "set" }}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
      </svg>
    </button>
    <div v-show="isOpen" class="dropdown__menu">
      <button @click="set('set')" class="dropdown__menu__item" :class="{'dropdown__menu__item--active' : model === 'set'}">set</button>
      <button @click="set('remove')" class="dropdown__menu__item" :class="{'dropdown__menu__item--active' : model === 'remove'}">
        remove
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";

const model = defineModel();
const root: Ref<HTMLElement | null> = ref(null);
const isOpen = ref(false);


/**
 * functions
 */

function toggle() {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    window.addEventListener("click", outsideClick)
  } else {
    window.removeEventListener("click", outsideClick)
  }
}

function close() {
  isOpen.value = false;
  window.removeEventListener("click", outsideClick)
}

function outsideClick(e: any) {
  if (!root.value?.contains(e.target)) {
    close();
  }
}

function set(val: string) {
  model.value = val;
  isOpen.value = false;
}

</script>
