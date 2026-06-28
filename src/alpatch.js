import Alpine from "alpinejs";
import { patchElement, patchScope } from "./patch";
import { request } from "./request";

const abortControllers = new WeakMap();

const hasRequestBody = (method) => method !== 'GET' && method !== 'DELETE';

export async function performRequest(
    Alpine,
    el,
    method,
    url,
    options = {}
) {
    // Debounce
    const controller = requestAbort === 'auto' ? new AbortController() : requestAbort;
    if (requestAbort === 'auto') {
        abortControllers.get(el)?.abort(new DOMException('', 'DebounceError'));
        abortControllers.set(el, controller);
    }

    const [reqUrl, reqOptions] = buildRequest(Alpine, el, method, url, options);

    return await request(reqUrl, reqOptions);
}

function buildRequest(
    Alpine,
    el,
    method,
    url,
    {
        // Source options
        data: dataSource = 'scope',

        // Request options
        headers = {},
        requestAbort = 'auto',
        timeoutDuration = 15_000,
        maxRetries = 5,
        retryMultiplier = 2,
        retryInterval = 2000,
        maxRetryInterval = 20_000,
        abortOnVisibilityChange,
    }
) {
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
        retryMultiplier,
        maxRetryInterval,
        abortOnVisibilityChange,
    };

    req.headers['Alpatch-Request'] = true;
    req.headers.Accept = 'application/json';

    const requestUrl = new URL(url, document.baseURI);
    const queryParams = new URLSearchParams(requestUrl.search);

    // Check for null?
    if (typeof dataSource === 'object' || dataSource === 'scope') {
        const requestPayload = dataSource === 'scope'
            ? Alpine.$data(el)
            : dataSource;
        
        const body = JSON.stringify(requestPayload);

        if (hasRequestBody(method)) {
            req.body = body;
            req.headers['Content-Type'] = 'application/json';
        } else {
            queryParams.set("alpatch", body);
        }

    } else if (dataSource instanceof HTMLFormElement || dataSource === 'form') {
        const formEl = dataSource === 'form' ? el.closest('form') : dataSource;
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
        throw new Error(`Invalid dataSource`);
    }

    requestUrl.search = queryParams.toString();

    return [requestUrl.toString(), req];
}

export function processRequest(Alpine, reqPromise, cb) {
    const responseObj = Alpine.reactive({
        pending: true,
    });

    reqPromise
        .then(async res => {
            await cb?.(res);

            responseObj.ok = res.ok;
            responseObj.status = res.status;
            responseObj.redirected = res.redirected;
            responseObj.headers = res.headers;
            responseObj.body = res.body;
            responseObj.failed = false;
            responseObj.pending = false;
        })
        .catch(err => {
            responseObj.error = err;
            responseObj.failed = true;
            responseObj.pending = false;
        });

    return responseObj;
}

export async function processResponse(
    Alpine,
    res,
    {
        target
    }
) {
    const ct = res.headers['Content-Type'];

    if (ct.startsWith('text/html')) {
        const targetEl = target ?? el;
        const html = await res.text();
        patchElement(Alpine, targetEl, html, );

    } else if (ct.startsWith('application/json')) {
        const targetEl = target ?? el;
        const patch = await res.json();
        patchScope(Alpine, targetEl, patch);

    } else if (ct.startsWith('application/alpatch+json')) {
        const schema = await res.json();

        if (schema.elements?.length) {
            for (const elementPatch of schema.elements) {
                const targetEl = (
                    elementPatch.selector
                        ? document.querySelector(elementPatch.selector)
                        : undefined
                )
                ?? target
                ?? el;
                
                patchElement(Alpine, targetEl, elementPatch.html, elementPatch.strategy ?? 'replace')
            }
        }

        if (schema.scopes?.length) {
            for (const scopePatch of schema.scopes) {
                
            }
        }

        if (schema.stores?.length) {
        }
    } else {

    }
}