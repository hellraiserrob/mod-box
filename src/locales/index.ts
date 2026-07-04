import type { LocaleMessages } from "./types";
import type { Locale } from "./types";
export type { LocaleMessages, Locale };
import { SUPPORTED_LOCALES, LOCALE_LABELS } from "./types";
export { SUPPORTED_LOCALES, LOCALE_LABELS };
import zhCN from "./zh-CN";
import en from "./en";

/** 所有语言包的映射表 */
const messages: Record<Locale, LocaleMessages> = {
  "zh-CN": zhCN,
  en,
};

/**
 * 从浏览器语言自动检测最佳匹配的 locale
 * 优先精确匹配，否则回退到首个支持的语言（en）
 */
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";

  const browserLang = navigator.language;
  // 精确匹配
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === browserLang) return locale;
  }
  // 前缀匹配（例如 zh 匹配 zh-CN）
  const baseLang = browserLang.split("-")[0];
  for (const locale of SUPPORTED_LOCALES) {
    if (locale.startsWith(baseLang)) return locale;
  }
  return "en";
}

/**
 * 深层获取翻译文本
 * 支持点号路径，如 "folder.title" 对应 messages.folder.title
 *
 * @param locale - 语言代码
 * @param path - 用点号连接的翻译路径
 * @param params - 可选插值参数，如 { name: "foo" }
 * @returns 翻译后的字符串，未找到时返回路径本身
 */
export function getMessage(locale: Locale, path: string, params?: Record<string, string | number>): string {
  const msg = messages[locale];
  if (!msg) return path;

  const keys = path.split(".");
  let result: unknown = msg;

  for (const key of keys) {
    if (result && typeof result === "object" && key in (result as Record<string, unknown>)) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  if (typeof result !== "string") return path;

  // 插值替换
  if (params) {
    return result.replace(/\{(\w+)\}/g, (_, key: string) => {
      return String(params[key] ?? `{${key}}`);
    });
  }

  return result;
}

export { messages };
