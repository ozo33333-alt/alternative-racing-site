const input = document.querySelector("#messageInput");
const speechStatus = document.querySelector("#speechStatus");
const micButton = document.querySelector("#micButton");
const clearButton = document.querySelector("#clearButton");
const fontRange = document.querySelector("#fontRange");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let listening = false;

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function setListening(active) {
  listening = active;
  micButton.classList.toggle("listening", active);
  micButton.textContent = active ? "停止" : "マイク";
  speechStatus.textContent = active ? "音声入力中" : "音声入力は停止中";
}

function appendText(text) {
  const spacer = input.value.trim() ? "\n" : "";
  input.value = `${input.value}${spacer}${text}`;
  input.focus();
}

fontRange.addEventListener("input", () => {
  document.documentElement.style.setProperty("--text-size", `${fontRange.value}px`);
});

clearButton.addEventListener("click", () => {
  input.value = "";
  input.focus();
});

if (isIos()) {
  speechStatus.textContent = "iPhoneは入力欄を押して、キーボードのマイクを使ってください";
  micButton.addEventListener("click", () => input.focus());
} else if (SpeechRecognition) {
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

    if (finalText) appendText(finalText.trim());
    else if (interimText) input.placeholder = interimText.trim();
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
  speechStatus.textContent = "このブラウザはマイクボタンに未対応です。入力欄の音声入力を使ってください。";
  micButton.addEventListener("click", () => input.focus());
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
