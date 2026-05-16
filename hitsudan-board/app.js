const app = document.querySelector(".app");
const input = document.querySelector("#messageInput");
const mirrorText = document.querySelector("#mirrorText");
const speechStatus = document.querySelector("#speechStatus");
const flipButton = document.querySelector("#flipButton");
const clearButton = document.querySelector("#clearButton");
const fontRange = document.querySelector("#fontRange");

const defaultPlaceholder = "ここに表示";

function syncMirror() {
  const text = input.value.trim();
  mirrorText.textContent = text || defaultPlaceholder;
  mirrorText.classList.toggle("empty", !text);
}

fontRange.addEventListener("input", () => {
  document.documentElement.style.setProperty("--text-size", `${fontRange.value}px`);
});

flipButton.addEventListener("click", () => {
  const flipped = app.classList.toggle("flipped");
  flipButton.classList.toggle("active", flipped);
  flipButton.setAttribute("aria-pressed", String(flipped));
  speechStatus.textContent = flipped ? "上下反転中" : "通常表示中";
  syncMirror();
});

clearButton.addEventListener("click", () => {
  input.value = "";
  input.placeholder = defaultPlaceholder;
  syncMirror();
  input.focus();
});

input.addEventListener("input", () => {
  input.placeholder = defaultPlaceholder;
  syncMirror();
});

flipButton.setAttribute("aria-pressed", "true");
syncMirror();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
