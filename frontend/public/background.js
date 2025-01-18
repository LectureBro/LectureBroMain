console.log("Background script loaded");

let overlayState = {
  isVisible: false,
  subtitles: [],
  position: { x: 0, y: 0 },
};

function logOverlayState() {
  console.log("Background overlay state:", overlayState);
}

const injectedTabs = new Set();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "contentScriptLoaded":
      console.log("Content script loaded in tab:", sender.tab.id);
      sendResponse({ success: true });
      chrome.tabs.sendMessage(sender.tab.id, { action: "updateOverlayState", state: overlayState });
      break;
    case "getOverlayState":
      sendResponse(overlayState);
      break;
    case "updatePosition":
      overlayState.position = request.position;
      logOverlayState();
      break;
    case "closeOverlay":
      setOverlayVisibility(false);
      break;
    case "showOverlay":
      overlayState.isVisible = true;
      overlayState.subtitles = request.subtitles || [];
      logOverlayState();
      updateAllTabs(true);
      break;
    case "hideOverlay":
      setOverlayVisibility(false);
      break;
    case "updateSubtitles":
      overlayState.subtitles = request.subtitles || [];
      logOverlayState();
      if (overlayState.isVisible) {
        updateAllTabs(true);
      }
      break;
    case "toggleOverlayForAllTabs":
      updateAllTabs(request.show);
      break;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
    console.log(`Tab ${tabId} updated to 'complete' status`);
    injectContentScript(tabId);
  }
});

function injectContentScript(tabId) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["contentScript.js"],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error injecting content script:", chrome.runtime.lastError);
      } else {
        console.log("Successfully injected content script into tab", tabId);
        injectedTabs.add(tabId);
        setTimeout(() => updateContentScript(tabId), 100);
      }
    }
  );
}

function updateContentScript(tabId) {
  console.log(`Attempting to update content script for tab: ${tabId}`);
  chrome.tabs.sendMessage(tabId, { action: "updateOverlayState", state: overlayState }, (response) => {
    if (chrome.runtime.lastError) {
      console.log(`Error updating content script for tab ${tabId}:`, chrome.runtime.lastError.message);
    } else {
      console.log(`Successfully updated content script for tab ${tabId}`);
    }
  });
}

function setOverlayVisibility(isVisible) {
  overlayState.isVisible = isVisible;
  logOverlayState();
  updateAllTabs();
}

function updateAllTabs(showOverlay) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: showOverlay ? "showOverlay" : "hideOverlay",
          subtitles: lastSubtitles,
        });
      }
    });
  });
}

chrome.tabs.onRemoved.addListener((tabId) => {
  injectedTabs.delete(tabId);
});

function getCurrentOverlayState() {
  return overlayState;
}

chrome.tabs.onCreated.addListener((tab) => {
  console.log("New tab created:", tab.id);
  if (tab.id) {
    injectContentScript(tab.id);
  }
});
