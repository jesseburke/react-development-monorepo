const os = require('os');
const fs = require('fs');

const { exec } = require('child_process');

// argv is array of command line arguments
//console.log(process.argv);
// cwd = c(urrent )w(working )d(irectory)
//console.log(process.cwd());

// utf8 tells it to read in as string
let file = fs.readFileSync('learning.js', 'utf8');
//console.log(file);

const dir = fs.readdirSync('./src/pages/df');
//console.log(dir);

const regExp = /App.*\.js$/;
const matchArray = [];

dir.forEach((v) => {
    if (v.search(regExp) >= 0) {
        matchArray.push(v);
        //console.log(v);
    }
});

console.log(matchArray);

exec('npm run build', (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
