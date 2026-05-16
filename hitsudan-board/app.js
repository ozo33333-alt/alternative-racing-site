const input = document.querySelector("#messageInput");
const speechStatus = document.querySelector("#speechStatus");
const micButton = document.querySelector("#micButton");
const clearButton = document.querySelector("#clearButton");
const fontRange = document.querySelector("#fontRange");

const defaultPlaceholder = "ここに表示";

function openKeyboard() {
  input.focus({ preventScroll: true });
  input.click();
  speechStatus.textContent = "キーボードのマイクを押してください";
}

fontRange.addEventListener("input", () => {
  document.documentElement.style.setProperty("--text-size", `${fontRange.value}px`);
});

micButton.addEventListener("click", openKeyboard);

clearButton.addEventListener("click", () => {
  input.value = "";
  input.placeholder = defaultPlaceholder;
  speechStatus.textContent = "マイクボタンでキーボードを開きます";
  openKeyboard();
});

input.addEventListener("input", () => {
  input.placeholder = defaultPlaceholder;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
