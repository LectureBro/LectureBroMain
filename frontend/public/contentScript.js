console.log("Content script loaded");

let overlayDiv = null;
let isDragging = false;
let dragStartX, dragStartY;
let isOverlayVisible = false;
let overlayPosition = { left: "50%", top: "auto", bottom: "20px", transform: "translateX(-50%)" };
let lastSubtitles = [];

function createOverlay() {
  overlayDiv = document.createElement("div");
  overlayDiv.id = "lectureBroOverlay";
  overlayDiv.style.cssText = `
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    max-width: 90vw;
    height: 200px;
    background-color: rgba(30, 30, 30, 0.9);
    color: white;
    border-radius: 12px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    z-index: 2147483647;
    transition: all 0.3s ease;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    backdrop-filter: blur(10px);
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: rgba(60, 60, 60, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    cursor: move;
  `;

  const dragHandle = document.createElement("div");
  dragHandle.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    width: 18px;
    height: 12px;
    justify-content: space-between;
    align-items: center;
  `;

  const title = document.createElement("div");
  title.textContent = "LectureBro";
  title.style.cssText = `
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    margin-left: 8px;
  `;

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&#x2715;"; // Unicode for '×'
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  `;
  closeButton.addEventListener("click", closeOverlay);
  closeButton.addEventListener("mouseover", () => {
    closeButton.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    closeButton.style.color = "#fff";
  });
  closeButton.addEventListener("mouseout", () => {
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.color = "rgba(255, 255, 255, 0.7)";
  });

  header.appendChild(dragHandle);
  header.appendChild(title);
  header.appendChild(closeButton);

  const content = document.createElement("div");
  content.id = "lectureBroOverlayContent";
  content.style.cssText = `
    padding: 16px;
    height: calc(100% - 45px); // Adjust based on your header height
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
`;
  content.innerHTML = '<p style="opacity: 0.7; text-align: center;">Waiting for subtitles...</p>';

  overlayDiv.appendChild(header);
  overlayDiv.appendChild(content);
  document.body.appendChild(overlayDiv);

  header.addEventListener("mousedown", startDragging);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDragging);

  overlayDiv.animate(
    [
      { opacity: 0, transform: "translateX(-50%) translateY(20px)" },
      { opacity: 1, transform: "translateX(-50%) translateY(0)" },
    ],
    {
      duration: 300,
      easing: "ease-out",
    }
  );

  updateOverlayPosition(overlayPosition);
}

function updateOverlayPosition(position) {
  if (overlayDiv) {
    Object.assign(overlayDiv.style, {
      left: position.left,
      top: position.top,
      bottom: position.bottom,
      transform: position.transform,
    });
  }
}

function startDragging(e) {
  isDragging = true;
  const rect = overlayDiv.getBoundingClientRect();
  dragStartX = e.clientX - rect.left;
  dragStartY = e.clientY - rect.top;
  overlayDiv.style.transition = "none";
  overlayDiv.style.transform = "none";
  overlayDiv.style.bottom = "auto";
  overlayDiv.style.left = `${rect.left}px`;
  overlayDiv.style.top = `${rect.top}px`;
}

function drag(e) {
  if (isDragging) {
    const newX = e.clientX - dragStartX;
    const newY = e.clientY - dragStartY;
    overlayDiv.style.left = `${newX}px`;
    overlayDiv.style.top = `${newY}px`;
    overlayDiv.style.bottom = "auto";
    overlayDiv.style.transform = "none";

    overlayPosition = {
      left: `${newX}px`,
      top: `${newY}px`,
      bottom: "auto",
      transform: "none",
    };

    chrome.runtime.sendMessage({
      action: "updatePosition",
      position: overlayPosition,
    });
  }
}

function stopDragging() {
  isDragging = false;
  overlayDiv.style.transition = "opacity 0.3s ease";
}

function updateOverlay(subtitles) {
  if (!overlayDiv) {
    createOverlay();
  }
  const content = document.getElementById("lectureBroOverlayContent");
  if (content) {
    if (subtitles.length === 0) {
      content.innerHTML = '<p style="opacity: 0.7;">Waiting for subtitles...</p>';
    } else {
      const subtitleElements = subtitles.slice(-3).map((subtitle, index) => {
        const opacity = 1 - index * 0.3;
        return `<p style="opacity: ${opacity};">${subtitle}</p>`;
      });
      content.innerHTML = subtitleElements.join("");
    }
  }
  isOverlayVisible = true;
  lastSubtitles = subtitles;
  chrome.storage.local.set({ isOverlayVisible, lastSubtitles, overlayPosition });
}

function removeOverlay() {
  if (overlayDiv) {
    overlayDiv.style.opacity = "0";
    setTimeout(() => {
      if (overlayDiv && overlayDiv.parentNode) {
        overlayDiv.parentNode.removeChild(overlayDiv);
      }
      overlayDiv = null;
    }, 300);
  }
}

function closeOverlay() {
  isOverlayVisible = false;
  removeOverlay();
  chrome.runtime.sendMessage({ action: "closeOverlay" });
  chrome.storage.local.set({ isOverlayVisible });
}

function handleOverlayState(state) {
  console.log("Handling overlay state:", state);
  if (state.isVisible) {
    if (!overlayDiv) {
      createOverlay();
    }
    updateOverlay(state.subtitles || []);
    updateOverlayPosition(state.position || overlayPosition);
    isOverlayVisible = true;
  } else {
    removeOverlay();
    isOverlayVisible = false;
  }
  chrome.storage.local.set({ isOverlayVisible, lastSubtitles: state.subtitles || [], overlayPosition: state.position || overlayPosition });
}

function initializeOverlay() {
  chrome.storage.local.get(["isOverlayVisible", "overlayPosition", "lastSubtitles"], (result) => {
    if (result.isOverlayVisible) {
      overlayPosition = result.overlayPosition || overlayPosition;
      updateOverlay(result.lastSubtitles || []);
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  switch (request.action) {
    case "showOverlay":
      isOverlayVisible = true;
      updateOverlay(request.subtitles || []);
      break;
    case "hideOverlay":
      isOverlayVisible = false;
      removeOverlay();
      break;
    case "updateSubtitles":
      if (isOverlayVisible) {
        updateOverlay(request.subtitles || []);
      }
      lastSubtitles = request.subtitles || [];
      break;
    case "toggleSubtitles":
      isOverlayVisible = !isOverlayVisible;
      if (isOverlayVisible) {
        updateOverlay(lastSubtitles);
      } else {
        removeOverlay();
      }
      break;
  }
  sendResponse({ success: true });
});

// Initialize the overlay when the content script loads
initializeOverlay();

// Notify the background script that the content script has loaded
chrome.runtime.sendMessage({ action: "contentScriptLoaded" });
