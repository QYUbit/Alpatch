import AlpinePatch from './index.js';

if (typeof window !== 'undefined') {
    document.addEventListener('alpine:init', () => {
        if (window.Alpine) {
            window.Alpine.plugin(AlpinePatch);
        }
    });
}