const app = document.querySelector(".app");
const input = document.querySelector("#messageInput");
const speechStatus = document.querySelector("#speechStatus");
const flipButton = document.querySelector("#flipButton");
const clearButton = document.querySelector("#clearButton");
const fontRange = document.querySelector("#fontRange");

const defaultPlaceholder = "ここに表示";

async function clearOldServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

fontRange.addEventListener("input", () => {
  document.documentElement.style.setProperty("--text-size", `${fontRange.value}px`);
});

flipButton.addEventListener("click", () => {
  const flipped = app.classList.toggle("flipped");
  flipButton.classList.toggle("active", flipped);
  flipButton.setAttribute("aria-pressed", String(flipped));
  speechStatus.textContent = flipped ? "上下反転中" : "通常表示中";
});

clearButton.addEventListener("click", () => {
  input.value = "";
  input.placeholder = defaultPlaceholder;
  input.scrollTop = 0;
  input.focus();
});

input.addEventListener("input", () => {
  input.placeholder = defaultPlaceholder;
});

flipButton.setAttribute("aria-pressed", "true");
clearOldServiceWorkers().catch(() => {});
