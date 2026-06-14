import { patchElement, patchScope, patchStore } from "./patch";
import { request } from "./request";

const abortControllers = new WeakMap();

const hasRequestBody = (method) => method !== 'GET' && method !== 'HEAD';

export async function patchRequest(
    Alpine,
    el,
    method,
    url,
    {
        // Source options
        contentType = 'json',
        form,
        payload,
        payloadSource = 'auto',

        // Request options
        headers = {},
        requestAbort = 'auto',
        timeoutDuration = 5000,
        maxRetries = 5,
        retryMultiplyer = 2,
        retryInterval = 2000,
        maxRetryInterval = 20_000,
        abortOnVisibilityChange,

        // Patch options
        autoPatchState = true,
    } = {}
) {
    // Debounce
    const controller = requestAbort === 'auto' ? new AbortController() : requestAbort;
    if (requestAbort === 'auto') {
        abortControllers.get(el)?.abort();
        abortControllers.set(el, controller);
    }

    if (!url?.length) {
        throw new Error('No URL provided for patch request');
    }

    const req = {
        headers: { ...headers }, // Don't modify default headers
        method,
        signal: controller.signal,
        timeoutDuration,
        maxRetries,
        retryInterval,
        retryMultiplyer,
        maxRetryInterval,
        abortOnVisibilityChange,
    };

    req.headers['Alpatch-Request'] = true;
    req.headers.Accept = 'application/json';

    const requestUrl = new URL(url, document.baseURI);
    const queryParams = new URLSearchParams(requestUrl.search);

    if (contentType === 'json') {
        const requestPayload = payloadSource === 'auto'
            ? payload ?? Alpine.$data(el)
            : { ...Alpine.$data(el), ...(payload ?? {}) }
        
        const body = JSON.stringify(requestPayload);

        if (hasRequestBody(method)) {
            req.body = body;
            req.headers['Content-Type'] = 'application/json';
        } else {
            queryParams.set("alpatch", body);
        }

    } else if (contentType === 'form') {
        const formEl = form ?? el.closest('form');
        if (!(formEl instanceof HTMLFormElement)) {
            throw new Error(`Form element not found`);
        }

        if (!formEl.noValidate && !formEl.checkValidity()) {
            formEl.reportValidity();
            return;
        }

        const formData = new FormData(formEl);

        const isMultipart = formEl.getAttribute('enctype') === 'multipart/form-data'
        // Browser will set the header for multipart encoding
        if (!isMultipart) {
            req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        const formParams = new URLSearchParams(formData);
        if (hasRequestBody(method)) {
            if (isMultipart) {
                req.body = formData;
            } else {
                req.body = formParams;
            }
        } else {
            for (const [key, value] of formParams) {
                queryParams.append(key, value);
            }
        }

    } else {
        throw new Error(`Invalid contentType "${contentType}"`);
    }

    requestUrl.search = queryParams.toString();

    const response = await request(requestUrl.toString(), req);

    if (typeof response !== 'object' || response === null) {
        console.error("Invalid response format: response has to be an object");
        return;
    }

    if (response.elements) {
        if (Array.isArray(response.elements)) {
            for (const elementPatch of response.elements) {
                patchElement(Alpine, el, elementPatch);
            }
        } else {
            console.error(`Invalid response format: "elements" property has to be an array`)
        }
    }

    if (response.scope && autoPatchState) {
        patchScope(Alpine, el, response.scope);
    }
    
    if (response.store && autoPatchState) {
        patchStore(Alpine, el, response.store);
    }

    return response;
}