<template>
  <div ref="root" class="dropdown dropdown--select" :class="{ 'dropdown--open': isOpen, 'dropdown--up': openUpward }">
    <button @click="handleToggle" class="dropdown__trigger">
      {{ defaultOption?.label }}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
      </svg>
    </button>
    <div v-show="isOpen" class="dropdown__menu">
      <button v-for="(option, index) in options" :key="index" @click="option.action ? option.action() : set(option.value)" class="dropdown__menu__item" :class="{'dropdown__menu__item--active' : model === option.value}">
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from "vue";
import type { Ref, PropType } from "vue";
import { useOutsideClick } from "../composables";

const model = defineModel();
const root: Ref<HTMLElement | null> = ref(null);
const openUpward = ref(false);
const { isOpen, toggle, close } = useOutsideClick(root);

interface Option {
  label: string,
  value: string | boolean,
  action?: Function
}

const props = defineProps({
  options: {
    type:  Array as PropType<Option[]>,
    required: true
  }
});

const propRefs = toRefs(props);
const options = propRefs.options;

const defaultOption = computed(() => {
  if(typeof model.value !== "undefined" && model.value !== "") {
    return options.value.find(option => option.value === model.value)
  }
  
  return options.value[0]
})

/**
 * functions
 */

function handleToggle() {
  // Check if dropdown should open upward before toggling
  if (!isOpen.value && root.value) {
    const rect = root.value.getBoundingClientRect();
    const menuHeight = options.value.length * 30 + 16; // Approximate menu height
    const spaceBelow = window.innerHeight - rect.bottom;
    openUpward.value = spaceBelow < menuHeight && rect.top > menuHeight;
  }
  toggle();
}

function set(val: string | boolean) {
  model.value = val;
  close();
}

</script>
