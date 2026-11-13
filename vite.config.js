import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: [
      "nk142vaevubnfbph6gk1q67y.187.127.206.182.sslip.io",
      "kaboz.ae",
      "www.kaboz.ae",
      "admin.kaboz.ae"
    ]
  }
});