import { describe, it, expect, beforeEach, vi } from 'vitest';
// eslint-disable-next-line
// @ts-nocheck — 原生 .js?raw 导入无类型声明，测试文件内不做类型检查
import swSource from '../public/scripts/service-worker.js?raw';

/**
 * service-worker.js 是给 MV3 service worker 用的纯 JS（无导出）。
 * 这里用 Function 构造器在注入的 chrome stub 环境中执行，再取出内部函数做单元测试。
 */
type SWContext = Record<string, any>;

function loadServiceWorker(chromeStub: any): SWContext {
  const fn = new Function('chrome', 'URL', 'RegExp', swSource + `;
    this.__exports = { parseDomains, hostMatchesDomain, conditionMatchesPage, countMatchedRules, updateBadge, urlFilterToRegExp };
  `);
  const host = { __exports: null as SWContext | null };
  fn.call(host, chromeStub, URL, RegExp);
  return host.__exports as SWContext;
}

function createChromeStub() {
  const listeners: Record<string, Function[]> = {};
  const badge = { backgroundColor: undefined as any, text: undefined as any };
  const chrome = {
    runtime: {
      lastError: null,
      onStartup: { addListener: (f: Function) => push('onStartup', f) },
      onInstalled: { addListener: (f: Function) => push('onInstalled', f) },
    },
    tabs: {
      onActivated: { addListener: (f: Function) => push('tabs.onActivated', f) },
      onUpdated: { addListener: (f: Function) => push('tabs.onUpdated', f) },
      query: (_q: any, cb: (tabs: any[]) => void) => cb(chrome.__activeTabs),
    },
    windows: {
      WINDOW_ID_NONE: -1,
      onFocusChanged: { addListener: (f: Function) => push('windows.onFocusChanged', f) },
    },
    storage: {
      local: {
        get: (_keys: any, cb: (r: any) => void) => cb(chrome.__storage),
        __data: null as any,
      },
      onChanged: { addListener: (f: Function) => push('storage.onChanged', f) },
    },
    action: {
      setBadgeBackgroundColor: (opts: any) => { badge.backgroundColor = opts.color; },
      setBadgeText: (opts: any) => { badge.text = opts.text; },
    },
    __activeTabs: [] as any[],
    __storage: {} as Record<string, string>,
  };
  function push(name: string, f: Function) {
    (listeners[name] = listeners[name] || []).push(f);
  }
  (chrome as any).__listeners = listeners;
  (chrome as any).__badge = badge;
  return chrome as any;
}

