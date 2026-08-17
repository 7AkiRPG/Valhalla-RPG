import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base precisa bater com o nome do repositório no GitHub Pages:
// https://<usuario>.github.io/Valhalla-RPG/
export default defineConfig({
  plugins: [react()],
  base: '/Valhalla-RPG/',
})
