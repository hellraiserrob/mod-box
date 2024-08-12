export interface TabType {
  name: string;
  requestDomains?: string;
  active: boolean;
  requestHeaders?: any[];
  responseHeaders?: any[];
  blockedRequests?: any[];
  redirectRequests?: any[];
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
