import { createApp } from "vue"
import "./style.scss"
import App from "./App.vue"
import { isValidThemePreference, type ThemePreference } from "./interfaces"
import { isChrome } from "./utils"

async function loadTheme(): Promise<ThemePreference> {
  try {
    const savedTheme = isChrome
      ? (await chrome.storage.local.get("theme")).theme
      : window.localStorage.getItem("theme")
    if (isValidThemePreference(savedTheme)) {
      return savedTheme
    }
    if (savedTheme != null) {
      console.warn("Invalid saved theme preference; using Auto")
    }
  } catch (error) {
    console.error("Could not restore theme preference; using Auto", error)
  }
  return "auto"
}

async function startPopup() {
  const initialTheme = await loadTheme()
  createApp(App, { initialTheme }).mount("#app")
}

void startPopup()
