import { ref, onUnmounted, inject, type Ref, type InjectionKey } from 'vue';
import { getMessage, type Locale } from '../locales';

/**
 * Composable for handling dropdown/modal outside click behavior
 * Provides toggle, open, close functions and isOpen state with automatic cleanup
 */
export function useOutsideClick(rootRef: Ref<HTMLElement | null>) {
  const isOpen = ref(false);

  function outsideClick(e: MouseEvent) {
    if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
      close();
    }
  }

  function open() {
    isOpen.value = true;
    window.addEventListener('click', outsideClick);
  }

  function close() {
    isOpen.value = false;
    window.removeEventListener('click', outsideClick);
  }

  function toggle() {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('click', outsideClick);
  });

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

/** i18n 注入键：当前 locale */
export const LOCALE_KEY: InjectionKey<Ref<Locale>> = Symbol("locale");

/**
 * i18n composable
 * 提供翻译函数 t()，支持路径和插值参数
 *
 * @returns {{ t: (path: string, params?: Record<string, string | number>) => string }}
 */
export function useI18n() {
  const locale = inject<Ref<Locale>>(LOCALE_KEY);

  /**
   * 获取翻译文本
   *
   * @param path - 用点号连接的翻译路径，如 "folder.title"
   * @param params - 可选插值参数，如 { name: "foo" }
   * @returns 翻译后的字符串
   */
  function t(path: string, params?: Record<string, string | number>): string {
    if (!locale) {
      // 在 provide 初始化之前调用时，使用浏览器语言作为回退
      const fallbackLocale: Locale =
        typeof navigator !== "undefined" && navigator.language.startsWith("zh")
          ? "zh-CN"
          : "en";
      return getMessage(fallbackLocale, path, params);
    }
    return getMessage(locale.value, path, params);
  }

  return { t };
}

