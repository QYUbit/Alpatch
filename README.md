# Alpatch

Alpatch is an Alpine.js plugin for making HTTP requests to patch application state and the DOM, similar to htmx and datastar.

## Features

- 5 magic methods `$get`, `$post`, `$put`, `$patch` and `$delete`
- 1 directive `x-alpatch`
- DOM morphing with `@alpinejs/morph`
- Backend agnostic -- Use any server side language and templating engine
- 2.77 KB bundle size (minified + gziped)

## Installation

Install via npm

```bash
npm install alpatch
```

Then register the plugin

```javascript
import Alpine from 'alpinejs';
import Alpatch from 'alpatch';

Alpine.plugin(Alpatch);

Alpine.start();
```

Or use a CDN

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpatch@latest"></script>
```

Note: If you want to use DOM morphing you have to include the `@alpinejs/morph` plugin

## How it works

1. Issue a request, using one of the 5 [magics](#request-magics) or the `x-alpatch` [directive](#directive)
2. Alpatch collects all values of the current scope / values of the selected form
3. Alpatch encodes those values (`application/json` or `application/x-www-form-urlencoded`)
and sends a HTTP request to your backend
4. Your backend responds with an [Alpatch Response](#alpatch-response-protocol)
5. Alpatch receives the response and updates state, DOM and history accordingly

## Usage

Fetch html from the server

```html
<div x-data>
    <button @click="$get('/message')">Click Me!</button>
    <div id="message"></div>
</div>
```

<details>
<summary>Server Response</summary>

```json
{
    "elements": {
        "selector": "#message",
        "html": "<p>Hello World!</p>"
    }
}
```

</details>

<details>
<summary>New DOM</summary>

```html
<div x-data>
    <button @click="$get('/message')">Click Me!</button>
    <div id="message"><p>Hello World!</p></div>
</div>
```

</details>

---

Patch state

```html
<div x-data="{ number: 0 }">
    <button @click="$get('/number')">Generate Number</button>
    <div x-text="number"></div>
</div>
```

<details>
<summary>Server Response</summary>

```json
{
    "scope": {
        "number": 1234
    }
}
```

</details>

<details>
<summary>New DOM</summary>

```html
<!-- Current state: { number: 1 }-->
<div x-data="{ number: 0 }">
    <button @click="$get('/number')">Generate Number</button>
    <div x-text="number">1</div>
</div>
```

</details>

---

Using forms

```html
<form @submit.prevent="$post('/signin', { contentType: 'form' })">
    <input name="name" placeholder="Enter your name...">
    <button role="submit">Submit</button>
</form>
```

---

Using the `x-alpatch` directive

```html
<div x-data>
    <button x-alpatch:post="/example">Do something</button>
</div>
```

## Alpatch Response Protocol

```javascript
{
    // Alpatch protocol identifier (required)
    "protocol": "alpatch",
    // Contains navigation info
    "navigation": {
        // The URL (required). Uses the history API to set URL.
        "url": "/example",
        // When set to true, all the patches will be ignored
        // and window.location.href is set to "url"
        "redirect": false,
        // Wherher history.replaceState() should be used instead of
        // history.pushState()
        "replace": false
    },
    // Array of element-patches
    "elements": [
        {
            // Uses document.querySelector() to find the target.
            // Each element-patch has to contain either "selector" or "ref" 
            "selector": "#some-id",
            // Uses the $refs magic to find the target.
            "ref": "refName",
            // The html (required)
            "html": "<h1>Heading</h1>",
            // One of those options (replace is default):
            // morph, replace, replaceInner, append, prepend, before, after
            "strategy": "replace"
        }
    ],
    // State-patches will be morphed into their relative x-data stacks
    // or into the closest x-data scope in case no fitting value is found.
    "scope": {
        "value": "foobar"
    },
    // State-patches to global stores.
    // Each value will be morphed into the respective store of the corresponding Alpine store. 
    "store": {
        "user": {
            "userId": "user123"
        }
    }
}
```

Note: There are no server side SDKs yet. You have to create the alpatch response by yourself.

## API Reference

### Request magics

```javascript
// Method can be get, post, put, patch and delete
function $get(
    // URL of the request (required)
    url, 

    // Options (optional)
    {
        // === Source options ===
        
        // "json" or "form"
        contentType = 'json',
        // Used when contentType is "form". Defaults to the element, the magic is called from.
        formEl,
        // Custom payload for "json" contentType
        payload,
        // How the json payload should be constructed. Either "auto" or "morph".
        // "auto" will use the payload if available. If not it will use the current scope.
        // "morph" will compine the current scope and the provided payload.
        payloadSource,

        // === Request options ===
        
        // Custom headers
        headers = {},
        requestAbort = 'auto',
        timeoutDuration = 15_000,
        maxRetries = 5,
        // Increses the retryInterval on each miss.
        retryMultiplier = 2,
        retryInterval = 2000,
        maxRetryInterval = 20_000,
        // Whether or not the request should be abortet on window / app / tab change
        // Default is false except for GET
        abortOnVisibilityChange,

        // === Patch options ===

        // Whether or not redirects and history changes should be executed
        autoNavigate = true,
        // Whether or not element patches should be applied
        autoPatchElements = true,
        // Whether or not scope or store patches should be merged
        autoPatchState = true,
    }
): Promise<any> // Returns a promise with the Alpatch response object
```

### Directive

```
x-alpatch:get.input="https://example.com"
           |    |              |
       method  event          url
```

- Default method is "get".
- Default event is "submit" for `<form>`s, "change" for `<input>`, `<textarea>` and `<select>` elements, and "click" for everything else.
- If the attribute value is left out, `x-alpatch` uses the `href` attribute.

## Roadmap

- testing
- more consistent code

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Build with watch mode
npm run dev
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
