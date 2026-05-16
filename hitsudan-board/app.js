const input = document.querySelector("#messageInput");
const speechStatus = document.querySelector("#speechStatus");
const micButton = document.querySelector("#micButton");
const clearButton = document.querySelector("#clearButton");
const fontRange = document.querySelector("#fontRange");

const defaultPlaceholder = "ここに表示";
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
  input.placeholder = defaultPlaceholder;
  const spacer = input.value.trim() ? "\n" : "";
  input.value = `${input.value}${spacer}${text}`;
  input.focus();
}

fontRange.addEventListener("input", () => {
  document.documentElement.style.setProperty("--text-size", `${fontRange.value}px`);
});

clearButton.addEventListener("click", () => {
  if (recognition && listening) recognition.stop();
  input.value = "";
  input.placeholder = defaultPlaceholder;
  setListening(false);
  input.focus();
});

if (isIos()) {
  speechStatus.textContent = "iPhone Safariはキーボードなしの音声認識に未対応です";
  micButton.addEventListener("click", () => {
    speechStatus.textContent = "iPhoneではマイクボタン単体で文字起こしできません。キーボードのマイクか、ネイティブアプリ化が必要です。";
  });
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
      input.placeholder = defaultPlaceholder;
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  });
} else {
  speechStatus.textContent = "このブラウザはマイクボタンに未対応です。";
  micButton.addEventListener("click", () => {
    speechStatus.textContent = "このブラウザではキーボードなしの音声入力は使えません。";
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
