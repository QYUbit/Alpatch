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

app.disable('etag');
app.use(express.static(path.join(__dirname, '..')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(alpatchMiddleware);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/message', (req, res) => {
    const patch = createPatch();
    patch.patchHTML(
        'message-box',
        `<p>Secret Message</p>`,
        'replaceInner'
    );
    patch.send(res);
});

app.post('/increment', (req, res) => {
    const patch = createPatch();
    patch.patchValue('count', req.body.count + 1);
    patch.send(res);
});

app.get('/age', (req, res) => {
    const persons = {
        Alice: 20,
        Bob: 30,
        Charlie: 40
    };
    const patch = createPatch();
    patch.patchValue('age', persons[req.alpatch.name]);
    patch.send(res);
});

app.post('/signin', (req, res) => {
    const users = [
        { username: 'test', password: '1234' }
    ];
    const user = users.find(u => u.username === req.body.username);

    const patch = createPatch();

    if (!user) {
        patch.patchHTML(
            'error-message',
            'User not found',
            'replaceInner'
        );
        patch.send(res, 404);
        return;
    }

    if (user.password === req.body.password) {
        patch.pushHistory(`?user=${user.username}`);
        patch.patchHTMLBySelector(
            'form',
            `<div>Hello, ${user.username}</div>`,
            'replace'
        );
        patch.send(res);
    } else {
        patch.patchHTML(
            'error-message',
            'Wrong password',
            'replaceInner'
        );
        patch.send(res, 400);
    }
});

app.get('/messageRef', (req, res) => {
    const patch = createPatch();
    patch.patchHTMLByRef(
        'message',
        `A Message`,
        'replaceInner'
    );
    patch.send(res);
});

app.get('/repeat', (req, res) => {
    const patch = createPatch();
    patch.patchHTML(
        'repeated',
        req.alpatch.text+req.alpatch.text,
        'replaceInner'
    );
    patch.send(res);
});

app.get('/toAbout', (req, res) => {
    const patch = createPatch();
    patch.redirect('/about');
    patch.send(res);
});

app.listen(PORT, () => {
    console.log(`\nAlpine Patch Example Server`);
    console.log(`http://localhost:${PORT}`);
    console.log(`\nPress Ctrl+C to stop\n`);
});
