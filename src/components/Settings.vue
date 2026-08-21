<template>
  <div>
    <div class="folder__header mb10">
      <h3>{{ t("settings.title") }}</h3>
    </div>

    <!-- Compact Mode -->
    <div class="panel panel--large mb20">
      <h3 class="mb10" :title="t('settings.compactModeTooltip')">
        {{ t("settings.compactMode") }} <div class="tag">{{ t("settings.new") }}</div>
      </h3>
      <p class="mb20">
        {{ t("settings.compactDesc") }}
      </p>

      <div class="panel__actions">
        <button @click="$emit('toggleCompact')" class="btn">
          {{ compact ? t("settings.disableCompact") : t("settings.enableCompact") }}
        </button>
      </div>
    </div>

    <!-- Language -->
    <div class="panel panel--large mb20">
      <h3 class="mb10">{{ t("settings.language") }} <div class="tag">{{ t("settings.new") }}</div></h3>
      <p class="mb20">{{ t("settings.languageDesc") }}</p>

      <div class="panel__actions btn-group">
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          class="btn"
          :class="{ 'btn--primary': locale === loc.code }"
          @click="changeLocale(loc.code)"
        >
          {{ loc.label }}
        </button>
      </div>
    </div>

    <!-- Export -->
    <div class="panel panel--large mb20">
      <h3 class="mb10">
        {{ t("settings.export") }}
        <div class="tag">{{ t("settings.new") }}</div>
      </h3>
      <p class="mb20">
        {{ t("settings.exportDesc") }}
      </p>

      <div class="mb20">
        <label
          class="checkbox"
          :class="{ 'checkbox--active': selectedExport.includes(index) }"
          v-for="(folder, index) in folders"
          :key="`export-${index}`"
        >
          <input
            type="checkbox"
            v-model="selectedExport"
            :value="index"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-check"
            viewBox="0 0 16 16"
          >
            <path
              d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"
            />
          </svg>
          {{ folder.name }}
        </label>
      </div>

      <div v-if="exportError.length > 0" class="error mb20">
        {{ exportError }}
      </div>

      <div class="panel__actions">
        <button
          class="btn"
          @click="download"
          :disabled="!selectedExport.length"
        >
          {{ t("settings.exportBtn") }}
        </button>
      </div>
    </div>

    <!-- Import -->
    <div class="panel panel--large mb20">
      <h3 class="mb10">
        {{ t("settings.import") }}
        <div class="tag">{{ t("settings.new") }}</div>
      </h3>
      <p class="mb20">
        {{ t("settings.importDesc") }}
      </p>

      <div class="mb20">
        <input
          type="file"
          ref="fileupload"
          accept=".json"
          @change="onFileChange($event)"
          class="file-upload"
        />
      </div>

      <div v-if="importData.length" class="mb20">
        <label
          class="checkbox"
          :class="{ 'checkbox--active': selectedImport.includes(index) }"
          v-for="(folder, index) in importData"
          :key="`import-${index}`"
        >
          <input
            type="checkbox"
            v-model="selectedImport"
            :value="index"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-check"
            viewBox="0 0 16 16"
          >
            <path
              d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"
            />
          </svg>
          {{ folder.name }}
        </label>
      </div>

      <div v-if="importError.length > 0" class="error mb20">
        {{ importError }}
      </div>

      <div class="panel__actions btn-group">
        <button
          class="btn"
          @click="clearImported"
          :disabled="!importData.length"
        >
          {{ t("settings.clear") }}
        </button>
        <button
          class="btn"
          @click="appendImported"
          :disabled="!selectedImport.length"
        >
          {{ t("settings.append") }}
        </button>
      </div>
    </div>

    <!-- Help -->
    <div class="panel panel--large mb20">
      <h3 class="mb10">{{ t("settings.help") }} <div class="tag">{{ t("settings.new") }}</div></h3>
      <p class="mb20">{{ t("settings.helpDesc") }}</p>

      <div class="panel__actions">
        <button @click="showHelp = true" class="btn">
          {{ t("settings.openHelp") }}
        </button>
      </div>

      <!-- Help Modal -->
      <div v-if="showHelp" class="panel__modal">
        <div class="help-content help-content--panel">
          <h3 class="mb15">{{ t("settings.helpContent.title") }}</h3>

          <p class="mb15">{{ t("settings.helpContent.overview") }}</p>

          <h4 class="mb10">{{ t("settings.helpContent.folders.title") }}</h4>
          <p class="mb15">{{ t("settings.helpContent.folders.body") }}</p>

          <h4 class="mb10">{{ t("settings.helpContent.rules.title") }}</h4>
          <p class="mb15">{{ t("settings.helpContent.rules.body") }}</p>

          <h4 class="mb10">{{ t("settings.helpContent.condition.title") }}</h4>
          <p class="mb15">{{ t("settings.helpContent.condition.body") }}</p>

          <h4 class="mb10">{{ t("settings.helpContent.toggle.title") }}</h4>
          <p class="mb15">{{ t("settings.helpContent.toggle.body") }}</p>

          <h4 class="mb10">{{ t("settings.helpContent.compact.title") }}</h4>
          <p class="mb15">{{ t("settings.helpContent.compact.body") }}</p>

          <h4 class="mb10">{{ t("settings.helpContent.exportImport.title") }}</h4>
          <p class="mb15">{{ t("settings.helpContent.exportImport.body") }}</p>

          <div class="panel__modal__actions">
            <button class="btn" @click="showHelp = false">
              {{ t("folder.cancel") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete All -->
    <div class="panel panel--large mb20">
      <div v-if="showDeleteConfirmation" class="panel__modal">
        <h3 class="mb10">{{ t("settings.confirmDeletion") }}</h3>
        <div class="panel__modal__actions">
          <button class="btn btn--danger" @click="confirmReset">{{ t("folder.delete") }}</button>
          <button class="btn" @click="showDeleteConfirmation = false">
            {{ t("folder.cancel") }}
          </button>
        </div>
      </div>

      <h3 class="mb10">{{ t("settings.deleteAll") }}</h3>
      <p class="mb20">
        {{ t("settings.deleteAllDesc") }}
      </p>

      <div class="panel__actions">
        <button @click="showDeleteConfirmation = true" class="btn">
          {{ t("settings.deleteAllBtn") }}
        </button>
      </div>
    </div>

    <!-- About -->
    <div class="panel panel--large">
      <h3 class="mb10">{{ t("settings.about") }}</h3>
      <p class="mb20">
        {{ t("settings.aboutDesc") }}
      </p>

      <div class="panel__actions">
        <a
          href="https://www.linkedin.com/in/frontendrob/"
          class="btn"
          target="_blank"
        >
          {{ t("settings.linkedIn") }}
        </a>
        <a
          href="https://www.buymeacoffee.com/robphillips"
          class="btn"
          target="_blank"
        >
          {{ t("settings.tipJar") }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, type PropType } from "vue";
import { FolderType, isValidExportPayload } from "../interfaces";
import { LOCALE_KEY, useI18n } from "../composables";
import type { Locale } from "../locales";
import { SUPPORTED_LOCALES, LOCALE_LABELS } from "../locales";
import type { Ref } from "vue";

const { t } = useI18n();

const locale = inject<Ref<Locale>>(LOCALE_KEY);

/** 可选的语言列表 */
const availableLocales = computed(() =>
  SUPPORTED_LOCALES.map((code) => ({
    code,
    label: LOCALE_LABELS[code],
  }))
);

const props = defineProps({
  folders: {
    type: Array as PropType<FolderType[]>,
    required: true,
  },
  compact: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  toggleCompact: [];
  reset: [];
  importFolders: [folders: FolderType[]];
}>();

/**
 * Reactive state
 */
const fileupload: Ref<HTMLFormElement | null> = ref(null);
const selectedExport: Ref<number[]> = ref([]);
const selectedImport: Ref<number[]> = ref([]);
const importData: Ref<FolderType[]> = ref([]);
const exportError = ref("");
const importError = ref("");
const showDeleteConfirmation = ref(false);
const showHelp = ref(false);

/**
 * 切换界面语言并持久化到 storage
 * 因为 locale 是一个 provide 进来的 Ref，修改它在 App.vue 会被 watch 到并自动保存
 * 此处额外保存一次以确保 chrome.storage 同步（跨 popup 实例可见）
 *
 * @param newLocale - 目标语言代码
 */
function changeLocale(newLocale: Locale) {
  if (!locale) return;
  locale.value = newLocale;

  // 持久化到 storage
  if (typeof chrome !== "undefined" && chrome?.storage) {
    chrome.storage.local.set({ locale: newLocale });
  } else {
    window.localStorage.setItem("locale", newLocale);
  }
}

/**
 * Export functionality
 *
 * Uses a DOM anchor-click approach to trigger a file download.
 * Hardened with:
 * - try/catch for error resilience
 * - URL.revokeObjectURL cleanup to prevent memory leaks
 * - Data size guard to avoid allocating excessive Blobs
 * - Deferred click via setTimeout for popup-lifecycle stability on Linux
 */
const MAX_EXPORT_SIZE = 50_000_000; // 50 MB safety threshold

function download() {
  if (!selectedExport.value.length) return;

  exportError.value = "";
  let url: string | null = null;
  let anchor: HTMLAnchorElement | null = null;

  try {
    const exportData: FolderType[] = [];

    props.folders.forEach((folder: FolderType, index: number) => {
      if (selectedExport.value.includes(index)) {
        exportData.push(folder);
      }
    });

    const payload = {
      name: "modbox",
      version: 1,
      folders: exportData,
    };

    const json = JSON.stringify(payload);

    if (json.length > MAX_EXPORT_SIZE) {
      exportError.value = t("settings.exportTooLarge");
      return;
    }

    const blob = new Blob([json], { type: "application/json" });
    url = URL.createObjectURL(blob);
    anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `modbox-export-${Math.floor(Date.now() / 1000)}.json`;
    document.body.appendChild(anchor);

    // Defer the click to the next frame so the browser has time to fully
    // attach the anchor. This improves reliability in Chrome extension
    // popups, especially on Linux where popup teardown can be aggressive.
    const currentUrl = url;
    const currentAnchor = anchor;

    setTimeout(() => {
      try {
        currentAnchor.click();
      } catch {
        // Click may fail if popup is closing — non-fatal
      } finally {
        if (currentAnchor.parentNode) {
          document.body.removeChild(currentAnchor);
        }
      }

      // Give the browser time to initiate the download before revoking
      setTimeout(() => {
        URL.revokeObjectURL(currentUrl);
      }, 3000);
    }, 0);

    selectedExport.value = [];
  } catch (e) {
    exportError.value = t("settings.exportFailed");

    // Cleanup on error
    if (anchor?.parentNode) {
      document.body.removeChild(anchor);
    }
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}

/**
 * Import functionality
 */
function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const fr = new FileReader();

  fr.onload = (event) => {
    try {
      const result = event.target?.result;
      if (typeof result !== 'string') return;

      const payload = JSON.parse(result);

      if (!isValidExportPayload(payload)) {
        importError.value = t("settings.invalidFile");
        return;
      }

      importData.value = payload.folders;
      importError.value = "";
    } catch {
      importError.value = t("settings.parseFailed");
    }
  };
  fr.readAsText(file);
}

function clearImported() {
  if (fileupload.value) {
    fileupload.value.value = "";
  }

  importError.value = "";
  importData.value = [];
  selectedImport.value = [];
}

function appendImported() {
  const selectedFolders: FolderType[] = [];

  importData.value.forEach((folder: FolderType, index: number) => {
    if (selectedImport.value.includes(index)) {
      selectedFolders.push(folder);
    }
  });

  emit("importFolders", selectedFolders);
  clearImported();
}

/**
 * Reset functionality
 */
function confirmReset() {
  emit("reset");
  showDeleteConfirmation.value = false;
}
</script>
