const input = document.querySelector("#messageInput");
const displayText = document.querySelector("#displayText");
const presenter = document.querySelector("#presenter");
const presenterText = document.querySelector("#presenterText");
const speechStatus = document.querySelector("#speechStatus");
const micButton = document.querySelector("#micButton");
const showButton = document.querySelector("#showButton");
const clearButton = document.querySelector("#clearButton");
const closePresenter = document.querySelector("#closePresenter");
const fontRange = document.querySelector("#fontRange");
const phraseButtons = document.querySelectorAll(".phrase");
const installButton = document.querySelector("#installButton");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let listening = false;
let deferredInstallPrompt;

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function currentMessage() {
  return input.value.trim() || "ここに大きく表示されます";
}

function updateDisplay() {
  displayText.textContent = currentMessage();
  presenterText.textContent = currentMessage();
}

function appendText(text) {
  const spacer = input.value.trim() ? "\n" : "";
  input.value = `${input.value}${spacer}${text}`;
  input.focus();
  updateDisplay();
}

input.addEventListener("input", updateDisplay);

fontRange.addEventListener("input", () => {
  document.documentElement.style.setProperty("--display-size", `${fontRange.value}px`);
});

phraseButtons.forEach((button) => {
  button.addEventListener("click", () => appendText(button.textContent));
});

clearButton.addEventListener("click", () => {
  input.value = "";
  updateDisplay();
  input.focus();
});

showButton.addEventListener("click", async () => {
  updateDisplay();
  presenter.hidden = false;
  if (presenter.requestFullscreen) {
    try {
      await presenter.requestFullscreen();
    } catch {
      // Fullscreen may be blocked, but the large overlay still works.
    }
  }
});

closePresenter.addEventListener("click", async () => {
  presenter.hidden = true;
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !presenter.hidden) {
    presenter.hidden = true;
  }
});

function setListening(active) {
  listening = active;
  micButton.classList.toggle("listening", active);
  micButton.textContent = active ? "停止" : "音声入力";
  speechStatus.textContent = active ? "音声入力中" : "音声入力は停止中";
}

if (isIos()) {
  speechStatus.textContent = "iPhoneでは入力欄を押して、キーボードのマイクを使ってください";
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
    else if (interimText) {
      displayText.textContent = interimText.trim();
      presenterText.textContent = interimText.trim();
    }
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
  micButton.addEventListener("click", () => input.focus());
  speechStatus.textContent = "このブラウザは音声入力ボタンに未対応です。入力欄の音声入力を使ってください。";
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = undefined;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

updateDisplay();
