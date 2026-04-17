<template>
  <div class="editor" :class="{'editor--align-right': aligned === 'right', 'editor--open': isEditing && aligned === 'right'}">
    <button
      v-if="!domains && !icon"
      @click="edit"
      class="editor__trigger"
      :class="{
        'editor__trigger--locked': locked,
        'editor__trigger--fallback': fallback && !model,
      }"
      :title="model || fallback || ''"
    >
      {{ model || fallback || "-" }}
    
    </button>

    <button
      v-if="icon"
      @click="edit"
      class="editor__trigger editor__trigger--icon"
      :title="model || ''"
    >
      <svg v-if="model" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
      </svg>
      <template v-else>-</template>
    </button>

    <div v-if="domains && splitDomains" class="editor__domains">
      <button
        v-if="splitDomains.length > 0"
        @click="edit"
        class="editor__trigger editor__trigger--chip"
        :class="{'editor__trigger--chip--placeholder': model === '' && typeof fallback === 'string'}"
        :title="cleanDomain(splitDomains[0])"
      >
        {{ cleanDomain(splitDomains[0]) }}
      </button>

      <Tooltip v-if="splitDomains.length > 1" :trigger="splitDomains.length - 1">
        <div v-for="(domain, idx) in splitDomains" :key="idx">{{ cleanDomain(domain) }}</div>
      </Tooltip>
      
      <button v-if="!splitDomains.length" @click="edit" class="editor__trigger">
        -
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-pencil"
          viewBox="0 0 16 16"
        >
          <path
            d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"
          />
        </svg>
      </button>
    </div>

    <div v-show="isEditing" class="editor__modal">
      <div class="field">
        <label v-if="label" for="" class="field__label">{{label}}</label>
        <textarea
          ref="input"
          @keydown.enter.prevent="save"
          @keydown.esc="cancel"
          @blur="save"
          class="field__input"
          type="text"
          v-model="localValue"
          :placeholder="placeholder"
          rows="2"
        ></textarea>
      </div>
      <div style="margin-top: 10px; display: flex; gap: 2px;">
        <button class="btn button--primary" @click="save">Save</button>
        <button class="btn button--secondary" @click="cancel" style="border-color: transparent; box-shadow: none">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, toRefs, computed } from "vue";
import type { Ref } from "vue";
import { cleanDomain } from "../utils";

import Tooltip from "./Tooltip.vue";

const model = defineModel<string>();
const props = defineProps(["placeholder", "locked", "fallback", "domains", "label", "aligned", "icon"]);

const input: Ref<HTMLTextAreaElement | null> = ref(null);
const isEditing = ref(false);
const localValue = ref(model.value || "");

const { placeholder, locked, fallback } = toRefs(props);

function edit() {
  localValue.value = model.value || "";
  isEditing.value = true;

  nextTick(() => {
    if (input.value) {
      input.value.focus();
    }
  });
}

function save() {
  model.value = localValue.value;
  isEditing.value = false;
}

function cancel() {
  localValue.value = model.value || "";
  isEditing.value = false;
}

const splitDomains = computed(() => {
  if (!props.domains || typeof model.value !== "string" || (model.value === "" && typeof fallback === undefined)) {
    return [];
  }

  // 

  if(model.value === "" && typeof fallback?.value === "string") {
    if(fallback?.value === "") {
      return [];
    }
    return fallback.value.split(",")
  }

  return model.value.split(",");
});
</script>
