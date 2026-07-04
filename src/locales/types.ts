/**
 * 国际化消息字典的类型定义
 * 确保中英文翻译结构完全一致
 */
export interface LocaleMessages {
  app: {
    error: string;
  };
  folderPanel: {
    folders: string;
    noFolders: string;
    add: string;
    addFolder: string;
    global: string;
    rulesEnabled: string;
    rulesEnabledTooltip: string;
    settings: string;
    globalSettings: string;
    on: string;
    off: string;
  };
  folder: {
    title: string;
    confirmDeletion: string;
    delete: string;
    cancel: string;
    settings: string;
    name: string;
    deleteFolder: string;
    cloneFolder: string;
    disableFolder: string;
    enableFolder: string;
  };
  tab: {
    title: string;
    confirmDeletion: string;
    settings: string;
    name: string;
    requestDomains: string;
    requestDomainsHint: string;
    domainsFallbackHint: string;
    deleteTab: string;
    cloneTab: string;
    requestHeaders: string;
    requestHeadersTooltip: string;
    zeroRequestHeaders: string;
    responseHeaders: string;
    responseHeadersTooltip: string;
    zeroResponseHeaders: string;
    blockRequests: string;
    blockRequestsTooltip: string;
    zeroBlockedRequests: string;
    redirectRequests: string;
    redirectRequestsTooltip: string;
    zeroRedirectRequests: string;
    table: {
      name: string;
      value: string;
      urlFilter: string;
      domains: string;
      note: string;
      type: string;
      destination: string;
    };
    placeholder: {
      headerName: string;
      headerValue: string;
      urlFilter: string;
      domains: string;
      note: string;
      url: string;
    };
    action: {
      delete: string;
      copyToClipboard: string;
    };
    toast: {
      copied: string;
      failed: string;
    };
    dropdown: {
      set: string;
      remove: string;
      assets: string;
      domain: string;
    };
  };
  editor: {
    save: string;
    cancel: string;
  };
  settings: {
    title: string;
    compactMode: string;
    compactModeTooltip: string;
    new: string;
    compactDesc: string;
    disableCompact: string;
    enableCompact: string;
    language: string;
    languageDesc: string;
    export: string;
    exportDesc: string;
    import: string;
    importDesc: string;
    confirmDeletion: string;
    deleteAll: string;
    deleteAllDesc: string;
    deleteAllBtn: string;
    about: string;
    aboutDesc: string;
    linkedIn: string;
    tipJar: string;
    clear: string;
    append: string;
    exportBtn: string;
    invalidFile: string;
    parseFailed: string;
    exportTooLarge: string;
    exportFailed: string;
    help: string;
    helpDesc: string;
    openHelp: string;
    helpContent: {
      title: string;
      overview: string;
      folders: { title: string; body: string };
      rules: { title: string; body: string };
      condition: { title: string; body: string };
      toggle: { title: string; body: string };
      compact: { title: string; body: string };
      exportImport: { title: string; body: string };
    };
  };
  dropdownMenu: {
    yes: string;
    no: string;
  };
  tabDragger: {
    selectTab: string;
    dragToMove: string;
    disableRules: string;
    enableRules: string;
  };
  folderDragger: {
    selectFolder: string;
    dragToMove: string;
    disableRules: string;
    enableRules: string;
  };
  ruleDragger: {
    dragToMove: string;
  };
  operation: {
    set: string;
    setTooltip: string;
    remove: string;
    removeTooltip: string;
  };
  blockType: {
    assets: string;
    assetsTooltip: string;
    domain: string;
    domainTooltip: string;
  };
}

/** 支持的语言代码 */
export type Locale = "zh-CN" | "en";

/** 所有支持的语言列表 */
export const SUPPORTED_LOCALES: Locale[] = ["zh-CN", "en"];

/** 语言显示名称映射 */
export const LOCALE_LABELS: Record<Locale, string> = {
  "zh-CN": "中文",
  en: "English",
};
