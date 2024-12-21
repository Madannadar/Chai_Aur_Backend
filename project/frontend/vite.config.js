import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server:{
    proxy:{
      '/api': 'http://localhost:3000',   //this will append before api/ 
      // not only that now every request will come from localhost3000 hence sab gar ke ho gaye
    },
  },
  plugins: [react()],
})
