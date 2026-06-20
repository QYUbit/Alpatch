import { patchRequest } from "./alpatch";

export function alpatchDirective(
    el,
    { value, modifiers, expression },
    { Alpine, evaluate, cleanup }
) {
    const eventType = 
        modifiers[0] ?? (
            el instanceof HTMLFormElement
            ? 'submit'
            : el instanceof HTMLInputElement
                || el instanceof HTMLTextAreaElement
                || el instanceof HTMLSelectElement
            ? 'change'
            : 'click'
        );

    const listener = (e) => {
        const isFormElement = el instanceof HTMLFormElement;
        if (isFormElement || el instanceof HTMLAnchorElement) {
            e.preventDefault();
        }

        const method = (value ?? 'get').toUpperCase();
        const url = (expression || el.getAttribute('href')) ?? '';

        Alpine.nextTick(() => {
            patchRequest(
                Alpine,
                el,
                method,
                url,
                {
                    contentType: isFormElement ? 'form' : 'json',
                    form: isFormElement ? el : undefined
                }
            );
        });
    };
        
    el.addEventListener(eventType, listener);
    cleanup(() => el.removeEventListener(eventType, listener));
}