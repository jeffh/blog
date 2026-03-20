+++
title = 'Datastar Basics'
date = 2026-03-19T18:10:19-07:00
+++


[Datastar](https://data-star.dev/) is an [HTMX](https://htmx.org/)-like framework that attempts to minimize the amount of Javascript you write using a few concepts:

 - Use html attributes for dynamism prefixed with `data-`
 - Easy in-document updates similar to [Turbo](https://turbo.hotwired.dev/)
 - Real-time updating via [SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
 - Signals for client-side state

 If we compare it to other approaches, we can understand some of the tradeoffs:

  - Unlike React, signals are global to a page and are expected to have less state than a full SPA. Complex UI elements are recommended to be [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) with Datastar.
  - Real-time updating via SSE for compression and automatic reconnects provided by the browser (instead of WebSockets which [LiveView](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html) uses)
  - Unlike HTMX, it uses mostly just plain Javascript so you don't have to include [hyperscript](https://hyperscript.org/), [Alpinejs](https://hyperscript.org/) or another supplementary library for more complex logic.
  - HTML content is swapped via dom morph swaps instead of innerHTML replacement by default in an attempt to better preserve the DOM state.

Datastar is explicitly NOT a Single Page Application framework. Whenever something should be another page, it should be a separate server-rendered page. As a default, complexity should be pushed towards the server:

 - Real-time updates should be server-driven via SSE
 - Use server-rendered HTML whenever possible. Use a little bit of dynamism to enhance the user experience.

Unlike WebSockets, SSE does support browser-based compression, which can save a lot of bytes over a long-lived connection. It also has automatic reconnection built-in, which is useful for mobile devices that frequently change networks.

# What Datastar is Not

Datastar is not a client-side Single Page Application framework. It is not intended to replace React, Vue, Svelte, or Angular for all their use cases. It is more akin to LiveView, by depending more on server-rendered HTML. This means that slower server performance can negatively impact user experience, at the cost of less complexity on the client.

It also doesn't provide an offline story.

Unlike LiveView, it doesn't expect the server to maintain client state on the server. But you will have to implement your own server-side logic to handle sending data down to the client. While it is optimal to send HTML diffs, you can also send nearly the entire page's contents as a good-enough starting point.

# Signals

Core to Datastar are signals. Signals come from functional programming, but it's basically a variable that can notify consumers when its value changes. Signals are defined via `data-signals:name` attributes on any element. Signals are global to the page regardless where they are defined. By default all requests will send the value of signals to the server.

```html
<!-- Define a signal named "count" initialized to 1 (the JS number) -->
<div data-signals:count="1"></div>
```

Signal names defined via attributes with hyphens convert to camelCase, so `data-signals:first-name` names a signal called `firstName`. You can control casing with the `__case` modifier (`.camel`, `.kebab`, `.snake`, `.pascal`).

```html
<div data-signals:first-name="'Alice'">
Hello, <span data-text="$firstName"></span>!
</div>
```

You can also use dot notation to define nested signals, which is useful for complex data structures.

```html
<div data-signals:user.name="'Alice'" data-signals:user.age="30">
  Hello, <span data-text="$user.name"></span>! You are <span data-text="$user.age"></span> years old.
</div>
```

Signals can also be defined in bulk as a JS object (not just a JSON string)

```html
<!-- Define multiple signals -->
<div data-signals='{"count": 1, "name": "Alice"}'></div>
<!-- Define nested signals -->
<div data-signals='{user: {name: "Alice", age: 30}}'></div>
```

Signals can only be accessed within Datastar data attributes and are variables prefixed with a `$`.

```html
<div>Welcome, <span data-text="$name"></span>!</div>
```

If you want to define a signal based off another signal, you can use the `data-computed` attribute. This is useful for derived signals. Computed signals are read-only.

```html
<div data-signals:count="1" data-computed:sum="$count + 10">
  The sum is <span data-text="$sum"></span>
</div>
```

## Local Signals

If you want a certain signal NOT to be sent to the server, prefix the signal's name with underscore `_`:

```html
<!-- _count is a local signal, not sent to the server -->
<div data-signals:_count="1"></div>
```

## Signal Naming Rules

Signal names cannot contain double underscores (`__`), since that is reserved for modifiers. Signals defined later in the DOM override earlier definitions. You can use the `__ifmissing` modifier to only set a signal if it doesn't already exist, which is useful for setting defaults:

```html
<div data-signals:count__ifmissing="1"></div>
```

# Datastar Attributes

One of the main interfaces is Datastar's HTML attributes. These are all prefixed with `data-`. The [reference](https://data-star.dev/reference/attributes) lists all the available attributes.

For the most part, these attributes' values are arbitrary javascript with one specific additional syntax: `$signalName` which refers to a signal. Signals are global to the page. Signals help Datastar dynamically rerender parts of the page if those signals change.

Elements are evaluated by walking the DOM in a depth-first manner, and attributes are applied in the order they appear on the element.

## Attribute values are Javascript Expressions

It's worth remembering that most attributes are just JS expressions. For example, you can use `data-text` to set the text content of an element:

```html
<div data-text="'Hello, ' + $name"></div>
```

## `el` for current element

`el` is a special variable that refers to the current element.

## `$` for signals

Names prefixed with a dollar sign are for referring to signals.

## `@` for actions

Actions are prefixed with `@` and are used to call functionality within Datastar. For example, you can use `data-on:click` to trigger an action when an element is clicked:

```html
<button data-on:click="@post('/increment')">Increment Count</button>
```

## Modifiers

Attributes support modifiers using double underscores (`__`). Modifiers change the behavior of an attribute. For example, you can debounce a click handler:

```html
<button data-on:click__debounce.500ms="@post('/search')">Search</button>
```

Common modifiers include:

 - `__delay` — add a timing delay (`.500ms`, `.1s`)
 - `__debounce` — debounce events (`.500ms`, `.leading`, `.notrailing`)
 - `__throttle` — throttle events (`.500ms`, `.noleading`, `.trailing`)
 - `__once` — trigger only once
 - `__viewtransition` — wrap in the View Transition API when available

## Common Attributes

### `data-text`

Binds the text content of an element to an expression.

```html
<div data-text="$foo"></div>
```

### `data-show`

Shows or hides an element based on whether an expression evaluates to true or false.

```html
<div data-show="$isVisible"></div>
```

### `data-class`

Adds or removes CSS classes based on an expression.

```html
<div data-class:font-bold="$foo == 'strong'"></div>
<div data-class="{success: $foo != '', 'font-bold': $foo == 'strong'}"></div>
```

### `data-attr`

Sets the value of any HTML attribute to an expression and keeps it in sync.

```html
<div data-attr:aria-label="$foo"></div>
<div data-attr="{'aria-label': $foo, disabled: $bar}"></div>
```

### `data-style`

Sets inline CSS styles on an element based on an expression.

```html
<div data-style:background-color="$red ? 'red' : 'blue'"></div>
<div data-style="{
    display: $hiding ? 'none' : 'flex',
    'background-color': $red ? 'red' : 'green'
}"></div>
```

### `data-bind`

Establishes bidirectional data synchronization between form elements and signals. It applies to `input`, `select`, `textarea`, and web components.

```html
<input data-bind:foo />
```

### `data-on`

Attaches an event listener to an element. The event object is available as `evt`.

```html
<button data-on:click="$count++">Increment</button>
<div data-on:keydown__window="console.log(evt.key)"></div>
```

Useful modifiers for `data-on`:

 - `__window` — attach to the window element instead
 - `__outside` — trigger when the event occurs outside the element
 - `__prevent` — call `preventDefault()`
 - `__stop` — call `stopPropagation()`
 - `__passive` — don't call `preventDefault()` (performance optimization)
 - `__capture` — use capture phase listener

### `data-on-intersect`

Runs an expression when the element intersects with the viewport.

```html
<div data-on-intersect="$visible = true"></div>
<div data-on-intersect__once__half="@get('/lazy-load')"></div>
```

### `data-on-interval`

Runs an expression at a regular interval (default: 1 second).

```html
<div data-on-interval="$count++"></div>
<div data-on-interval__duration.5s="@get('/poll')"></div>
```

### `data-indicator`

Creates a signal that is `true` while a fetch request is in progress and `false` otherwise. Useful for loading states.

```html
<button data-on:click="@get('/endpoint')"
        data-indicator:fetching
        data-attr:disabled="$fetching">
  Submit
</button>
<div data-show="$fetching">Loading...</div>
```

### `data-effect`

Executes an expression on page load and whenever any signals in the expression change.

```html
<div data-effect="console.log($count)"></div>
```

### `data-init`

Runs an expression when the attribute is first initialized (on page load or when an element is patched into the DOM).

```html
<div data-init="$count = 1"></div>
```

### `data-ref`

Creates a signal that is a reference to the DOM element.

```html
<canvas data-ref:myCanvas></canvas>
<div data-init="$myCanvas.getContext('2d')"></div>
```

### `data-ignore`

Prevents Datastar from processing an element and its children. Use `__self` modifier to only ignore the element itself but still process descendants.

```html
<div data-ignore>
    <div>Datastar will not process this element.</div>
</div>
```

### `data-ignore-morph`

Tells the element patching to skip an element and its children during morphing. This preserves the existing DOM state for that subtree.

```html
<div data-ignore-morph>
    This element will not be morphed.
</div>
```

### `data-preserve-attr`

Preserves specific attribute values when an element is morphed.

```html
<details open data-preserve-attr="open">
    <summary>Title</summary>
    Content
</details>
```

# Actions

Actions are functions prefixed with `@` that can be called from Datastar expressions. The [reference](https://data-star.dev/reference/actions) lists all available actions.

## Backend Actions

All HTTP actions send requests with a `Datastar-Request: true` header and include signal values. The server response must contain Datastar SSE events (or other supported content types).

```html
<button data-on:click="@get('/api/data')">Load</button>
<button data-on:click="@post('/api/submit')">Submit</button>
<button data-on:click="@put('/api/update')">Update</button>
<button data-on:click="@patch('/api/patch')">Patch</button>
<button data-on:click="@delete('/api/remove')">Delete</button>
```

Backend actions accept an options object as the second argument:

```html
<button data-on:click="@post('/submit', {contentType: 'form'})">Submit Form</button>
```

Key options include:

 - `contentType` — `'json'` (default) or `'form'` for form-encoded/multipart requests
 - `filterSignals` — filter object with `include`/`exclude` regex patterns to control which signals are sent
 - `selector` — CSS selector for form element (when `contentType` is `'form'`)
 - `headers` — custom HTTP headers object
 - `openWhenHidden` — keep connection open when page is backgrounded (default: `false` for GET, `true` otherwise)
 - `retry` — strategy: `'auto'`, `'error'`, `'always'`, or `'never'` (default: `'auto'`)
 - `retryInterval` — wait time in ms between retries (default: `1000`)
 - `retryScaler` — multiplier for exponential backoff (default: `2`)
 - `retryMaxWaitMs` — maximum wait time between retries (default: `30000`)
 - `retryMaxCount` — maximum retry attempts (default: `10`)

## Signal Actions

`@setAll` updates all matching signals to a given value:

```html
<button data-on:click="@setAll(true, {include: /^foo$/})">Set Foo</button>
<button data-on:click="@setAll('', {include: /^user\./})">Clear User</button>
```

`@toggleAll` flips the boolean value of all matching signals:

```html
<button data-on:click="@toggleAll({include: /^is/})">Toggle</button>
```

`@peek` allows reading a signal without subscribing to its changes (useful to avoid unwanted reactivity):

```html
<div data-text="$foo + @peek(() => $bar)"></div>
```

## Response Handling

Backend actions support several response content types:

 - `text/event-stream` — standard SSE with Datastar events (the primary approach)
 - `text/html` — HTML to patch into the DOM, with behavior controlled by response headers (`datastar-selector`, `datastar-mode`, `datastar-use-view-transition`)
 - `application/json` — JSON to patch signals
 - `text/javascript` — Javascript to execute on the client

Fetch lifecycle events are dispatched as `datastar-fetch` events with a `type` property (`started`, `finished`, `error`, `retrying`, `retries-failed`).

# SSE Events

The recommended way for the server to respond to Datastar actions is via [Server-Sent Events](https://data-star.dev/reference/sse_events). The `text/event-stream` content type allows the server to stream updates to the client. Backend SDKs can format these automatically.

## `datastar-patch-elements`

Morphs DOM elements on the page. By default, Datastar morphs elements by matching top-level elements based on their ID.

```
event: datastar-patch-elements
data: elements <div id="foo">Hello world!</div>
```

Be sure to place IDs on top-level elements to be morphed, as well as on elements within them that you'd like to preserve state on.

You can control the patching behavior with additional data lines:

 - `selector` — a CSS selector to target a specific element (optional for `outer` and `replace` modes)
 - `mode` — how to patch: `outer` (default), `inner`, `replace`, `prepend`, `append`, `before`, `after`, or `remove`
 - `useViewTransition` — enable the View Transition API (`true` or `false`, defaults to `false`)
 - `namespace` — use `svg` or `mathml` XML namespace for the elements

Example with options:

```
event: datastar-patch-elements
data: selector #foo
data: mode inner
data: useViewTransition true
data: elements <div>Hello world!</div>
```

## `datastar-patch-signals`

Updates signal values on the page. The signals data line accepts a JS object in the same format as the `data-signals` attribute.

```
event: datastar-patch-signals
data: signals {foo: 1, bar: 2}
```

Setting a signal value to `null` removes it. Use `onlyIfMissing` to only set signals that don't already exist:

```
event: datastar-patch-signals
data: onlyIfMissing true
data: signals {foo: 1, bar: 2}
```

# Server Connection Behavior

Note that with SSE, browsers determine when keeping the connection alive is appropriate. Browsers typically close it while the page isn't focused and reopen it when the page is focused again. This means that:

 - You have no control when the connection is open / closed
 - The browser manages reconnecting if the connection is lost automatically
 - Your server needs to be able to handle clients reconnecting arbitrarily. Either by sending a snapshot of the latest state on connect or by assuming only the latest updates matter (e.g. latest stock price).

It is up to you if you want to return one SSE event in the response and close it or keep it long running for the page.

# Security

Since Datastar attributes can be thought of effectively running arbitrary Javascript, you do have to be careful when embedding user input.

All user-provided values passed into `data-*` should be escaped to prevent XSS attacks. Datastar does not automatically escape values, so you should ensure that any user input is sanitized before being used in Datastar attributes.

`data-ignore` allows you to ignore a tree of elements from being processed by Datastar. This is useful for user-generated html content that you don't want arbitrary JS to execute through.
