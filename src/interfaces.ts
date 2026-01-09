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
  condition: RuleCondition;
}

export interface BlockedRequest {
  active: boolean;
  condition: RuleCondition;
}

export interface RedirectRequest {
  active: boolean;
  url: string;
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
