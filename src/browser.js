import Alpatch from './index.js';

if (typeof window !== 'undefined') {
    document.addEventListener('alpine:init', () => {
        window.Alpine?.plugin(Alpatch);
    });
}