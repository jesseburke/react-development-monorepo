const colors = require('tailwindcss/colors');

module.exports = {
    purge: ['./src/**/*.html', './src/**/*.js', './src/**/*.tsx', './src/**/*.jsx'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                coolGray: colors.coolGray,
                warmGray: colors.warmGray,
                trueGray: colors.trueGray,
                blueGray: colors.blueGray,
                lightBlue: colors.lightBlue,
                cyan: colors.cyan,
                persian_blue: {
                    50: '#d8e7e8',
                    100: '#b6cfd4',
                    200: '#95b8c1',
                    300: '#76a0af',
                    400: '#57899e',
                    500: '#38728e',
                    600: '#165b7b',
                    700: '#004563',
                    800: '#002f4b',
                    900: '#001a34'
                },
                heliotrope: {
                    50: '#e9e3ea',
                    100: '#d1c8d6',
                    200: '#b9aec3',
                    300: '#a095b1',
                    400: '#867e9f',
                    500: '#6b678f',
                    600: '#51527b',
                    700: '#3b3d64',
                    800: '#26294e',
                    900: '#101739'
                },
                raspberry: {
                    50: '#e9e2e9',
                    100: '#d5c6d3',
                    200: '#c1acbc',
                    300: '#ad91a6',
                    400: '#9b7890',
                    500: '#885e7a',
                    600: '#734764',
                    700: '#5d324e',
                    800: '#461e39',
                    900: '#310a26'
                },
                tangelo: {
                    50: '#ede1de',
                    100: '#dbc6c1',
                    200: '#c9aba6',
                    300: '#b6908b',
                    400: '#a47772',
                    500: '#915d5b',
                    600: '#7c4645',
                    700: '#643131',
                    800: '#4d1d1e',
                    900: '#370809'
                },
                apple_green: {
                    50: '#e8e4d9',
                    100: '#d2cab9',
                    200: '#bdb09a',
                    300: '#a9977d',
                    400: '#967e60',
                    500: '#846646',
                    600: '#6f4f2f',
                    700: '#573a1c',
                    800: '#412606',
                    900: '#2d1200'
                },
                sap_green: {
                    50: '#e5e5d9',
                    100: '#cccdba',
                    200: '#b2b49b',
                    300: '#9a9c7e',
                    400: '#818562',
                    500: '#696f46',
                    600: '#52592f',
                    700: '#3c441b',
                    800: '#283006',
                    900: '#191c00'
                },
                aquamarine: {
                    50: '#dae7e1',
                    100: '#bacfc5',
                    200: '#9cb8aa',
                    300: '#7ea18f',
                    400: '#628b75',
                    500: '#45755c',
                    600: '#2c5f45',
                    700: '#154931',
                    800: '#00341e',
                    900: '#001f04'
                },
                cornflower_blue: {
                    50: '#d6e7e7',
                    100: '#b4d0d0',
                    200: '#93b8ba',
                    300: '#72a2a4',
                    400: '#4f8b8e',
                    500: '#27767a',
                    600: '#005f64',
                    700: '#00484d',
                    800: '#003237',
                    900: '#001d20'
                }
            }
        }
    },
    variants: {
        extend: {}
    },
    plugins: []
};
