import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/sessions": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
      "/static": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
      "/documents": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
      "/upload-pdf": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
      "/chat": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },
});