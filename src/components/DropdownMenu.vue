<template>
  <div ref="root" class="dropdown dropdown--right" :class="{ 'dropdown--open': isOpen }">
    <button @click="toggle" class="btn-icon dropdown__trigger">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
      </svg>
    </button>
    <div v-show="isOpen" class="dropdown__menu">
      <button v-for="option in options" @click="option.action(rule); isOpen = false" class="dropdown__menu__item">
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue";
import type { Ref, PropType } from "vue";

const model = defineModel();
const root: Ref<HTMLElement | null> = ref(null);
const isOpen = ref(false);

interface Option {
  label: string,
  action: Function
}

const props = defineProps({
  options: {
    type:  Array as PropType<Option[]>,
    required: true
  },
  rule: {
    type:  Object,
    required: true
  }
});

const propRefs = toRefs(props);
const options = propRefs.options;


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

function set(val: string | boolean) {
  model.value = val;
  isOpen.value = false;
}

</script>
