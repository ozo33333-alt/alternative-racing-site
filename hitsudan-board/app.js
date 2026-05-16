const app = document.querySelector(".app");
const input = document.querySelector("#messageInput");
const mirrorText = document.querySelector("#mirrorText");
const speechStatus = document.querySelector("#speechStatus");
const flipButton = document.querySelector("#flipButton");
const clearButton = document.querySelector("#clearButton");
const fontRange = document.querySelector("#fontRange");

const defaultPlaceholder = "ここに表示";
let syncingScroll = false;

async function clearOldServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

function syncMirror() {
  const text = input.value.trim();
  mirrorText.textContent = text || defaultPlaceholder;
  mirrorText.classList.toggle("empty", !text);
}

function beginEditing() {
  app.classList.add("editing");
  input.focus({ preventScroll: true });
}

function endEditingSoon() {
  setTimeout(() => {
    if (document.activeElement !== input) app.classList.remove("editing");
  }, 80);
}

function syncMirrorScrollFromInput() {
  if (syncingScroll) return;
  syncingScroll = true;
  mirrorText.scrollTop = input.scrollTop;
  requestAnimationFrame(() => {
    syncingScroll = false;
  });
}

function syncInputScrollFromMirror() {
  if (syncingScroll) return;
  syncingScroll = true;
  input.scrollTop = mirrorText.scrollTop;
  requestAnimationFrame(() => {
    syncingScroll = false;
  });
}

fontRange.addEventListener("input", () => {
  document.documentElement.style.setProperty("--text-size", `${fontRange.value}px`);
  requestAnimationFrame(syncMirrorScrollFromInput);
});

flipButton.addEventListener("click", () => {
  const flipped = app.classList.toggle("flipped");
  app.classList.remove("editing");
  flipButton.classList.toggle("active", flipped);
  flipButton.setAttribute("aria-pressed", String(flipped));
  speechStatus.textContent = flipped ? "上下反転中" : "通常表示中";
  syncMirror();
  requestAnimationFrame(syncMirrorScrollFromInput);
});

clearButton.addEventListener("click", () => {
  input.value = "";
  input.placeholder = defaultPlaceholder;
  input.scrollTop = 0;
  mirrorText.scrollTop = 0;
  syncMirror();
  beginEditing();
});

input.addEventListener("focus", () => app.classList.add("editing"));
input.addEventListener("blur", endEditingSoon);
input.addEventListener("input", () => {
  input.placeholder = defaultPlaceholder;
  syncMirror();
  requestAnimationFrame(syncMirrorScrollFromInput);
});

input.addEventListener("scroll", syncMirrorScrollFromInput);
mirrorText.addEventListener("click", beginEditing);
mirrorText.addEventListener("touchend", beginEditing);
mirrorText.addEventListener("scroll", syncInputScrollFromMirror);

flipButton.setAttribute("aria-pressed", "true");
syncMirror();
clearOldServiceWorkers().catch(() => {});
