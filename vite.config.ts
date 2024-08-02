import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import zipPack from "vite-plugin-zip-pack";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    zipPack({})
  ],
})
