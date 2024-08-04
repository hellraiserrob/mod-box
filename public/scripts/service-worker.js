function setBadge() {
  chrome.storage.local.get(["totalActiveRules"], (result) => {
    if(result.totalActiveRules) {
      const total = parseInt(result.totalActiveRules);
      chrome.action.setBadgeBackgroundColor({ color: "blue" })
      chrome.action.setBadgeText({ text: total > 0 ? `${total}`: '' });
    }
  });
}
function handleStartup() {
  setBadge();
}

function handleInstalled() {
  setBadge();
}

chrome.runtime.onStartup.addListener(handleStartup);
chrome.runtime.onInstalled.addListener(handleInstalled)