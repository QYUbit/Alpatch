export function dispatch(el, event, detail = {}) {
    return el.dispatchEvent(new CustomEvent(event, {
        detail,
        bubbles: true,
        cancelable: true,
    }));
}
