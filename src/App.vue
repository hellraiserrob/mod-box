<template>
  <div>
    <div v-if="error" class="error error--top">
      {{ t("app.error") }}
    </div>
    <FolderPanel
      v-if="data.folders"
      :data="data"
      :totalActiveRules="totalActiveRules"
      @toggleGlobalActive="toggleGlobalActive"
      @reset="reset"
      @importFolders="importFolders"
      @compactChanged="saveCompact"
      @activeFolderChanged="saveActiveFolder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, watch } from "vue";
import type { Ref } from "vue";

import { DataType, FolderType } from "./interfaces";
import { generateRules, isChrome } from "./utils";
import { detectLocale, SUPPORTED_LOCALES } from "./locales";
import type { Locale } from "./locales";
import { LOCALE_KEY } from "./composables";
import { getMessage } from "./locales";

import FolderPanel from "./components/FolderPanel.vue";

/**
 * Default data structure
 */
const fallbackData: DataType = {
  active: true,
  folders: [
    {
      name: "Default folder",
      active: true,
      tabs: [
        {
          name: "Default tab",
          active: true,
          requestDomains: "",
          requestHeaders: [],
          responseHeaders: [],
          blockedRequests: [],
          redirectRequests: [],
        },
      ],
    },
  ],
};

/**
 * Reactive state
 */
const data: Ref<DataType> = ref({
  active: true,
  folders: [],
});

const totalActiveRules = ref(0);
const error = ref(false);

/**
 * i18n 初始化
 * 优先级：chrome.storage > localStorage > 浏览器语言自动检测
 */
const locale: Ref<Locale> = ref(detectLocale());
provide(LOCALE_KEY, locale);

// 在 provide 之后创建 i18n 实例供本组件使用
const { t } = {
  t(path: string, params?: Record<string, string | number>) {
    return getMessage(locale.value, path, params);
  },
};

/**
 * 将当前语言偏好持久化到 chrome.storage 或 localStorage
 * chrome 环境下失败静默处理，不影响用户体验
 *
 * @param newLocale - 当前 locale 值
 */
function saveLocale(newLocale: Locale) {
  if (isChrome) {
    chrome.storage.local.set({ locale: newLocale }).then(() => {
      console.log("Chrome storage locale set");
    });
  } else {
    window.localStorage.setItem("locale", newLocale);
  }
}

/**
 * 从 storage 恢复已保存的语言偏好
 * 如果用户之前手动切换过则覆盖浏览器的自动检测结果
 * 提升：chrome.storage.local 需要异步读取，非 chrome 环境从 localStorage 读取
 */
async function loadLocale() {
  let storedLocale: string | null | undefined;

  if (isChrome) {
    const chromeData = await chrome.storage.local.get(["locale"]);
    storedLocale = chromeData.locale;
  } else {
    storedLocale = window.localStorage.getItem("locale");
  }

  if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale as Locale)) {
    locale.value = storedLocale as Locale;
  }
}

/**
 * Event handlers from FolderPanel
 */
function toggleGlobalActive() {
  data.value.active = !data.value.active;
}

function reset() {
  data.value = structuredClone(fallbackData);
}

function importFolders(folders: FolderType[]) {
  data.value.folders.push(...folders);
}

function saveCompact(compact: boolean) {
  if (isChrome) {
    chrome.storage.local.set({ compact: `${compact}` }).then(() => {
      console.log("Chrome storage compact set");
    });
  } else {
    window.localStorage.setItem("compact", `${compact}`);
  }
}

function saveActiveFolder(index: number, saveTab: boolean) {
  if (isChrome) {
    chrome.storage.local.set({ activeFolder: `${index}` }).then(() => {
      console.log("Chrome storage activeFolder set");
    });
    if (saveTab) {
      chrome.storage.local.set({ activeTab: "0" }).then(() => {
        console.log("Chrome storage activeTab set");
      });
    }
  } else {
    window.localStorage.setItem("activeFolder", `${index}`);
    if (saveTab) {
      window.localStorage.setItem("activeTab", "0");
    }
  }
}

/**
 * Data persistence
 */
async function save() {
  const activeRules = generateRules(data.value);
  totalActiveRules.value = activeRules.length;

  if (isChrome) {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map((rule: any) => rule.id);

    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: activeRules,
      });
      error.value = false;
    } catch (e) {
      error.value = true;
      console.error(e);
    }

    chrome.storage.local.set({ rules: JSON.stringify(data.value) });
    chrome.storage.local.set({ totalActiveRules: `${activeRules.length}` });

    // Update badge
    chrome.action.setBadgeBackgroundColor({ color: "blue" });
    chrome.action.setBadgeText({
      text: totalActiveRules.value > 0 ? `${totalActiveRules.value}` : "",
    });
  } else {
    window.localStorage.setItem("rules", JSON.stringify(data.value));
  }
}

async function loadData() {
  if (isChrome) {
    const chromeData = await chrome.storage.local.get(["rules"]);
    if (chromeData.rules) {
      data.value = JSON.parse(chromeData.rules);
    } else {
      data.value = fallbackData;
    }
  } else {
    const rules = window.localStorage.getItem("rules");
    if (rules) {
      data.value = JSON.parse(rules);
    } else {
      data.value = fallbackData;
    }
  }
}

/**
 * Watchers
 */
watch(
  () => data,
  () => save(),
  { deep: true }
);

// 监听 locale 变更并持久化
watch(locale, (newLocale) => saveLocale(newLocale));

/**
 * Lifecycle
 */
onMounted(async () => {
  await loadLocale();
  loadData();
});
</script>
