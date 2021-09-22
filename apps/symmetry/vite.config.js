import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    plugins: [reactRefresh()],
    build: {
        rollupOptions: {
            input: {
                freeDraw: resolve(__dirname, 'freeDraw/index.html'),
                freeDrawReflection: resolve(
                    __dirname,
                    'freeDrawReflection/index.html'
                ),
                freeDrawRotation: resolve(__dirname, 'freeDrawRotation/index.html'),
                freeDrawTranslation: resolve(
                    __dirname,
                    '/freeDrawTranslation/index.html'
                ),
                graphDraw: resolve(__dirname, 'graphDraw/index.html'),
                graphDrawReflection: resolve(
                    __dirname,
                    'graphDrawReflection/index.html'
                ),
                graphDrawRotation: resolve(__dirname, 'graphDrawRotation/index.html'),
                graphDrawTranslation: resolve(
                    __dirname,
                    'graphDrawTranslation/index.html'
                )
            },
            output: {
                dir: 'dist'
            }
        }
    },
    optimizeDeps: {
        include: ['jotai/utils']
    },
    server: {
        watch: {
            usePolling: true
        },
        hmr: {
            protocol: 'ws',
            host: 'localhost'
        }
    }
});
