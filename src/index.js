import { performAlpatchRequest } from "./alpatch";

export default function (Alpine) {
    Alpine.magic('patch', (el) => ({
        get: (url, data, options) => performAlpatchRequest(Alpine, el, 'GET', url, data, options),
        post: (url, data, options) => performAlpatchRequest(Alpine, el, 'POST', url, data, options),
        put: (url, data, options) => performAlpatchRequest(Alpine, el, 'PUT', url, data, options),
        patch: (url, data, options) => performAlpatchRequest(Alpine, el, 'PATCH', url, data, options),
        delete: (url, data, options) => performAlpatchRequest(Alpine, el, 'DELETE', url, data, options),
    }));
}