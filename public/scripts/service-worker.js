/**
 * ModBox service worker
 * 负责扩展角标：显示"当前活动标签页命中的规则数量"，0 命中时隐藏角标。
 * 角标写入权收敛于此处，popup（App.vue）只负责写 rules 数据。
 */

/**
 * Parse a domain list string (comma/newline separated) into a cleaned, deduped array.
 * 与 src/utils.ts 的 parseDomains 语义保持一致。
 */
function parseDomains(domains) {
  if (!domains) return [];
  const parts = Array.isArray(domains)
    ? domains
    : String(domains).split(/[,\n]/);
  const cleaned = parts
    .map((d) => String(d || "").trim().replace(/^https?:\/\//i, ""))
    .filter((d) => d !== "");
  return [...new Set(cleaned)];
}

/**
 * Host suffix match，对齐 DNR requestDomains 语义：
 * host 等于域名本身，或以 "." + 域名 结尾（子域）；比较前忽略端口、统一小写。
 */
function hostMatchesDomain(host, domain) {
  if (!host || !domain) return false;
  const h = host.toLowerCase();
  const d = domain.toLowerCase();
  if (!d) return false;
  return h === d || h.endsWith("." + d);
}

/**
 * Convert a DNR urlFilter into a RegExp.
 * 对齐 Chrome urlFilter 语法：
 *  - "|" 锚定开头/结尾
 *  - "||" 锚定"协议或子域边界之后"（任意 scheme 下匹配 host 或其子域路径起点）
 *  - "*" 通配任意字符
 *  - 其余字符按字面匹配；URL 整体大小写不敏感（Chrome 实际按 scheme/host 不敏感、path 敏感，
 *    此处取宽松策略：整串不敏感）
 */
function urlFilterToRegExp(urlFilter) {
  let pattern = "";
  let i = 0;
  while (i < urlFilter.length) {
    const ch = urlFilter[i];
    if (ch === "*") {
      pattern += ".*";
      i++;
    } else if (ch === "|") {
      if (urlFilter[i + 1] === "|") {
        // ||example.com 匹配 "://example.com"、"://sub.example.com" 等
        pattern += "(?:[^:]*:\\/\\/|\\.)";
        i += 2;
      } else {
        pattern += "^";
        i++;
      }
    } else {
      pattern += ch.replace(/[.+?^${}()[\]\\]/g, "\\$&");
      i++;
    }
  }
  return new RegExp(pattern, "i");
}

const urlFilterRegExpCache = new Map();

function getCachedUrlFilterRegExp(urlFilter) {
  let re = urlFilterRegExpCache.get(urlFilter);
  if (!re) {
    re = urlFilterToRegExp(urlFilter);
    if (urlFilterRegExpCache.size > 500) urlFilterRegExpCache.clear();
    urlFilterRegExpCache.set(urlFilter, re);
  }
  return re;
}

/**
 * 判断单条规则的 condition 是否命中给定页面。
 * pageUrl 为顶层文档 URL；语义近似复刻 buildCondition（src/utils.ts）生成的 DNR 条件：
 *  - urlFilter 与 requestDomains 是 AND 关系
 *  - 两者皆空 = 匹配一切
 *  - document:true 的 block 规则只保留域名条件（urlFilter 被 buildCondition 丢弃），此处同样处理
 */
function conditionMatchesPage(condition, fallbackDomains, pageUrl, pageHost) {
  if (!condition) return false;

  // document:true 的 block 规则在 generateRules 中会丢掉 urlFilter，仅保留域名维度
  const urlFilter =
    condition.document === true ? "" : String(condition.urlFilter || "").trim();
  const domainsRaw =
    condition.requestDomains && String(condition.requestDomains).trim() !== ""
      ? condition.requestDomains
      : fallbackDomains;
  const domains = parseDomains(domainsRaw);

  const hasUrlFilter = urlFilter !== "";
  const hasDomains = domains.length > 0;

  if (!hasUrlFilter && !hasDomains) return true; // 空条件 = 匹配一切

  if (hasDomains && !domains.some((d) => hostMatchesDomain(pageHost, d))) {
    return false;
  }

  if (hasUrlFilter && !getCachedUrlFilterRegExp(urlFilter).test(pageUrl)) {
    return false;
  }

  return true;
}

/**
 * 从 storage 里的 rules JSON 统计当前页面命中的启用规则数。
 * 遍历逻辑与 generateRules 一致：data.active → folder.active → tab.active → 各类规则 active。
 */
function countMatchedRules(data, pageUrl, pageHost) {
  let count = 0;

  if (!data?.active || !Array.isArray(data.folders)) return 0;

  for (const folder of data.folders) {
    if (!folder?.active || !Array.isArray(folder.tabs)) continue;
    for (const tab of folder.tabs) {
      if (!tab?.active) continue;
      const fallbackDomains = tab.requestDomains;

      const ruleGroups = [
        tab.requestHeaders,
        tab.responseHeaders,
        tab.redirectRequests,
        tab.blockedRequests,
      ];
      for (const group of ruleGroups) {
        if (!Array.isArray(group)) continue;
        for (const rule of group) {
          if (!rule?.active) continue;
          if (
            conditionMatchesPage(rule.condition, fallbackDomains, pageUrl, pageHost)
          ) {
            count++;
          }
        }
      }
    }
  }
  return count;
}

/** 更新角标为当前活动标签页的命中数；拿不到 URL 或 0 命中则隐藏角标。 */
function updateBadge() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    const url = tab?.url;
    chrome.action.setBadgeBackgroundColor({ color: "blue" });

    if (!url || !/^https?:\/\//i.test(url)) {
      // 特殊页面（chrome:// 等）或拿不到 URL：DNR 规则不会作用于这些页面
      chrome.action.setBadgeText({ text: "" });
      return;
    }

    let pageHost = "";
    try {
      pageHost = new URL(url).hostname;
    } catch (e) {
      chrome.action.setBadgeText({ text: "" });
      return;
    }

    chrome.storage.local.get(["rules"], (result) => {
      if (chrome.runtime.lastError || !result.rules) {
        chrome.action.setBadgeText({ text: "" });
        return;
      }
      let data;
      try {
        data = JSON.parse(result.rules);
      } catch (e) {
        chrome.action.setBadgeText({ text: "" });
        return;
      }
      const matched = countMatchedRules(data, url, pageHost);
      chrome.action.setBadgeText({ text: matched > 0 ? `${matched}` : "" });
    });
  });
}

function handleStartup() {
  updateBadge();
}

function handleInstalled() {
  updateBadge();
}

chrome.runtime.onStartup.addListener(handleStartup);
chrome.runtime.onInstalled.addListener(handleInstalled);

// 切换标签页 / 页面导航刷新时重算
chrome.tabs.onActivated.addListener(updateBadge);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 只在导航实际发生时重算，避免 title 等无关更新反复触发
  if (changeInfo.url || changeInfo.status === "loading") {
    updateBadge();
  }
});

// popup 内修改规则后重算
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.rules) {
    updateBadge();
  }
});

// popup 打开时窗口焦点变化也会切回对应标签页，补一次刷新以保证准确
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    updateBadge();
  }
});
