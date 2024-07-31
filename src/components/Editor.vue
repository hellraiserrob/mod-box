<template>
  <div v-if="!isEditing" @click="edit">{{ model || "Click to add" }}</div>
  <div v-show="isEditing" class="field field--table">
    <input ref="input" @blur="isEditing = false" class="field__input" type="text" v-model="model" :placeholder="placeholder" />
  </div>  
</template>

<script setup>
import { ref, nextTick } from "vue"

const model = defineModel()
const props = defineProps(['folder'])

const input = ref(null)
const isEditing = ref(false); 
const { placeholder } = props;

function edit() {
  isEditing.value = true;
  console.log(input.value);
  
  nextTick(() => {
    input.value.focus()
  })
}

</script>