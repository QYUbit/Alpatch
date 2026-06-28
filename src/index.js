import { alpatchDirective } from "./directive";
import { patchMagic, requestMagic } from "./magics";

function Alpatch (Alpine) {
    Alpine.magic('patch', (el) => ({
        get: (url, options) => patchMagic(Alpine, el, 'GET', url, options),
        post: (url, options) => patchMagic(Alpine, el, 'POST', url, options),
        put: (url, options) => patchMagic(Alpine, el, 'PUT', url, options),
        patch: (url, options) => patchMagic(Alpine, el, 'PATCH', url, options),
        delete: (url, options) => patchMagic(Alpine, el, 'DELETE', url, options),
    }));

    Alpine.magic('request', (el) => ({
        get: (url, options) => requestMagic(Alpine, el, 'GET', url, options),
        post: (url, options) => requestMagic(Alpine, el, 'POST', url, options),
        put: (url, options) => requestMagic(Alpine, el, 'PUT', url, options),
        patch: (url, options) => requestMagic(Alpine, el, 'PATCH', url, options),
        delete: (url, options) => requestMagic(Alpine, el, 'DELETE', url, options),
    }));

    Alpine.directive('alpatch', alpatchDirective);
}

Alpatch.start = () => {
    window.addEventListener('popstate', e => {
        
    });
};

export default Alpatch;