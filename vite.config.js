import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

export default defineConfig({
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
