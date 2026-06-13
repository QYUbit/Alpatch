/**
 * Simple Express server for Alpatch examples
 * Run: node examples/server.js
 * Then visit: http://localhost:3000
 */

const express = require('express');
const path = require('path');
const { createPatch, alpatchMiddleware } = require('./exampleSdk');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '..')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(alpatchMiddleware);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/message', (req, res) => {
    const patch = createPatch();
    patch.patchHTML(
        'message-box',
        `<p>Secret Message</p>`,
        'replaceInner'
    );
    res.send(patch);
});

app.post('/increment', (req, res) => {
    const patch = createPatch();
    patch.patchValue('count', req.body.count + 1);
    res.send(patch);
});

app.get('/age', (req, res) => {
    const persons = {
        Alice: 20,
        Bob: 30,
        Charlie: 40
    };
    const patch = createPatch();
    patch.patchValue('age', persons[req.alpatch.name]);
    res.send(patch);
});

app.listen(PORT, () => {
    console.log(`\nAlpine Patch Example Server`);
    console.log(`http://localhost:${PORT}`);
    console.log(`\nPress Ctrl+C to stop\n`);
});
