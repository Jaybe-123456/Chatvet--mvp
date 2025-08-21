import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "./",  // 👈 ensures assets load on Netlify
  build: {
    outDir: "dist",
  }
})

