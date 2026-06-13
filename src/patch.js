export function patchElement(
    Alpine,
    el,
    {
        selector,
        ref,
        html,
        strategy = 'morph',
    }
) {
    if (!selector && !ref) {
        console.error('Invalid element patch: missing selector or ref');
        return;
    }

    if (!html) {
        console.error('Invalid element patch: missing html content');
        return;
    }

    const target = ref
        ? Alpine.evaluate(el, `$refs.${ref}`)
        : document.querySelector(selector);

    if (!target) {
        if (ref) {
            console.error(`Element patch target not found for ref: ${ref}`);
        } else {
            console.error(`Element patch not found for selector: ${selector}`);
        }
        return;
    }

    switch (strategy) {
        case 'morph':
            if (!Alpine.morph) {
                console.error('Failed to morph HTML. Make sure the @alpinejs/morph plugin is included.');
                return;
            }
            Alpine.morph(target, html);
            break;

        case 'replace':
            target.outerHTML = html;
            break;

        case 'replaceInner':
            target.innerHTML = html;
            break;

        case 'prepend':
            target.insertAdjacentHTML('afterbegin', html);
            break;

        case 'append':
            target.insertAdjacentHTML('beforeend', html);
            break;
            
        case 'before':
            target.insertAdjacentHTML('beforebegin', html);
            break;

        case 'after':
            target.insertAdjacentHTML('afterend', html);
            break;

        default:
            console.error(`Unknown HTML patch strategy: ${strategy}`);
    }
}

const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

export function patchData(
    Alpine,
    el,
    patch
) {
    if (!isPlainObject(patch)) {
        console.error('Invalid data patch: "data" must be an object');
        return;
    }

    const scope = Alpine.$data(el);
    mergePatch(scope, patch);
}

export function patchStore(
    Alpine,
    el,
    patch
) {
    if (!isPlainObject(patch)) {
        console.error('Invalid store patch: "store" must be an object');
        return;
    }

    for (const [storeName, storePatch] of Object.entries(patch)) {
        if (!isPlainObject(storePatch)) {
            console.error(`Invalid store patch: Cannot update store to a non plain object type`);
        }

        const store = Alpine.store(storeName);
        if (!store) {
            console.error(`Store "${storeName}" not found for patching`);
            continue;
        }

        mergePatch(store, patch);
    }
}

function mergePatch(target, patch) {
    for (const key of Object.keys(patch)) {
        const value = patch[key];

        if (value === null) {
            delete target[key];
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            target[key] = mergePatch(target[key], value);
        } else {
            target[key] = value;
        }
    }
}
