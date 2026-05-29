import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("monaco-editor")) {
            return "monaco";
          }

          if (
            id.includes("three") ||
            id.includes("@react-three") ||
            id.includes("rapier")
          ) {
            return "three-world";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ["@react-three/fiber", "@react-three/drei"]
  }
});
