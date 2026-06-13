const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request(
    url,
    {
        timeoutDuration,
        maxRetries,
        retryInterval,
        maxRetryInterval,
        retryMultiplyer,
        abortOnVisibilityChange,
        ...fetchOptions
    } = {}
) {
    let currentAttempt = 0;
    let currentDelay = retryInterval;

    while (currentAttempt <= maxRetries) {
        const internalController = new AbortController();
        const { signal: externalSignal } = fetchOptions;

        if (externalSignal?.aborted) {
            throw externalSignal.reason || new DOMException('The user aborted a request.', 'AbortError');
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
            const response = await fetch(url, {
                ...fetchOptions,
                signal: internalController.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            const isAbort = error.name === 'AbortError';
            const isTimeout = error.name === 'TimeoutError' || error.message === 'Request timeout';

            if ((isAbort && !isTimeout) || currentAttempt >= maxRetries) {
                throw error;
            }

            console.warn(`Request failed (Attempt ${currentAttempt + 1}/${maxRetries + 1}). Retrying in ${currentDelay}ms... Error: ${error.message}`);

            currentAttempt++;
            await sleep(currentDelay);
            
            currentDelay = Math.min(currentDelay * retryMultiplyer, maxRetryInterval);
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
            if (externalSignal && onExternalAbort) externalSignal.removeEventListener('abort', onExternalAbort);
            if (abortOnVisibilityChange && onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange);
        }
    }
}