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


// Voice recording

let audioContext;
let sourceNode;
let processorNode;
let micStream;
let isRecording = false;

const SAMPLE_RATE = 16000; // Vosk default model

function startRecording() {
  if (isRecording) return;
  isRecording = true;
  
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      micStream = stream;
      audioContext = new AudioContext({ sampleRate: 44100 /* typical mic rate */ });
      
      // ScriptProcessorNode is deprecated, but simpler for demos. 
      processorNode = audioContext.createScriptProcessor(4096, 1, 1);
      sourceNode = audioContext.createMediaStreamSource(stream);
      
      sourceNode.connect(processorNode);
      processorNode.connect(audioContext.destination);
      
      processorNode.onaudioprocess = (audioEvent) => {
        const inputData = audioEvent.inputBuffer.getChannelData(0);
        
        // Resample from 44.1k or 48k to 16k
        // For brevity, let's assume 44.1k -> 16k. Real code would handle dynamic rates or use OfflineAudioContext.
        const resampledData = downsampleBuffer(inputData, audioContext.sampleRate, SAMPLE_RATE);
        const int16data = floatTo16BitPCM(resampledData);

        // Send to background
        chrome.runtime.sendMessage({
          type: 'AUDIO_DATA',
          payload: int16data
        });
      };
    })
    .catch(err => {
      console.error('Could not get microphone', err);
    });
}

function stopRecording() {
  if (!isRecording) return;
  isRecording = false;
  
  if (processorNode) processorNode.disconnect();
  if (sourceNode) sourceNode.disconnect();
  if (audioContext) audioContext.close();
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
  }
  
  console.log('Recording stopped.');
}

// Utility: downsample from e.g. 44100 to 16000
function downsampleBuffer(buffer, inSampleRate, outSampleRate) {
  if (outSampleRate === inSampleRate) {
    return buffer;
  }
  const ratio = outSampleRate / inSampleRate;
  const length = Math.round(buffer.length * ratio);
  const out = new Float32Array(length);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) / ratio);
    let accum = 0, count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    out[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return out;
}

// Utility: Convert Float32 -> Int16
function floatTo16BitPCM(input) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

// Listen for final/partial transcripts from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRANSCRIPT_PARTIAL') {
    console.log('[Partial]', request.data.partial);
    // You can inject partial into the DOM or overlay
  } else if (request.type === 'TRANSCRIPT_FINAL') {
    console.log('[Final]', request.data.text);
    // You can display final in the DOM or overlay
  }
});

// Auto-start or call from an extension UI
startRecording();
