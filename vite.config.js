import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    base: '/u/jburke/',
    plugins: [reactRefresh()],
    build: {
        rollupOptions: {
            input: {
		App_df: resolve(__dirname, 'apps/differential-equations-apps/App-df/index.html'),
                App_sep: resolve(__dirname, 'apps/direction-field-apps/App-sep/index.html'),
                App_linear: resolve(__dirname, 'apps/direction-field-apps/App-linear/index.html'),
                App_logistic: resolve(__dirname, 'apps/direction-field-apps/App-logistic/index.html'),
                App_resonance: resolve(__dirname, 'apps/direction-field-apps/App-resonance/index.html'),
                App_sec_order: resolve(__dirname, 'apps/direction-field-apps/App-sec-orderGrapher/index.html'),	
                App_vs: resolve(__dirname, 'public_pages/vibrating_string/index.html'),
                App_fg: resolve(__dirname, 'apps/function-grapher-3d/index.html'),
                SvgFuncGraph: resolve(__dirname, 'public_pages/svgFuncGrapher/index.html'),
                SvgParamGraph: resolve(__dirname, 'public_pages/svgParamGrapher/index.html'),
                FreeDraw: resolve(__dirname, 'apps/symmetry/freeDraw/index.html'),
                freeDrawReflection: resolve(
                    __dirname,
                    'apps/symmetry/freeDrawReflection/index.html'
                ),
                FreeDrawRotation: resolve(__dirname, 'apps/symmetry/freeDrawRotation/index.html'),
                FreeDrawTranslation: resolve(
                    __dirname,
                    'apps/symmmetry/freeDrawTranslation/index.html'
                ),
                GraphDraw: resolve(__dirname, 'apps/symmmetry/graphDraw/index.html'),
                GraphDrawReflection: resolve(
                    __dirname,
                    'apps/symmmetry/graphDrawReflection/index.html'
                ),
                GraphDrawRotation: resolve(__dirname, 'apps/symmmetry/graphDrawRotation/index.html'),
                GraphDrawTranslation: resolve(
                    __dirname,
                    'apps/symmmetry/graphDrawTranslation/index.html'
                ),
                DrawWithSymm: resolve(__dirname, 'apps/symmmetry/drawWithSymm/index.html')
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
