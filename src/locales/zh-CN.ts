import type { LocaleMessages } from "./types";

/**
 * 简体中文翻译字典
 */
const zhCN: LocaleMessages = {
  app: {
    error: "设置规则时出错，是否使用了无效的标头名称？",
  },

  folderPanel: {
    folders: "文件夹",
    noFolders: "暂无文件夹",
    add: "添加",
    addFolder: "添加文件夹",
    global: "全局",
    rulesEnabled: "规则已启用",
    rulesEnabledTooltip:
      "全局开关：关闭后所有规则将暂停生效，开关下的数字代表当前生效的规则数量",
    settings: "设置",
    globalSettings: "全局设置",
    on: "开",
    off: "关",
  },

  folder: {
    title: "文件夹（{name}）",
    confirmDeletion: "确认删除文件夹",
    delete: "删除",
    cancel: "取消",
    settings: "文件夹设置",
    name: "文件夹名称",
    deleteFolder: "删除文件夹",
    cloneFolder: "克隆文件夹",
    disableFolder: "停用文件夹",
    enableFolder: "启用文件夹",
  },

  tab: {
    title: "标签页（{name}）",
    confirmDeletion: "确认删除标签页",
    settings: "标签页设置",
    name: "标签页名称",
    requestDomains: "标签页请求域名",
    requestDomainsHint: "单个域名或多域名（逗号分隔）",
    domainsFallbackHint: "— 适用于该标签页下所有规则，除非被单独覆盖",
    deleteTab: "删除标签页",
    cloneTab: "克隆标签页",
    requestHeaders: "请求标头",
    requestHeadersTooltip:
      "修改发出的 HTTP 请求标头：可设置新值或移除已有标头，支持按 URL 过滤和域名筛选",
    zeroRequestHeaders: "暂无请求标头规则",
    responseHeaders: "响应标头",
    responseHeadersTooltip:
      "修改服务器返回的 HTTP 响应标头：可设置新值或移除已有标头，支持按 URL 过滤和域名筛选",
    zeroResponseHeaders: "暂无响应标头规则",
    blockRequests: "拦截请求",
    blockRequestsTooltip:
      "拦截匹配的请求：可选择拦截资源（JS/CSS/图片等）或整页文档，支持按域名筛选",
    zeroBlockedRequests: "暂无拦截规则",
    redirectRequests: "重定向请求",
    redirectRequestsTooltip:
      "将匹配的请求重定向到指定目标 URL，支持按域名筛选",
    zeroRedirectRequests: "暂无重定向规则",
    table: {
      name: "名称",
      value: "值",
      urlFilter: "URL 过滤",
      domains: "域名",
      note: "备注",
      type: "类型",
      destination: "目标地址",
    },
    placeholder: {
      headerName: "标头名称",
      headerValue: "标头值",
      urlFilter: "URL 过滤",
      domains: "请求域名",
      note: "备注",
      url: "URL",
    },
    action: {
      delete: "删除",
      copyToClipboard: "复制到剪贴板",
    },
    toast: {
      copied: "已复制到剪贴板…",
      failed: "无法复制到剪贴板…",
    },
    dropdown: {
      set: "设置",
      remove: "移除",
      assets: "资源",
      domain: "域名",
    },
  },

  editor: {
    save: "保存",
    cancel: "取消",
  },

  settings: {
    title: "设置",
    compactMode: "紧凑模式",
    compactModeTooltip:
      "收起左侧栏宽度，为规则编辑区腾出更多空间",
    new: "新功能",
    compactDesc:
      "如果你需要更多空间来编辑规则，紧凑模式会收窄左侧栏宽度。",
    disableCompact: "关闭紧凑模式",
    enableCompact: "开启紧凑模式",
    language: "界面语言",
    languageDesc: "选择插件界面的显示语言，修改后即时生效。",
    export: "导出",
    exportDesc:
      "将你的规则导出为 .json 文件，用于备份或分享给朋友/同事。勾选想要导出的文件夹，然后点击导出。",
    import: "导入",
    importDesc:
      "选择并导入 ModBox 备份文件，将规则追加到你当前的文件夹、标签页和规则中。",
    confirmDeletion: "确认删除规则",
    deleteAll: "删除全部规则",
    deleteAllDesc:
      "彻底清空所有规则。此操作不可撤销，请谨慎使用。",
    deleteAllBtn: "全部删除",
    about: "关于",
    aboutDesc:
      "ModBox 是一个业余项目，旨在为开发者和黑客提供一个测试和调试 HTTP 请求的工具。",
    linkedIn: "我的 LinkedIn",
    tipJar: "打赏支持",
    clear: "清除",
    append: "追加",
    exportBtn: "导出",
    invalidFile: "文件格式无效，请选择有效的 ModBox 备份文件。",
    parseFailed: "文件解析失败，请确认是有效的 JSON 文件。",
    exportTooLarge: "导出数据过大，请尝试选择更少的文件夹。",
    exportFailed: "导出规则失败，请重试。",
    help: "使用帮助",
    helpDesc:
      "查看 ModBox 各项功能的简要说明，帮助你快速上手。",
    openHelp: "查看帮助",
    helpContent: {
      title: "ModBox 使用帮助",
      overview:
        "ModBox 是一款 Chrome 扩展，用于修改 HTTP 请求/响应标头、拦截请求和重定向请求。规则按「文件夹 → 标签页」两级组织，方便分组管理。",
      folders: {
        title: "文件夹与标签页",
        body: "文件夹用于分组管理规则集，每个文件夹可包含多个标签页。点击文件夹名称可展开该文件夹下的规则。支持拖拽排序、克隆、导入导出。",
      },
      rules: {
        title: "规则类型",
        body: "每个标签页支持四种规则：请求标头（修改发出的 HTTP 标头）、响应标头（修改服务器返回的标头）、拦截请求（阻止特定 URL 加载）、重定向请求（将请求导向其他地址）。",
      },
      condition: {
        title: "规则条件",
        body: "每条规则可设置 URL 过滤（匹配特定 URL 模式）和域名筛选（仅在特定域名下生效）。域名支持逗号分隔多个值。标签页级别的域名会作为该标签页下所有规则的默认域名。",
      },
      toggle: {
        title: "开关控制",
        body: "每条规则、每个标签页、每个文件夹以及全局都有一个开关。关闭后对应层级的规则将暂停生效。全局开关旁的数字表示当前实际生效的规则数量。",
      },
      compact: {
        title: "紧凑模式",
        body: "在设置中开启紧凑模式后，左侧栏会变窄，仅显示文件夹首字母缩写，为规则编辑区腾出更多空间。",
      },
      exportImport: {
        title: "导出与导入",
        body: "在设置面板中可导出选中的文件夹为 JSON 文件，用于备份或分享。也可从 JSON 文件导入规则，新规则会追加到现有规则之后。",
      },
    },
  },

  dropdownMenu: {
    yes: "是",
    no: "否",
  },

  tabDragger: {
    selectTab: "选择 {name}",
    dragToMove: "拖拽排序",
    disableRules: "停用该标签页的规则",
    enableRules: "启用该标签页的规则",
  },

  folderDragger: {
    selectFolder: "选择 {name}",
    dragToMove: "拖拽排序",
    disableRules: "停用该文件夹的规则",
    enableRules: "启用该文件夹的规则",
  },

  ruleDragger: {
    dragToMove: "拖拽排序",
  },

  operation: {
    set: "设置",
    setTooltip: "将指定标头设置为新的值，如果标头已存在则覆盖",
    remove: "移除",
    removeTooltip: "将该标头从请求或响应中移除",
  },

  blockType: {
    assets: "资源",
    assetsTooltip: "拦截 JS/CSS/图片/XHR 等非页面文档类型的请求",
    domain: "域名",
    domainTooltip: "拦截整个域名下的页面文档加载",
  },
};

export default zhCN;
