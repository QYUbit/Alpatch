import { dispatch, sleep } from "./utils";

export async function request(
    el,
    url,
    {
        timeoutDuration,
        maxRetries,
        retryInterval,
        maxRetryInterval,
        retryMultiplier,
        abortOnVisibilityChange,
        ...fetchOptions
    } = {}
) {
    const requestCancelled = dispatch(el, 'alpatch:request', { url, options: fetchOptions });
    if (requestCancelled) return {};

    let currentAttempt = 0;
    let currentDelay = retryInterval;

    while (currentAttempt <= maxRetries) {
        const internalController = new AbortController();
        const { signal: externalSignal } = fetchOptions;

        if (externalSignal?.aborted) {
            throw externalSignal.reason || new DOMException('The user aborted the request.', 'AbortError');
        }

        let timeoutId = null;
        let onVisibilityChange = null;
        let onExternalAbort = null;

        if (externalSignal) {
            onExternalAbort = () => internalController.abort(externalSignal.reason);
            externalSignal.addEventListener('abort', onExternalAbort);
        }

        // Timeout
        if (timeoutDuration > 0) {
            timeoutId = setTimeout(() => {
                internalController.abort(new DOMException('Request timeout', 'TimeoutError'));
            }, timeoutDuration);
        }

        // Visibility change
        if (abortOnVisibilityChange) {
            onVisibilityChange = () => {
                if (document.visibilityState === 'hidden') {
                    internalController.abort(new DOMException('Request aborted due to visibility change', 'AbortError'));
                }
            };
            document.addEventListener('visibilitychange', onVisibilityChange);
        }

        try {
            // 3xx request will be handled by fetch()
            const response = await fetch(url, {
                ...fetchOptions,
                signal: internalController.signal,
            });

            if (response.status === 204) {
                return {};
            }

            if (!response.headers.get('Content-Type')?.includes('application/json')) {
                throw new DOMException('Response rejected: unsupported content type (expected application/json)', 'ProtocolError');
            }

            const data = await response.json();
            
            if (typeof data !== 'object' || data === null) {
                throw new DOMException('Response rejected: invalid response format (expected JSON object)', 'ProtocolError');
            }
            if (data.protocol !== 'alpatch') {
                throw new DOMException('Response rejected: invalid response format (expected "alpatch" protocol field)', 'ProtocolError');
            }

            const isErrorCode = response.status >= 400 && response.status < 600;

            const cancelled = dispatch(el, 'alpatch:response', { response, data })
                || dispatch(el, `alpatch:response:${isErrorCode ? 'error' : 'ok'}`, { response, data });
            if (cancelled) {
                return {};
            }

            return data;

        } catch (error) {
            const isAbort = error.name === 'AbortError';
            const isTimeout = error.name === 'TimeoutError' || error.message === 'Request timeout';
            const isDebounce = error.name === 'DebounceError';
            const isProtocolError = error.name === 'ProtocolError';

            if (isDebounce) return {};

            // Throw immediatly if error is 'natural' or maxRetries has been reached 
            if ((isAbort && !isTimeout) || isProtocolError || currentAttempt >= maxRetries) {
                dispatch(el, 'alpatch:failed', { message: error.message, name: error.name });
                throw error;
            }

            const cancelled = dispatch(el, 'alpatch:retrying', { message: error.message, name: error.name });
            if (cancelled) {
                dispatch(el, 'alpatch:failed', { message: error.message, name: error.name });
                throw error;
            }

            console.warn(`Request failed (Attempt ${currentAttempt + 1}/${maxRetries + 1}). Retrying in ${currentDelay}ms... Error: ${error.message}`);

            currentAttempt++;
            await sleep(currentDelay);
            
            const multiplyer = Math.max(retryMultiplier, 1)
            currentDelay = Math.min(currentDelay * multiplyer, maxRetryInterval);
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
            if (externalSignal && onExternalAbort) externalSignal.removeEventListener('abort', onExternalAbort);
            if (abortOnVisibilityChange && onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange);
        }
    }
}