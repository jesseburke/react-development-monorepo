import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
const { resolve } = require('path');

export default defineConfig({
    base: '/u/jburke/directionFieldGrapher/',
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
