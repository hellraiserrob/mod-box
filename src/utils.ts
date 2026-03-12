import { DataType, HeaderRule, BlockedRequest, RedirectRequest, NetworkConditionRule, NETWORK_PRESETS } from "./interfaces"

/**
 * Chrome version detection for feature support
 */
export function getChromeVersion(): number {
  if (typeof navigator === 'undefined') return 0;
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function isNetworkConditionsSupported(): boolean {
  return getChromeVersion() >= 145;
}

/**
 * Chrome declarativeNetRequest resource types
 */
const ALL_RESOURCE_TYPES = [
  "main_frame", "sub_frame", "stylesheet", "script", "image", "font", 
  "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", 
  "webtransport", "webbundle", "other"
] as const;

const NON_DOCUMENT_RESOURCE_TYPES = ALL_RESOURCE_TYPES.filter(
  type => type !== "main_frame" && type !== "sub_frame"
);

const DOCUMENT_RESOURCE_TYPES = ["main_frame", "sub_frame"] as const;

/**
 * Build condition object for a rule
 */
function buildCondition(
  condition: { urlFilter?: string; requestDomains?: string },
  fallbackDomains?: string,
  resourceTypes?: readonly string[]
) {
  const result: Record<string, unknown> = {};

  if (condition.urlFilter && condition.urlFilter.trim() !== "") {
    result.urlFilter = condition.urlFilter;
  }

  const domains = condition.requestDomains || fallbackDomains;
  if (domains && domains.trim() !== "") {
    result.requestDomains = parseDomains(domains);
  }

  if (resourceTypes) {
    result.resourceTypes = [...resourceTypes];
  }

  return result;
}

/**
 * Generate Chrome declarativeNetRequest rules from app data
 */
export function generateRules(data: DataType) {
  const rules: ChromeRule[] = [];
  let id = 1;

  if (!data?.active) {
    return [];
  }

  if (!Array.isArray(data.folders)) {
    return [];
  }

  for (const folder of data.folders) {
    if (!folder?.active || !Array.isArray(folder.tabs)) continue;

    for (const tab of folder.tabs) {
      if (!tab?.active) continue;

      // Request header rules
      if (Array.isArray(tab.requestHeaders)) {
        for (const header of tab.requestHeaders) {
          if (!isValidHeaderRule(header)) continue;

          rules.push({
            id: id++,
            priority: 1,
            action: {
              type: "modifyHeaders",
              requestHeaders: [{
                header: header.name,
                operation: header.operation || "set",
                ...(header.operation !== "remove" && { value: header.value })
              }]
            },
            condition: buildCondition(
              header.condition,
              tab.requestDomains,
              ALL_RESOURCE_TYPES
            )
          });
        }
      }

      // Response header rules
      if (Array.isArray(tab.responseHeaders)) {
        for (const header of tab.responseHeaders) {
          if (!isValidHeaderRule(header)) continue;

          rules.push({
            id: id++,
            priority: 1,
            action: {
              type: "modifyHeaders",
              responseHeaders: [{
                header: header.name,
                operation: header.operation || "set",
                ...(header.operation !== "remove" && { value: header.value })
              }]
            },
            condition: buildCondition(
              header.condition,
              tab.requestDomains,
              ALL_RESOURCE_TYPES
            )
          });
        }
      }

      // Redirect rules
      if (Array.isArray(tab.redirectRequests)) {
        for (const redirect of tab.redirectRequests) {
          if (!isValidRedirectRule(redirect)) continue;

          rules.push({
            id: id++,
            priority: 1,
            action: { 
              type: "redirect", 
              redirect: { url: redirect.url } 
            },
            condition: buildCondition(
              redirect.condition,
              tab.requestDomains
            )
          });
        }
      }

      // Block rules
      if (Array.isArray(tab.blockedRequests)) {
        for (const block of tab.blockedRequests) {
          if (!isValidBlockRule(block)) continue;

          const isDocumentBlock = block.condition.document === true;
          const condition = buildCondition(
            isDocumentBlock ? { requestDomains: block.condition.requestDomains } : block.condition,
            tab.requestDomains,
            isDocumentBlock ? DOCUMENT_RESOURCE_TYPES : NON_DOCUMENT_RESOURCE_TYPES
          );

          rules.push({
            id: id++,
            priority: 1,
            action: { type: "block" },
            condition
          });
        }
      }
    }
  }

  return rules;
}

/**
 * Validation helpers
 */
function isValidHeaderRule(rule: HeaderRule | undefined): rule is HeaderRule {
  return Boolean(
    rule?.active && 
    rule.name && 
    rule.name.trim() !== "" &&
    rule.condition
  );
}

function isValidRedirectRule(rule: RedirectRequest | undefined): rule is RedirectRequest {
  return Boolean(
    rule?.active && 
    rule.url && 
    rule.url.trim() !== "" &&
    rule.condition
  );
}

function isValidBlockRule(rule: BlockedRequest | undefined): rule is BlockedRequest {
  return Boolean(rule?.active && rule.condition);
}

/**
 * Chrome rule type for type safety
 */
interface ChromeRule {
  id: number;
  priority: number;
  action: {
    type: string;
    requestHeaders?: Array<{ header: string; operation: string; value?: string }>;
    responseHeaders?: Array<{ header: string; operation: string; value?: string }>;
    redirect?: { url: string };
  };
  condition: Record<string, unknown>;
}

/**
 * Environment detection
 */
export const isChrome: boolean =
  typeof chrome !== "undefined" && 
  Boolean(chrome?.declarativeNetRequest) && 
  Boolean(chrome?.storage);

/**
 * Domain parsing utilities
 * Supports comma-separated strings, newline-separated strings, or arrays
 * Automatically deduplicates and cleans domains
 */
export function parseDomains(domains: string | string[]): string[] {
  if (!domains) {
    return [];
  }
  
  // Handle array input
  if (Array.isArray(domains)) {
    const cleaned = domains
      .map(domain => cleanDomain(domain))
      .filter(domain => domain !== "");
    return [...new Set(cleaned)]; // Deduplicate
  }
  
  if (typeof domains !== "string") {
    return [];
  }
  
  // Split by comma or newline
  const cleaned = domains
    .split(/[,\n]/)
    .map(domain => cleanDomain(domain))
    .filter(domain => domain !== "");
  
  return [...new Set(cleaned)]; // Deduplicate
}

export function cleanDomain(domain: string): string {
  if (!domain || typeof domain !== "string") {
    return "";
  }
  return domain.trim().replace(/^https?:\/\//i, "");
}

/**
 * Network condition rule for Chrome DevTools Protocol
 */
export interface NetworkConditionRuleOutput {
  urlPattern: string;
  latency: number;
  downloadThroughput: number;
  uploadThroughput: number;
}

export interface NetworkConditionsOutput {
  offline: boolean;
  matchedNetworkConditions: NetworkConditionRuleOutput[];
}

/**
 * Build URL pattern for network conditions from rule condition
 * Uses URLPattern syntax: https://urlpattern.spec.whatwg.org/
 */
function buildUrlPattern(
  condition: { urlFilter?: string; requestDomains?: string },
  fallbackDomains?: string
): string {
  // If urlFilter is provided, use it directly (assume it's a valid URLPattern)
  if (condition.urlFilter && condition.urlFilter.trim() !== "") {
    return condition.urlFilter.trim();
  }
  
  // If domains are provided, build a pattern matching those domains
  const domains = condition.requestDomains || fallbackDomains;
  if (domains && domains.trim() !== "") {
    const domainList = parseDomains(domains);
    if (domainList.length === 1) {
      return `*://${domainList[0]}/*`;
    }
    if (domainList.length > 1) {
      // URLPattern doesn't support multiple domains in one pattern,
      // so we use the first one. In practice, users should create
      // separate rules for each domain or use a urlFilter pattern.
      return `*://${domainList[0]}/*`;
    }
  }
  
  // Default: match all requests
  return "*://*/*";
}

/**
 * Validation helper for network condition rules
 */
function isValidNetworkConditionRule(rule: NetworkConditionRule | undefined): rule is NetworkConditionRule {
  return Boolean(
    rule?.active && 
    rule.preset &&
    NETWORK_PRESETS[rule.preset] &&
    rule.condition
  );
}

/**
 * Generate network condition rules for Chrome DevTools Protocol
 * Returns the payload for Network.emulateNetworkConditionsByRule
 */
export function generateNetworkConditionRules(data: DataType): NetworkConditionsOutput | null {
  if (!data?.active) {
    return null;
  }

  if (!Array.isArray(data.folders)) {
    return null;
  }

  const matchedNetworkConditions: NetworkConditionRuleOutput[] = [];
  let hasOfflineRule = false;

  for (const folder of data.folders) {
    if (!folder?.active || !Array.isArray(folder.tabs)) continue;

    for (const tab of folder.tabs) {
      if (!tab?.active) continue;

      if (Array.isArray(tab.networkConditions)) {
        for (const rule of tab.networkConditions) {
          if (!isValidNetworkConditionRule(rule)) continue;

          const preset = NETWORK_PRESETS[rule.preset];
          
          // Track if any rule is offline (affects global offline state)
          if (preset.offline) {
            hasOfflineRule = true;
          }

          console.log({
            ruleCondition: rule.condition, 
            ruleDomain: tab.requestDomains,
            latency: preset.latency,
            downloadThroughput: preset.downloadThroughput,
            uploadThroughput: preset.uploadThroughput,
          });

          matchedNetworkConditions.push({
            urlPattern: buildUrlPattern(rule.condition, tab.requestDomains),
            latency: preset.latency,
            downloadThroughput: preset.downloadThroughput,
            uploadThroughput: preset.uploadThroughput,
          });
        }
      }
    }
  }

  if (matchedNetworkConditions.length === 0) {
    return null;
  }

  return {
    offline: hasOfflineRule,
    matchedNetworkConditions,
  };
}