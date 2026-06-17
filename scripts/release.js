const fs = require('node:fs');
const { execSync } = require('node:child_process');


const newVersion = process.argv[2];

if (!newVersion) {
    console.error('version argument is missing');
    process.exit(1);
}

const pkgJson = './package.json';

const raw = fs.readFileSync(pkgJson);
const content = JSON.parse(raw.toString());
content.version = newVersion.trim();
fs.writeFileSync(pkgJson, JSON.stringify(content, null, 2));

execSync('npm publish --access public', {
    stdio: 'inherit',
});
