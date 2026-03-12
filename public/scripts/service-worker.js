/**
 * Badge management
 */
function setBadge() {
  chrome.storage.local.get(["totalActiveRules"], (result) => {
    if(result.totalActiveRules) {
      const total = parseInt(result.totalActiveRules);
      chrome.action.setBadgeBackgroundColor({ color: "blue" })
      chrome.action.setBadgeText({ text: total > 0 ? `${total}`: '' });
    }
  });
}

/**
 * Network conditions emulation via Chrome DevTools Protocol
 * Requires Chrome 145+ for Network.emulateNetworkConditionsByRule
 */
const attachedTabs = new Map(); // tabId -> debuggeeId

function getChromeVersion() {
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function isNetworkConditionsSupported() {
  return getChromeVersion() >= 145;
}

async function getNetworkConditions() {
  const data = await chrome.storage.local.get(["networkConditions"]);
  if (data.networkConditions) {
    try {
      return JSON.parse(data.networkConditions);
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function applyNetworkConditions(tabId) {
  if (!isNetworkConditionsSupported()) {
    return;
  }

  const conditions = await getNetworkConditions();
  
  if (!conditions || !conditions.matchedNetworkConditions?.length) {
    // No conditions - detach if attached
    await detachDebugger(tabId);
    return;
  }

  try {
    // Attach debugger if not already attached
    if (!attachedTabs.has(tabId)) {
      await chrome.debugger.attach({ tabId }, "1.3");
      attachedTabs.set(tabId, { tabId });
    }

    // Apply network conditions via DevTools Protocol
    await chrome.debugger.sendCommand(
      { tabId },
      "Network.emulateNetworkConditionsByRule",
      {
        offline: conditions.offline || false,
        matchedNetworkConditions: conditions.matchedNetworkConditions,
      }
    );
  } catch (error) {
    console.error("Failed to apply network conditions:", error);
    // Clean up on error
    attachedTabs.delete(tabId);
  }
}

async function detachDebugger(tabId) {
  if (attachedTabs.has(tabId)) {
    try {
      await chrome.debugger.detach({ tabId });
    } catch (e) {
      // Ignore detach errors (tab may already be closed)
    }
    attachedTabs.delete(tabId);
  }
}

async function detachAllDebuggers() {
  for (const [tabId] of attachedTabs) {
    await detachDebugger(tabId);
  }
}

async function reapplyToAllTabs() {
  const conditions = await getNetworkConditions();
  
  if (!conditions || !conditions.matchedNetworkConditions?.length) {
    // No conditions - detach all
    await detachAllDebuggers();
    return;
  }

  // Apply to all currently open tabs
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith("chrome://")) {
      await applyNetworkConditions(tab.id);
    }
  }
}

// Listen for storage changes to reapply conditions
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.networkConditions) {
    reapplyToAllTabs();
  }
});

// Apply to new tabs
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url && !tab.url.startsWith("chrome://")) {
    await applyNetworkConditions(tabId);
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  attachedTabs.delete(tabId);
});

// Handle debugger detach (user closed DevTools or detached manually)
chrome.debugger.onDetach.addListener((source, reason) => {
  if (source.tabId) {
    attachedTabs.delete(source.tabId);
  }
});

function handleStartup() {
  setBadge();
  reapplyToAllTabs();
}

function handleInstalled() {
  setBadge();
  reapplyToAllTabs();
}

chrome.runtime.onStartup.addListener(handleStartup);
chrome.runtime.onInstalled.addListener(handleInstalled)