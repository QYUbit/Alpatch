import { performRequest, processRequest, processResponse } from "./alpatch";

export function alpatchDirective(
    el,
    { value, modifiers, expression },
    { Alpine, evaluate, cleanup }
) {
    const target = evaluate(el.getAttribute('alpatch-target')) ?? el;

    const eventName =
        value ?? (
            el instanceof HTMLFormElement
            ? 'submit'
            : el instanceof HTMLInputElement
                || el instanceof HTMLTextAreaElement
                || el instanceof HTMLSelectElement
            ? 'change'
            : 'click'
        );

    const method = (modifiers[0] ?? 'get').toUpperCase();

    const url = (expression || el.getAttribute('href')) ?? '';

    const handler = (e) => {
        const isFormElement = el instanceof HTMLFormElement;
        if (isFormElement || el instanceof HTMLAnchorElement) {
            e.preventDefault();
        }

        Alpine.nextTick(() => {
            const reqPromise = performRequest(
                Alpine,
                el,
                method,
                url,
                {
                    data: isFormElement ? el : 'scope',
                }
            );

            const req = processRequest(
                Alpine,
                reqPromise,
                async (res) => {
                    await processResponse(
                        Alpine,
                        res,
                        {
                            target
                        }
                    );
                }
            );
        });
    };

    el.addEventListener(eventName, handler);
    cleanup(() => {
        el.removeEventListener(eventName, handler);
    });
}