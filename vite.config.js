// @ts-check
const reactPlugin = require('vite-plugin-react');

/**
 * @type { import('vite').UserConfig }
 */
const config = {
    jsx: 'react',
    plugins: [reactPlugin],
    base: '/u/jburke/sepGrapher/'
};

//base: '/u/jburke/linearGrapher/'
//base: '/u/jburke/logisticGrapher/'

module.exports = config;
