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
                App_vs: resolve(__dirname, 'public_pages/vibrating_string/index.html')
            },
            output: {
                dir: 'dist'
            }
        }
    },
    optimizeDeps: {
        include: [
            'jotai/utils',
            'reakit/Checkbox',
            'reakit/Dialog',
            'reakit/Provider',
            'reakit/Tab'
        ]
    }
});
