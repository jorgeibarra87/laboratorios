import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr(), tailwindcss()],
  server: {
    host: "0.0.0.0", // permite acceso desde otras IPs
    port: 5173, // puerto del servidor
  },
});
