import { patchRequest } from './alpatch.js';
import { alpatchDirective } from './directive.js';
import { patchElement } from './patch.js';

export default function (Alpine) {
    Alpine.magic('get', (el) => async (url, options) => {
        return await patchRequest(Alpine, el, 'GET', url, options);
    });

    Alpine.magic('post', (el) => async (url, options) => {
        return await patchRequest(Alpine, el, 'POST', url, options);
    });

    Alpine.magic('put', (el) => async (url, options) => {
        return await patchRequest(Alpine, el, 'PUT', url, options);
    });

    Alpine.magic('patch', (el) => async (url, options) => {
        return await patchRequest(Alpine, el, 'PATCH', url, options);
    });

    Alpine.magic('delete', (el) => async (url, options) => {
        return await patchRequest(Alpine, el, 'DELETE', url, options);
    });

    Alpine.directive('alpatch', alpatchDirective);

    Alpine.patchElement = (el, patch) => {
        patchElement(Alpine, el, patch);
    };

    Alpine.patchScope = (el, patch) => {
        patchScope(Alpine, el, patch);
    };

    Alpine.patchStore = (el, patch) => {
        patchStore(Alpine, el, patch);
    };

    Alpine.patchRequest = async (el, method, url, options) => {
        return await patchRequest(Alpine, el, method, options);
    };
}