<template>
  <div class="tooltip">
    <div v-if="!trigger" class="tooltip__trigger">
      ?
    </div>
    <div v-else class="tooltip__trigger">
      + {{ trigger }}
    </div>
    <div class="tooltip__window">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  trigger: {
    type: Number,
    required: false,
  },
});

const trigger = props.trigger

</script>
