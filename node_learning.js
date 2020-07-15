const os = require('os');
const fs = require('fs');

const { exec } = require('child_process');

//------------------------------------------------------------------------
//
// dirJSToJSX
// input: dirStr
// effect: change every .js file in that directory into a .jsx file
//
//------------------------------------------------------------------------

function dirJSToJSX(dirStr) {
    // this is an array of strings of the filenames of the contents of a directory
    const dir = fs.readdirSync(dirStr);
    //console.log(dir);

    // it is not actual files;
    // easier to do sorting here (rather than  the possibly large files), if possible

    // looking for files that end with .js
    const regExp = /.*\.js$/;

    const matchArray = [];

    dir.forEach((v) => {
        if (v.search(regExp) >= 0) {
            matchArray.push(v);
            //console.log(v);
        }
    });

    //console.log(matchArray);

    matchArray.forEach((m) => {
        //console.log(m.replace('.js', '.jsx'));

        // should put end of line symbol after .js to distinguish from actual .jsx files
        fs.copyFileSync(dirStr + m, dirStr + m.replace('.js', '.jsx'));
    });
}

// test:
//dirJSToJSX('./src/pages/df/');

function changeDir(dirStr) {
    const dir = fs.readdirSync(dirStr);

    // looking for files that end with .js
    const regExp = /.*\.js$/;

    dir.forEach((v) => {
        if (v == 'nil') console.log('hit a nil');
        else if (v.search(regExp) >= 0) {
            fs.copyFileSync(dirStr + v, dirStr + v.replace('.js', '.jsx'));
            fs.unlinkSync(dirStr + v);
        } else if (fs.statSync(dirStr + v).isDirectory()) {
            changeDir(dirStr + v + '/');
        }
    });
}

changeDir('./src/');
