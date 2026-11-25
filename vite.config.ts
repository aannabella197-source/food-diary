import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves this project from /food-diary/.
export default defineConfig({
  base: '/food-diary/',
  plugins: [react()],
})
