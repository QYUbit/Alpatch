export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const dispatch = (el, name, detail) => {
    return !el.dispatchEvent(
        new CustomEvent(name, {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail,
        }
    ));
}
