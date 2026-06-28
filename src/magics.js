import { performRequest, processRequest, processResponse } from "./alpatch";

export function patchMagic(
    Alpine,
    el,
    method,
    url,
    options = {}
) {
    const reqPromise = performRequest(
        Alpine,
        el,
        method,
        url,
        options
    );

    return processRequest(
        Alpine,
        reqPromise,
        async (res) =>
            await processResponse(
                Alpine,
                res,
                options
            )
    );
}

export function requestMagic(
    Alpine,
    el,
    method,
    url,
    options = {}
) {
    const reqPromise = performRequest(
        Alpine,
        el,
        method,
        url,
        options
    );

    return processRequest(
        Alpine,
        reqPromise
    );
}