describe('service worker badge matcher', () => {
  let chrome: ReturnType<typeof createChromeStub>;
  let sw: SWContext;

  beforeEach(() => {
    vi.stubGlobal('chrome', createChromeStub());
    // eslint-disable-next-line
    chrome = (globalThis as any).chrome;
    sw = loadServiceWorker(chrome);
  });

  describe('parseDomains', () => {
    it('matches src/utils.ts semantics: split, clean, dedupe', () => {
      expect(sw.parseDomains("https://a.com, b.com\nc.com ,a.com")).toEqual(["a.com", "b.com", "c.com"]);
      expect(sw.parseDomains("")).toEqual([]);
      expect(sw.parseDomains(null)).toEqual([]);
      expect(sw.parseDomains(["x.com", " https://y.com "])).toEqual(["x.com", "y.com"]);
    });
  });

  describe('hostMatchesDomain', () => {
    it('matches exact host', () => {
      expect(sw.hostMatchesDomain("example.com", "example.com")).toBe(true);
    });
    it('matches subdomain (suffix)', () => {
      expect(sw.hostMatchesDomain("sub.example.com", "example.com")).toBe(true);
      expect(sw.hostMatchesDomain("a.b.example.com", "example.com")).toBe(true);
    });
    it('does not match partial label or other domain', () => {
      expect(sw.hostMatchesDomain("notexample.com", "example.com")).toBe(false);
      expect(sw.hostMatchesDomain("example.org", "example.com")).toBe(false);
    });
    it('ignores case and port', () => {
      expect(sw.hostMatchesDomain("EXAMPLE.com", "example.com")).toBe(true);
    });
  });

  describe('urlFilterToRegExp', () => {
    it('* is a wildcard', () => {
      const re = sw.urlFilterToRegExp("https://*.example.com/api");
      expect(re.test("https://cdn.example.com/api/x")).toBe(true);
      expect(re.test("https://example.com/api/x")).toBe(false);
    });
    it('escapes regex special chars literally', () => {
      const re = sw.urlFilterToRegExp("/a.b?c=1");
      expect(re.test("https://x.com/a.b?c=1")).toBe(true);
      expect(re.test("https://x.com/aXb?c=1")).toBe(false);
    });
    it('is case-insensitive', () => {
      expect(sw.urlFilterToRegExp("/API").test("https://x.com/api")).toBe(true);
    });
    it('| anchors the start', () => {
      expect(sw.urlFilterToRegExp("|https://a.com").test("https://a.com/x")).toBe(true);
      expect(sw.urlFilterToRegExp("|https://a.com").test("https://b.com/https://a.com")).toBe(false);
    });
    it('|| matches after protocol or subdomain boundary', () => {
      const re = sw.urlFilterToRegExp("||ads.example.com");
      expect(re.test("https://ads.example.com/x")).toBe(true);
      expect(re.test("https://sub.ads.example.com/y")).toBe(true);
      expect(re.test("https://evilads.example.com/y")).toBe(false);
    });
  });

  describe('conditionMatchesPage', () => {
    const page = { pageUrl: "https://www.example.com/path", pageHost: "www.example.com" };

    it('empty condition matches everything', () => {
      expect(sw.conditionMatchesPage({ urlFilter: "", requestDomains: "" }, undefined, page.pageUrl, page.pageHost)).toBe(true);
    });
    it('urlFilter AND domains must both hold', () => {
      const cond = { urlFilter: "/path", requestDomains: "example.com" };
      expect(sw.conditionMatchesPage(cond, undefined, page.pageUrl, page.pageHost)).toBe(true);
      expect(sw.conditionMatchesPage({ ...cond, urlFilter: "/other" }, undefined, page.pageUrl, page.pageHost)).toBe(false);
      expect(sw.conditionMatchesPage({ ...cond, requestDomains: "other.com" }, undefined, page.pageUrl, page.pageHost)).toBe(false);
    });
    it('falls back to tab-level domains', () => {
      const cond = { urlFilter: "", requestDomains: "" };
      expect(sw.conditionMatchesPage(cond, "fallback.com", "https://x.fallback.com/", "x.fallback.com")).toBe(true);
      expect(sw.conditionMatchesPage(cond, "fallback.com", "https://other.com/", "other.com")).toBe(false);
    });
    it('rule domains take precedence over fallback', () => {
      const cond = { urlFilter: "", requestDomains: "rule.com" };
      expect(sw.conditionMatchesPage(cond, "fallback.com", "https://rule.com/", "rule.com")).toBe(true);
      expect(sw.conditionMatchesPage(cond, "fallback.com", "https://fallback.com/", "fallback.com")).toBe(false);
    });
    it('document:true block rules ignore urlFilter (aligned with buildCondition)', () => {
      const cond = { urlFilter: "should-be-ignored", requestDomains: "example.com", document: true };
      expect(sw.conditionMatchesPage(cond, undefined, page.pageUrl, page.pageHost)).toBe(true);
      expect(sw.conditionMatchesPage(cond, undefined, "https://other.com/", "other.com")).toBe(false);
    });
    it('missing condition never matches', () => {
      expect(sw.conditionMatchesPage(null, undefined, page.pageUrl, page.pageHost)).toBe(false);
    });
  });

  describe('countMatchedRules', () => {
    const mkRule = (condition: any, active = true) => ({ active, condition });
    const mkData = (rules: any[], opts: { dataActive?: boolean; folderActive?: boolean; tabActive?: boolean } = {}) => ({
      active: opts.dataActive ?? true,
      folders: [{
        name: "F", active: opts.folderActive ?? true,
        tabs: [{
          name: "T", active: opts.tabActive ?? true, requestDomains: "tab-fallback.com",
          requestHeaders: rules, responseHeaders: [], blockedRequests: [], redirectRequests: [],
        }],
      }],
    });
    const url = "https://tab-fallback.com/page";

    it('counts only active rules across all four rule types', () => {
      const data = {
        active: true,
        folders: [{
          name: "F", active: true,
          tabs: [{
            name: "T", active: true, requestDomains: "",
            requestHeaders: [mkRule({ urlFilter: "", requestDomains: "" })],
            responseHeaders: [mkRule({ urlFilter: "", requestDomains: "" })],
            blockedRequests: [mkRule({ urlFilter: "", requestDomains: "", document: false }), mkRule({ urlFilter: "", requestDomains: "" }, false)],
            redirectRequests: [mkRule({ urlFilter: "", requestDomains: "" })],
          }],
        }],
      };
      expect(sw.countMatchedRules(data, url, "tab-fallback.com")).toBe(4);
    });

    it('respects data/folder/tab/rule active flags', () => {
      expect(sw.countMatchedRules(mkData([mkRule({ urlFilter: "", requestDomains: "" })], { dataActive: false }), url, "tab-fallback.com")).toBe(0);
      expect(sw.countMatchedRules(mkData([mkRule({ urlFilter: "", requestDomains: "" })], { folderActive: false }), url, "tab-fallback.com")).toBe(0);
      expect(sw.countMatchedRules(mkData([mkRule({ urlFilter: "", requestDomains: "" })], { tabActive: false }), url, "tab-fallback.com")).toBe(0);
      expect(sw.countMatchedRules(mkData([mkRule({ urlFilter: "", requestDomains: "" }, false)]), url, "tab-fallback.com")).toBe(0);
    });

    it('counts only rules whose domains match the page', () => {
      const data = mkData([
        mkRule({ urlFilter: "", requestDomains: "tab-fallback.com" }),
        mkRule({ urlFilter: "", requestDomains: "nomatch.com" }),
        mkRule({ urlFilter: "", requestDomains: "" }), // fallback 域名命中
      ]);
      expect(sw.countMatchedRules(data, url, "tab-fallback.com")).toBe(2);
    });

    it('handles malformed data safely', () => {
      expect(sw.countMatchedRules(null, url, "x.com")).toBe(0);
      expect(sw.countMatchedRules({}, url, "x.com")).toBe(0);
      expect(sw.countMatchedRules({ active: true, folders: "bad" }, url, "x.com")).toBe(0);
    });
  });

  describe('updateBadge (integration with chrome stub)', () => {
    const mkRule = (condition: any, active = true) => ({ active, condition });

    function setRules(rulesJson: string) {
      chrome.__storage = { rules: rulesJson };
    }

    it('shows matched count for a matching page', async () => {
      setRules(JSON.stringify({
        active: true,
        folders: [{
          name: "F", active: true,
          tabs: [{
            name: "T", active: true, requestDomains: "example.com",
            requestHeaders: [mkRule({ urlFilter: "", requestDomains: "" })],
            responseHeaders: [], blockedRequests: [], redirectRequests: [],
          }],
        }],
      }));
      chrome.__activeTabs = [{ url: "https://www.example.com/" }];
      sw.updateBadge();
      await new Promise(r => setTimeout(r, 0));
      expect(chrome.__badge.text).toBe("1");
    });

    it('hides badge when zero rules match', async () => {
      setRules(JSON.stringify({
        active: true,
        folders: [{
          name: "F", active: true,
          tabs: [{
            name: "T", active: true, requestDomains: "other.com",
            requestHeaders: [mkRule({ urlFilter: "", requestDomains: "" })],
            responseHeaders: [], blockedRequests: [], redirectRequests: [],
          }],
        }],
      }));
      chrome.__activeTabs = [{ url: "https://example.com/" }];
      sw.updateBadge();
      await new Promise(r => setTimeout(r, 0));
      expect(chrome.__badge.text).toBe("");
    });

    it('hides badge on non-http(s) pages (chrome:// etc.)', async () => {
      setRules(JSON.stringify({
        active: true,
        folders: [{
          name: "F", active: true,
          tabs: [{
            name: "T", active: true, requestDomains: "",
            requestHeaders: [mkRule({ urlFilter: "", requestDomains: "" })],
            responseHeaders: [], blockedRequests: [], redirectRequests: [],
          }],
        }],
      }));
      chrome.__activeTabs = [{ url: "chrome://settings/" }];
      sw.updateBadge();
      await new Promise(r => setTimeout(r, 0));
      expect(chrome.__badge.text).toBe("");
    });

    it('hides badge when no rules stored yet', async () => {
      chrome.__storage = {};
      chrome.__activeTabs = [{ url: "https://example.com/" }];
      sw.updateBadge();
      await new Promise(r => setTimeout(r, 0));
      expect(chrome.__badge.text).toBe("");
    });

    it('hides badge when stored rules are corrupted JSON', async () => {
      chrome.__storage = { rules: "{not json" };
      chrome.__activeTabs = [{ url: "https://example.com/" }];
      sw.updateBadge();
      await new Promise(r => setTimeout(r, 0));
      expect(chrome.__badge.text).toBe("");
    });

    it('registers all lifecycle listeners on load', () => {
      const l = chrome.__listeners;
      expect(l['onInstalled']).toHaveLength(1);
      expect(l['onStartup']).toHaveLength(1);
      expect(l['tabs.onActivated']).toHaveLength(1);
      expect(l['tabs.onUpdated']).toHaveLength(1);
      expect(l['storage.onChanged']).toHaveLength(1);
      expect(l['windows.onFocusChanged']).toHaveLength(1);
    });
  });
});
