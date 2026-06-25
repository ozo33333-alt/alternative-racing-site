const app = document.querySelector(".app");
const input = document.querySelector("#messageInput");
const speechStatus = document.querySelector("#speechStatus");
const micButton = document.querySelector("#micButton");
const flipButton = document.querySelector("#flipButton");
const clearButton = document.querySelector("#clearButton");
const fontRange = document.querySelector("#fontRange");

const defaultPlaceholder = "ここに表示";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let listening = false;
let flipped = app.classList.contains("flipped");
let speechBaseText = "";

async function clearOldServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

function setStatus(message) {
  speechStatus.textContent = `${message} / ${flipped ? "上下反転中" : "通常表示中"}`;
}

function setInputValue(value) {
  input.value = value;
  input.placeholder = defaultPlaceholder;
  input.scrollTop = input.scrollHeight;
}

function joinSpeechText(base, spoken) {
  const cleanBase = base.trim();
  const cleanSpoken = spoken.trim();
  if (!cleanBase) return cleanSpoken;
  if (!cleanSpoken) return cleanBase;
  return `${cleanBase}\n${cleanSpoken}`;
}

function setListening(active) {
  listening = active;
  micButton.classList.toggle("listening", active);
  micButton.setAttribute("aria-pressed", String(active));
  setStatus(active ? "聞き取り中" : "マイク停止中");
}

fontRange.addEventListener("input", () => {
  document.documentElement.style.setProperty("--text-size", `${fontRange.value}px`);
});

flipButton.addEventListener("click", () => {
  flipped = app.classList.toggle("flipped");
  flipButton.classList.toggle("active", flipped);
  flipButton.setAttribute("aria-pressed", String(flipped));
  setStatus(listening ? "聞き取り中" : "マイク停止中");
});

clearButton.addEventListener("click", () => {
  if (recognition && listening) {
    recognition.stop();
  }
  speechBaseText = "";
  input.value = "";
  input.placeholder = defaultPlaceholder;
  input.scrollTop = 0;
  setListening(false);
});

input.addEventListener("input", () => {
  input.placeholder = defaultPlaceholder;
  if (!listening) {
    speechBaseText = input.value;
  }
});

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.addEventListener("result", (event) => {
    let finalText = "";
    let interimText = "";

    for (let index = 0; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (result.isFinal) {
        finalText += result[0].transcript;
      } else {
        interimText += result[0].transcript;
      }
    }

    setInputValue(joinSpeechText(speechBaseText, `${finalText}${interimText}`));
  });

  recognition.addEventListener("end", () => {
    speechBaseText = input.value;
    setListening(false);
  });

  recognition.addEventListener("error", (event) => {
    setListening(false);
    if (event.error === "not-allowed") {
      setStatus("マイク許可が必要です");
    } else if (event.error === "no-speech") {
      setStatus("声が拾えませんでした");
    } else {
      setStatus(`音声入力エラー: ${event.error}`);
    }
  });
} else {
  micButton.disabled = true;
  setStatus("このブラウザはアプリ内マイク非対応です");
}

micButton.addEventListener("click", () => {
  if (!recognition) return;

  if (listening) {
    recognition.stop();
    setListening(false);
    return;
  }

  try {
    speechBaseText = input.value;
    recognition.start();
    setListening(true);
  } catch {
    setListening(false);
  }
});

flipButton.setAttribute("aria-pressed", String(flipped));
micButton.setAttribute("aria-pressed", "false");
setStatus("マイク停止中");
clearOldServiceWorkers().catch(() => {});
