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

    patchHTMLBySelector(selector, html, strtegy = 'morph') {
        this.elements.push({
            selector,
            html,
            strategy
        });
    }

    patchValue(key, value) {
        if (!this.data) this.data = {};
        this.data[key] = value;
    }

    patchValues(obj) {
        this.data = { ...(this.data ?? {}), ...obj };
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
