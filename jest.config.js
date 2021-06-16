module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest'
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['jest-extended'],
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    },
    transformIgnorePatterns: ['node_modules/(?!(three|React|query-string-esm)/)'],
    moduleNameMapper: { '^.+\\.(css|less)$': '<rootDir>/src/cssStub.js' }
    //preset: 'ts-jest/presets/default-esm' //'ts-jest'
};
