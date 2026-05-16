const displayText = document.querySelector("#displayText");
const speechStatus = document.querySelector("#speechStatus");
const micButton = document.querySelector("#micButton");
const clearButton = document.querySelector("#clearButton");
const fontRange = document.querySelector("#fontRange");

const defaultText = "ここに表示";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let listening = false;
let committedText = "";

function setListening(active) {
  listening = active;
  micButton.classList.toggle("listening", active);
  micButton.textContent = active ? "停止" : "マイク";
  speechStatus.textContent = active ? "音声入力中" : "音声入力は停止中";
}

function render(text) {
  displayText.textContent = text.trim() || defaultText;
  displayText.classList.toggle("empty", !text.trim());
}

function appendText(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  committedText = committedText ? `${committedText}\n${trimmed}` : trimmed;
  render(committedText);
}

fontRange.addEventListener("input", () => {
  document.documentElement.style.setProperty("--text-size", `${fontRange.value}px`);
});

clearButton.addEventListener("click", () => {
  if (recognition && listening) recognition.stop();
  committedText = "";
  render("");
  setListening(false);
});

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.addEventListener("result", (event) => {
    let finalText = "";
    let interimText = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (result.isFinal) finalText += result[0].transcript;
      else interimText += result[0].transcript;
    }

    if (finalText) appendText(finalText);
    else if (interimText) render(committedText ? `${committedText}\n${interimText}` : interimText);
  });

  recognition.addEventListener("end", () => setListening(false));
  recognition.addEventListener("error", (event) => {
    setListening(false);
    speechStatus.textContent = `音声入力エラー: ${event.error}`;
  });

  micButton.addEventListener("click", () => {
    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  });
} else {
  micButton.addEventListener("click", () => {
    speechStatus.textContent = "このChromeでは音声認識が使えません";
  });
  speechStatus.textContent = "このChromeでは音声認識が使えません";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

render("");
