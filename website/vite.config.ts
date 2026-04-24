import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    server: {
        host: "127.0.0.1",
        port: 4173,
        strictPort: true,
        open: false
    },
    preview: {
        host: "127.0.0.1",
        port: 4174,
        strictPort: true
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                start: resolve(__dirname, "pages/start.html")
            }
        }
    }
});
