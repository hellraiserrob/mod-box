export interface TabType {
  name: string;
  active: boolean;
  requestHeaders?: any[];
  responseHeaders?: any[];
  blockedRequests?: any[];
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
