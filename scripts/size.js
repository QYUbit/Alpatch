const fs = require('node:fs');
const zlib = require('node:zlib');

const compressed = zlib.gzipSync(fs.readFileSync("./dist/cdn.min.js"));

const bytes = compressed.length
if (bytes === 0) return "0 KB";
const kb = bytes / 1024;

console.log(`Size (minified + gziped): ${kb.toFixed(2)} KB`);
