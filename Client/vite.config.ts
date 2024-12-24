import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '4173', 10),
    host: true, // Allow network access
  },
  preview: {
    port: parseInt(process.env.PORT || '4173', 10),
    host: true, // Allow network access
  },
});
