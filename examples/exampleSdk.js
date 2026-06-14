class Patch {
    constructor() {
        this.elements = [];
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

    toSting() {
        return JSON.stringify(this);
    }
}

function createPatch() {
    return new Patch();
}

function alpatchMiddleware(req, res, next) {
    if (req.query.alpatch) {
        req.alpatch = JSON.parse(req.query.alpatch);
    }
    next();
}

module.exports = {
    Patch,
    createPatch,
    alpatchMiddleware
};
