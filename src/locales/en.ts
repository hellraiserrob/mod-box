import type { LocaleMessages } from "./types";

/**
 * English translation dictionary
 */
const en: LocaleMessages = {
  app: {
    error: "There was an error setting the rules, did you use an invalid header name?",
  },

  folderPanel: {
    folders: "Folders",
    noFolders: "No folders",
    add: "Add",
    addFolder: "Add folder",
    global: "Global",
    rulesEnabled: "Rules enabled",
    rulesEnabledTooltip:
      "Global toggle: when off, all rules are paused. The number on the badge shows how many rules are currently active.",
    settings: "Settings",
    globalSettings: "Global settings",
    on: "On",
    off: "Off",
  },

  folder: {
    title: "Folder ({name})",
    confirmDeletion: "Confirm folder deletion",
    delete: "Delete",
    cancel: "Cancel",
    settings: "Folder settings",
    name: "Folder name",
    deleteFolder: "Delete folder",
    cloneFolder: "Clone folder",
    disableFolder: "Disable folder",
    enableFolder: "Enable folder",
  },

  tab: {
    title: "Tab ({name})",
    confirmDeletion: "Confirm tab deletion",
    settings: "Tab settings",
    name: "Tab name",
    requestDomains: "Tab request domains",
    requestDomainsHint: "Single or comma separated domains",
    domainsFallbackHint: "- Applies to all tab rules unless overridden",
    deleteTab: "Delete tab",
    cloneTab: "Clone tab",
    requestHeaders: "Request headers",
    requestHeadersTooltip:
      "Modify outgoing HTTP request headers: set new values or remove existing headers, with URL filter and domain scoping support.",
    zeroRequestHeaders: "Zero request headers",
    responseHeaders: "Response headers",
    responseHeadersTooltip:
      "Modify server response headers: set new values or remove existing headers, with URL filter and domain scoping support.",
    zeroResponseHeaders: "Zero response headers",
    blockRequests: "Block requests",
    blockRequestsTooltip:
      "Block matching requests: choose to block assets (JS/CSS/images etc.) or entire page documents, with domain scoping support.",
    zeroBlockedRequests: "Zero blocked requests",
    redirectRequests: "Redirect requests",
    redirectRequestsTooltip:
      "Redirect matching requests to a specified target URL, with domain scoping support.",
    zeroRedirectRequests: "Zero redirect requests",
    table: {
      name: "Name",
      value: "Value",
      urlFilter: "Url Filter",
      domains: "Domains",
      note: "Note",
      type: "Type",
      destination: "Destination",
    },
    placeholder: {
      headerName: "Header name",
      headerValue: "Header value",
      urlFilter: "urlFilter",
      domains: "Request domains",
      note: "Note",
      url: "Url",
    },
    action: {
      delete: "Delete",
      copyToClipboard: "Copy to clipboard",
    },
    toast: {
      copied: "Copied to clipboard...",
      failed: "Couldn't copy to clipboard...",
    },
    dropdown: {
      set: "Set",
      remove: "Remove",
      assets: "Assets",
      domain: "Domain",
    },
  },

  editor: {
    save: "Save",
    cancel: "Cancel",
  },

  settings: {
    title: "Settings",
    compactMode: "Compact mode",
    compactModeTooltip:
      "Narrow the left sidebar to give the rule editing area more room.",
    new: "New",
    compactDesc:
      "If you need a bit more space to work with your rules, compact mode reduces the left hand column width.",
    disableCompact: "Disable compact mode",
    enableCompact: "Enable compact mode",
    language: "Language",
    languageDesc: "Choose the interface language. Changes take effect immediately.",
    export: "Export",
    exportDesc:
      "You can export your rules into .json packages to backup, or send to friends/colleagues. Check the folders you want and click export.",
    import: "Import",
    importDesc:
      "You can select and import modbox backup files and append them to your current set of folders, tabs and rules.",
    confirmDeletion: "Confirm rules deletion",
    deleteAll: "Delete all rules",
    deleteAllDesc:
      "If you want to totally reset all of your rules. This cannot be undone so please use carefully.",
    deleteAllBtn: "Delete all",
    about: "About",
    aboutDesc:
      "ModBox is a hobby project with the aim of providing developers and hackers a tool for testing and debugging.",
    linkedIn: "My LinkedIn",
    tipJar: "Tip Jar",
    clear: "Clear",
    append: "Append",
    exportBtn: "Export",
    invalidFile: "Invalid file format. Please select a valid ModBox backup file.",
    parseFailed: "Failed to parse file. Please ensure it's a valid JSON file.",
    exportTooLarge: "Export data is too large. Try selecting fewer folders.",
    exportFailed: "Failed to export rules. Please try again.",
    help: "Help",
    helpDesc: "View a quick guide to ModBox's features to help you get started.",
    openHelp: "Open help",
    helpContent: {
      title: "ModBox Help",
      overview:
        "ModBox is a Chrome extension for modifying HTTP request/response headers, blocking requests, and redirecting requests. Rules are organized in a two-level hierarchy of Folders and Tabs for easy grouping.",
      folders: {
        title: "Folders & Tabs",
        body: "Folders group related rule sets, and each folder can contain multiple tabs. Click a folder name to expand its rules. Drag-and-drop reordering, cloning, and import/export are supported.",
      },
      rules: {
        title: "Rule Types",
        body: "Each tab supports four rule types: Request Headers (modify outgoing HTTP headers), Response Headers (modify server response headers), Block Requests (prevent specific URLs from loading), and Redirect Requests (send requests to a different URL).",
      },
      condition: {
        title: "Rule Conditions",
        body: "Each rule can have a URL Filter (match specific URL patterns) and Domain scoping (only apply on specific domains). Domains support comma-separated values. Tab-level domains serve as the default for all rules within that tab.",
      },
      toggle: {
        title: "Toggle Controls",
        body: "Every rule, tab, folder, and the global scope has a toggle switch. When turned off, rules at that level are paused. The number next to the global toggle shows how many rules are currently active.",
      },
      compact: {
        title: "Compact Mode",
        body: "When enabled in Settings, compact mode narrows the left sidebar, showing only folder initials, giving the rule editing area more room.",
      },
      exportImport: {
        title: "Export & Import",
        body: "In the Settings panel you can export selected folders as JSON files for backup or sharing. You can also import rules from JSON files — new rules are appended to your existing ones.",
      },
    },
  },

  dropdownMenu: {
    yes: "Yes",
    no: "No",
  },

  tabDragger: {
    selectTab: "select {name}",
    dragToMove: "drag to move",
    disableRules: "Disable tab rules",
    enableRules: "Enable tab rules",
  },

  folderDragger: {
    selectFolder: "select {name}",
    dragToMove: "drag to move",
    disableRules: "Disable folder rules",
    enableRules: "Enable folder rules",
  },

  ruleDragger: {
    dragToMove: "drag to move",
  },

  operation: {
    set: "Set",
    setTooltip: "Set the header to a new value, overwriting if it already exists.",
    remove: "Remove",
    removeTooltip: "Remove this header from the request or response.",
  },

  blockType: {
    assets: "Assets",
    assetsTooltip: "Block non-document requests like JS, CSS, images, XHR etc.",
    domain: "Domain",
    domainTooltip: "Block entire page document loads on the matched domain.",
  },
};

export default en;
