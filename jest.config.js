module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest'
    },
    preset: 'ts-jest/presets/default-esm', //'ts-jest'
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['jest-extended'],
    globals: {
        'ts-jest': {
            diagnostics: false,
            useESM: true,
            babelConfig: true
        }
    },
    moduleNameMapper: {
        '^.+\\.(css|less)$': '<rootDir>/src/cssStub.js'
    },
    transformIgnorePatterns: ['node_modules/(?!(three|React|query-string-esm)/)']
};
