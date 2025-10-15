import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr(), tailwindcss()],
  server: {
    host: "0.0.0.0", // permite acceso desde otras IPs
    port: 5173, // puerto del servidor
    proxy: {
      "/hcnSolExa": {
        target: "http://192.168.16.160:8002",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("❌ Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("📤 Enviando request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("📥 Respuesta recibida:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
