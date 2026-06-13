import { patchRequest } from './alpatch.js';

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
}