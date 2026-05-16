const input = document.querySelector("#messageInput");
const displayText = document.querySelector("#displayText");
const presenter = document.querySelector("#presenter");
const presenterText = document.querySelector("#presenterText");
const showButton = document.querySelector("#showButton");
const clearButton = document.querySelector("#clearButton");
const closePresenter = document.querySelector("#closePresenter");
const fontRange = document.querySelector("#fontRange");
const phraseButtons = document.querySelectorAll(".phrase");
const installButton = document.querySelector("#installButton");

let deferredInstallPrompt;

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
