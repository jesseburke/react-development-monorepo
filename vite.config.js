// @ts-check
const reactPlugin = require('vite-plugin-react');

/**
 * @type { import('vite').UserConfig }
 */
const config = {
    jsx: 'react',
    plugins: [reactPlugin],
    base: '/u/jburke/secOrderGrapher/'
};

//base: '/u/jburke/logisticGrapher/'
//base: '/u/jburke/linearGrapher/'
//base: '/u/jburke/sepGrapher/'

module.exports = config;
