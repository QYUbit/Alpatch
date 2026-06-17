class Patch {
    constructor() {
        this.protocol = "alpatch";
        this.elements = [];
    }

    redirect(url) {
        this.navigation = { url, redirect: true };
    }

    pushHistory(url) {
        this.navigation = { url };
    }

    replaceHistory(url) {
        this.navigation = { url, replace: true };
    }

    patchHTML(id, html, strategy = 'morph') {
        this.elements.push({
            selector: '#'+id,
            html,
            strategy
        });
    }

    patchHTMLByRef(ref, html, strategy = 'morph') {
        this.elements.push({
            ref,
            html,
            strategy
        });
    }

    patchHTMLBySelector(selector, html, strategy = 'morph') {
        this.elements.push({
            selector,
            html,
            strategy
        });
    }

    patchValue(key, value) {
        if (!this.scope) this.scope = {};
        this.scope[key] = value;
    }

    patchValues(obj) {
        this.scope = { ...(this.scope ?? {}), ...obj };
    }

    patchStoreValue(key, value) {
        if (!this.store) this.store = {};
        this.store[key] = value;
    }

    patchStoreValues(obj) {
        this.store = { ...(this.store ?? {}), ...obj };
    }

    send(res, status = 200) {
        res.status(status);
        res.json(this);
    }
}

function createPatch() {
    return new Patch();
}

function alpatchMiddleware(req, res, next) {
    if (req.query.alpatch) {
        req.alpatch = JSON.parse(req.query.alpatch);
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.removeHeader('ETag');
    }
    next();
}

module.exports = {
    Patch,
    createPatch,
    alpatchMiddleware
};
