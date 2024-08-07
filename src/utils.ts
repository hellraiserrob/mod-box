// @ts-ignore  
import { DataType, FolderType, TabType } from "../interaces.ts"

export function generateRules(data: DataType) {
  const rules: any = [];
  let id = 1;

  if (!data.active) {
    return [];
  }

  data.folders.forEach((folder:FolderType) => {
    if (folder.active) {
      folder.tabs.forEach((tab: TabType) => {
        if (tab.active) {
          // blocking rules
          tab.blockedRequests?.forEach((request:any) => {
            if (request.active) {
              rules.push({
                id,
                priority: 1,
                action: { type: "block" },
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: request.condition.requestDomains.split(",") }),
                  ...(!request.condition.requestDomains && tab.requestDomains && { requestDomains: tab.requestDomains.split(",") }),
                  ...(request.condition.document && { resourceTypes: ["main_frame"] }),
                },
              });

              id += 1;
            }
          });

          // request rules
          tab.requestHeaders?.forEach((request:any) => {
            if (request.active && request.name !== "") {
              rules.push({
                id,
                priority: 1,
                action: {
                  type: "modifyHeaders",
                  requestHeaders: [{ header: request.name, operation: "set", value: request.value }]
                },
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: request.condition.requestDomains.split(",") }),
                  ...(!request.condition.requestDomains && tab.requestDomains && { requestDomains: tab.requestDomains.split(",") }),
                  resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"]
                }
              });

              id += 1;
            }
          });

          // response rules
          tab.responseHeaders?.forEach((request:any) => {
            if (request.active && request.name !== "") {
              rules.push({
                id,
                priority: 1,
                action: {
                  type: "modifyHeaders",
                  responseHeaders: [{ header: request.name, operation: "set", value: request.value }]
                },
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: request.condition.requestDomains.split(",") }),
                  ...(!request.condition.requestDomains && tab.requestDomains && { requestDomains: tab.requestDomains.split(",") }),
                  resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"]
                }
              });

              id += 1;
            }
          });
        }
      });
    }
  });

  return rules;
}