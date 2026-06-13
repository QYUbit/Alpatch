# Alpatch

Alpatch is an Alpine.js plugin ...

## Features

- 5 magic methods `$get`, `$post`, `$put`, `$patch` and `$delete`
- DOM morphing with `@alpinejs/morph`
- Backend agnostic -- Use any server and templating engine
- Form support

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

Note: if you want to use DOM morphing you have to include the `@alpinejs/morph` plugin

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
    "data": {
        "number": 1234
    }
}
```

</details>

## Alpatch Response Protocol

```json
{
    // Array of element-patches
    // Optional
    "elements": [
        {
            "selector": "#some-id", // Each element-patch has to contain either "selector" or "ref" 
            "ref": "refName",
            "html": "<h1>Heading</h1>",
            // One of those options (morph is default): morph, replace, replaceInner, append, prepend, before, after
            "strategy": "replace" // Optional
        }
    ],
    // State-patches will be morphed into their relative x-data stacks or into the closest x-data scope in case no fitting value is found.
    // Optional
    "data": {
        "value": "foobar"
    },
    // State-patches to global stores. Each value will be morphed into the respective store of the corresponding Alpine store. 
    // Optional
    "store": {
        "userId": "user123"
    }
}
```

## API Reference

```javascript
$method(
    // URL of the request (required)
    url, 

    // Options (optional)
    {
        // Source options
        
        // "json" or "form"
        contentType = 'json',
        // Used when contentType is "form". Defaults to the element, the magic is called from.
        formEl,
        // Custom payload for "json" contentType
        payload,
        payloadSource

        // Request options
        
        // Custom headers
        headers = {},
        requestAbort = 'auto',
        timeoutDuration = 5000,
        maxRetries = 5,
        retryMultiplyer = 2,
        retryInterval = 2000,
        maxRetryInterval = 20_000,
        // Whether or not the request should be abortet on window / app / tab change
        // Default is false except for GET
        abortOnVisibilityChange,

        // Patch options

        // Whether or not data or store patches should be merged
        autoPatchState = true,
        // Whether or not data patches should be merged into the scope
        autoPatchData = true,
    }
)
```

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
