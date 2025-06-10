import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    __GEMINI_API_KEY__: JSON.stringify(process.env.VITE_GEMINI_API_KEY) // Not sure if API key should be here or in .env file
  }
})


//! Day 1.3 Replaced with above due to gemini flash integration steps (instead of tesseract.js)

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [vue()],
//   server: {
//     port: 3000,
//     open: true
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: true
//   },
//   resolve: {
//     alias: {
//       '@': '/src'
//     }
//   }
// })




