<template>
  <div ref="root" class="dropdown dropdown--right" :class="{ 'dropdown--open': isOpen }">
    <button @click="toggle" class="btn-icon dropdown__trigger" :class="{ 'btn-icon--active': isOpen }">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
      </svg>
    </button>
    <div v-show="isOpen" class="dropdown__menu">
      <div v-for="(option, index) in options" :key="index" class="dropdown__menu__wrapper">
        <button @click="handleClick(option, index, false)" class="dropdown__menu__item">
          {{ option.label }}
        </button>
        <div v-if="option.confirm" :class="{'dropdown__menu__item__confirm--active': confirmationOpen === index}" class="dropdown__menu__item__confirm">
          <div class="btn-group">
            <button class="btn btn--danger" @click="handleClick(option, index, true)">Yes</button>
            <button class="btn" @click="confirmationOpen = -1">No</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from "vue";
import type { Ref, PropType } from "vue";
import { useOutsideClick } from "../composables";

const root: Ref<HTMLElement | null> = ref(null);
const { isOpen, toggle, close } = useOutsideClick(root);
const confirmationOpen = ref(-1);

// Reset confirmation when dropdown closes
watch(isOpen, (newVal) => {
  if (!newVal) {
    confirmationOpen.value = -1;
  }
});

interface Option {
  label: String,
  action: Function,
  confirm?: Boolean
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
const rule = propRefs.rule;


/**
 * functions
 */

function handleClick(option: Option, index: number, override: Boolean) {
  if(option.confirm && !override) {
    confirmationOpen.value = index;
  }
  else {
    confirmationOpen.value = -1;
    option.action(rule.value);
    close();
  }
 }

</script>
