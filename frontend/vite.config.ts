import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, __dirname, "");
    const apiProxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:8080";
    const allowedHosts = [
        "f178-144-31-18-111.ngrok-free.app",
        ...(env.VITE_ALLOWED_HOSTS ?? "")
            .split(",")
            .map((host) => host.trim())
            .filter((host) => host.length > 0)
    ];
    // Для dev и preview: относительные запросы /api/* иначе попадают на статик-сервер → 404.
    const apiProxy = {
        "/api": {
            target: apiProxyTarget,
            changeOrigin: true,
            secure: false
        }
    } as const;

    return {
        server: {
            host: "127.0.0.1",
            port: 4173,
            strictPort: true,
            open: false,
            allowedHosts,
            proxy: { ...apiProxy }
        },
        preview: {
            host: "127.0.0.1",
            port: 4174,
            strictPort: true,
            allowedHosts,
            proxy: { ...apiProxy }
        },
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, "index.html"),
                    start: resolve(__dirname, "pages/start.html")
                }
            }
        }
    };
});
