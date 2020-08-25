// @ts-check
const reactPlugin = require('vite-plugin-react');

/**
 * @type { import('vite').UserConfig }
 */
const config = {
    jsx: 'react',
    plugins: [reactPlugin],
    base: '/u/jburke/vibrating_string/'
};

module.exports = config;
