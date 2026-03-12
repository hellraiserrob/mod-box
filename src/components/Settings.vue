<template>
  <div>
    <div class="folder__header mb10">
      <h3>Settings</h3>
    </div>

    <!-- Compact Mode -->
    <div class="panel panel--large mb20">
      <h3 class="mb10">Compact mode <div class="tag">New</div></h3>
      <p class="mb20">
        If you need a bit more space to work with your rules, compact mode reduces the left hand column width.
      </p>

      <div class="panel__actions">
        <button @click="$emit('toggleCompact')" class="btn">
          {{ compact ? "Disable compact mode" : "Enable compact mode" }}
        </button>
      </div>
    </div>

    <!-- Export -->
    <div class="panel panel--large mb20">
      <h3 class="mb10">
        Export
        <div class="tag">New</div>
      </h3>
      <p class="mb20">
        You can export your rules into .json packages to backup, or send
        to friends/colleagues. Check the folders you want and click
        export.
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
          Export
        </button>
      </div>
    </div>

    <!-- Import -->
    <div class="panel panel--large mb20">
      <h3 class="mb10">
        Import
        <div class="tag">New</div>
      </h3>
      <p class="mb20">
        You can select and import modbox backup files and append them to
        your current set of folders, tabs and rules.
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
          Clear
        </button>
        <button
          class="btn"
          @click="appendImported"
          :disabled="!selectedImport.length"
        >
          Append
        </button>
      </div>
    </div>

    <!-- Delete All -->
    <div class="panel panel--large mb20">
      <div v-if="showDeleteConfirmation" class="panel__modal">
        <h3 class="mb10">Confirm rules deletion</h3>
        <div class="panel__modal__actions">
          <button class="btn btn--danger" @click="confirmReset">Delete</button>
          <button class="btn" @click="showDeleteConfirmation = false">
            Cancel
          </button>
        </div>
      </div>

      <h3 class="mb10">Delete all rules</h3>
      <p class="mb20">
        If you want to totally reset all of your rules. This cannot be
        undone so please use carefully.
      </p>

      <div class="panel__actions">
        <button @click="showDeleteConfirmation = true" class="btn">
          Delete all
        </button>
      </div>
    </div>

    <!-- About -->
    <div class="panel panel--large">
      <h3 class="mb10">About</h3>
      <p class="mb20">
        ModBox is a hobby project with the aim of providing developers and
        hackers a tool for testing and debugging.
      </p>

      <div class="panel__actions">
        <a
          href="https://www.linkedin.com/in/frontendrob/"
          class="btn"
          target="_blank"
        >
          My LinkedIn
        </a>
        <a
          href="https://www.buymeacoffee.com/robphillips"
          class="btn"
          target="_blank"
        >
          Tip Jar
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from "vue";
import type { Ref } from "vue";
import { FolderType, isValidExportPayload } from "../interfaces";

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
      exportError.value = "Export data is too large. Try selecting fewer folders.";
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
    exportError.value = "Failed to export rules. Please try again.";

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
        importError.value = "Invalid file format. Please select a valid ModBox backup file.";
        return;
      }

      importData.value = payload.folders;
      importError.value = "";
    } catch {
      importError.value = "Failed to parse file. Please ensure it's a valid JSON file.";
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
