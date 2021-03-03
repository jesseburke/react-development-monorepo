import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    base: '/u/jburke/directionFieldGrapher/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                df: resolve(__dirname, 'src/pages/df/App_df'),
                sep: resolve(__dirname, 'src/pages/df/App_sep')
            }
        }
    },
    plugins: [reactRefresh()],
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
