import { DataType, FolderType, TabType } from "./interfaces"

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
          // request header rules
          tab.requestHeaders?.forEach((request:any) => {
            if (request.active && request.name !== "") {
              rules.push({
                id,
                priority: 1,
                action: {
                  type: "modifyHeaders",
                  requestHeaders: [{ 
                    header: request.name,
                    operation: request.operation || "set",
                    // remove operation cannot have a value
                    ...(request.operation !== "remove" && { value: request.value })
                  }]
                },
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: parseDomains(request.condition.requestDomains) }),
                  ...(!request.condition.requestDomains && tab.requestDomains && { requestDomains: parseDomains(tab.requestDomains) }),
                  resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"]
                }
              });

              id += 1;
            }
          });

          // response header rules
          tab.responseHeaders?.forEach((request:any) => {
            if (request.active && request.name !== "") {
              rules.push({
                id,
                priority: 1,
                action: {
                  type: "modifyHeaders",
                  responseHeaders: [{ 
                    header: request.name,
                    operation: request.operation || "set",
                    // remove operation cannot have a value
                    ...(request.operation !== "remove" && { value: request.value })
                  }]
                },
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: parseDomains(request.condition.requestDomains) }),
                  ...(!request.condition.requestDomains && tab.requestDomains && { requestDomains: parseDomains(tab.requestDomains) }),
                  resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"]
                }
              });

              id += 1;
            }
          });

          // redirect rules
          tab.redirectRequests?.forEach((request:any) => {
            if (request.active && request.url !== "") {
              rules.push({
                id,
                priority: 1,
                action: { type: "redirect", "redirect": { "url": request.url }},
                condition: {
                  ...(request.condition.urlFilter !== "" && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: parseDomains(request.condition.requestDomains) }),
                  ...(!request.condition.requestDomains && tab.requestDomains && { requestDomains: parseDomains(tab.requestDomains) }),
                },
              });

              id += 1;
            }
          });

          // blocking rules
          tab.blockedRequests?.forEach((request:any) => {
            if (request.active) {
              rules.push({
                id,
                priority: 1,
                action: { type: "block" },
                condition: {
                  ...(request.condition.urlFilter !== "" && !request.condition.document && { urlFilter: request.condition.urlFilter }),
                  ...(request.condition.requestDomains && { requestDomains: parseDomains(request.condition.requestDomains) }),
                  ...(!request.condition.requestDomains && tab.requestDomains && { requestDomains: parseDomains(tab.requestDomains) }),
                  ...(!request.condition.document && { resourceTypes: ["stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"] }),
                  ...(request.condition.document && { resourceTypes: ["main_frame", "sub_frame"] }),
                },
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

export const isChrome: boolean =
  chrome && chrome.declarativeNetRequest && chrome.storage;

export const parseDomains = (domains: string) => {
  const domainsArray = domains.split(",");
  return domainsArray.map(domain => cleanDomain(domain))
}

export const cleanDomain = (domain: string) => {
  return domain.trim().replace(/^https?:\/\//i, "")
}