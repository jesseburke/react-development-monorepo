import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    base: '/u/jburke/',
    plugins: [reactRefresh()],
    build: {
        rollupOptions: {
            input: {
                App_df: resolve(__dirname, 'public_pages/directionFieldGrapher/index.html'),
                App_sep: resolve(__dirname, 'public_pages/sepGrapher/index.html'),
                App_linear: resolve(__dirname, 'public_pages/linearGrapher/index.html'),
                App_logistic: resolve(__dirname, 'public_pages/logisticGrapher/index.html'),
                App_resonance: resolve(__dirname, 'public_pages/resonance/index.html'),
                SecOrder: resolve(__dirname, 'public_pages/secOrderGrapher/index.html'),
                App_vs: resolve(__dirname, 'public_pages/vibrating_string/index.html'),
                App_fg: resolve(__dirname, 'public_pages/fg3d/index.html'),
                SvgFuncGraph: resolve(__dirname, 'public_pages/svgFuncGrapher/index.html'),
                SvgParamGraph: resolve(__dirname, 'public_pages/svgParamGrapher/index.html'),
                FreeDraw: resolve(__dirname, 'public_pages/freeDraw/index.html'),
                FreeDrawReflection: resolve(
                    __dirname,
                    'public_pages/freeDrawReflection/index.html'
                ),
                FreeDrawRotation: resolve(__dirname, 'public_pages/freeDrawRotation/index.html'),
                FreeDrawTranslation: resolve(
                    __dirname,
                    'public_pages/freeDrawTranslation/index.html'
                ),
                GraphDraw: resolve(__dirname, 'public_pages/graphDraw/index.html'),
                GraphDrawReflection: resolve(
                    __dirname,
                    'public_pages/graphDrawReflection/index.html'
                ),
                GraphDrawRotation: resolve(__dirname, 'public_pages/graphDrawRotation/index.html'),
                GraphDrawTranslation: resolve(
                    __dirname,
                    'public_pages/graphDrawTranslation/index.html'
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
