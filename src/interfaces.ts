export interface RuleCondition {
  urlFilter: string;
  requestDomains: string;
  document?: boolean;
}

export interface HeaderRule {
  active: boolean;
  name: string;
  value: string;
  operation?: 'set' | 'remove';
  note?: string;
  condition: RuleCondition;
}

export interface BlockedRequest {
  active: boolean;
  note?: string;
  condition: RuleCondition;
}

export interface RedirectRequest {
  active: boolean;
  url: string;
  note?: string;
  condition: Omit<RuleCondition, 'document'>;
}

export interface TabType {
  name: string;
  requestDomains?: string;
  active: boolean;
  requestHeaders: HeaderRule[];
  responseHeaders: HeaderRule[];
  blockedRequests: BlockedRequest[];
  redirectRequests: RedirectRequest[];
}

export interface FolderType {
  name: string;
  active: boolean;
  tabs: TabType[];
}

export interface DataType {
  active: boolean;
  folders: FolderType[];
}

export interface ExportPayload {
  name: 'modbox';
  version: number;
  folders: FolderType[];
}

/**
 * Type guards for runtime validation
 */
export function isValidRuleCondition(obj: unknown): obj is RuleCondition {
  if (!obj || typeof obj !== 'object') return false;
  const cond = obj as Record<string, unknown>;
  return (
    typeof cond.urlFilter === 'string' &&
    typeof cond.requestDomains === 'string'
  );
}

export function isValidHeaderRule(obj: unknown): obj is HeaderRule {
  if (!obj || typeof obj !== 'object') return false;
  const rule = obj as Record<string, unknown>;
  return (
    typeof rule.active === 'boolean' &&
    typeof rule.name === 'string' &&
    typeof rule.value === 'string' &&
    (rule.operation === undefined || rule.operation === 'set' || rule.operation === 'remove') &&
    (rule.note === undefined || typeof rule.note === 'string') &&
    isValidRuleCondition(rule.condition)
  );
}

export function isValidBlockedRequest(obj: unknown): obj is BlockedRequest {
  if (!obj || typeof obj !== 'object') return false;
  const rule = obj as Record<string, unknown>;
  return (
    typeof rule.active === 'boolean' &&
    (rule.note === undefined || typeof rule.note === 'string') &&
    isValidRuleCondition(rule.condition)
  );
}

export function isValidRedirectRequest(obj: unknown): obj is RedirectRequest {
  if (!obj || typeof obj !== 'object') return false;
  const rule = obj as Record<string, unknown>;
  return (
    typeof rule.active === 'boolean' &&
    typeof rule.url === 'string' &&
    (rule.note === undefined || typeof rule.note === 'string') &&
    rule.condition !== null &&
    typeof rule.condition === 'object' &&
    typeof (rule.condition as Record<string, unknown>).urlFilter === 'string' &&
    typeof (rule.condition as Record<string, unknown>).requestDomains === 'string'
  );
}

export function isValidTab(obj: unknown): obj is TabType {
  if (!obj || typeof obj !== 'object') return false;
  const tab = obj as Record<string, unknown>;
  return (
    typeof tab.name === 'string' &&
    typeof tab.active === 'boolean' &&
    (tab.requestDomains === undefined || typeof tab.requestDomains === 'string') &&
    Array.isArray(tab.requestHeaders) &&
    Array.isArray(tab.responseHeaders) &&
    Array.isArray(tab.blockedRequests) &&
    Array.isArray(tab.redirectRequests)
  );
}

export function isValidFolder(obj: unknown): obj is FolderType {
  if (!obj || typeof obj !== 'object') return false;
  const folder = obj as Record<string, unknown>;
  return (
    typeof folder.name === 'string' &&
    typeof folder.active === 'boolean' &&
    Array.isArray(folder.tabs) &&
    folder.tabs.every(isValidTab)
  );
}

export function isValidExportPayload(obj: unknown): obj is ExportPayload {
  if (!obj || typeof obj !== 'object') return false;
  const payload = obj as Record<string, unknown>;
  return (
    payload.name === 'modbox' &&
    typeof payload.version === 'number' &&
    Array.isArray(payload.folders) &&
    payload.folders.every(isValidFolder)
  );
}

export function isValidDataType(obj: unknown): obj is DataType {
  if (!obj || typeof obj !== 'object') return false;
  const data = obj as Record<string, unknown>;
  return (
    typeof data.active === 'boolean' &&
    Array.isArray(data.folders) &&
    data.folders.every(isValidFolder)
  );
}
