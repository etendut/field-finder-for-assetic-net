setTimeout(function() {
    /* Example: Send data from the page to your Chrome extension */
    document.dispatchEvent(new CustomEvent('asseticExtension_context', {
        detail: context
    }));
}, 0);