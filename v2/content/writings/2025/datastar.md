+++
title = 'Datastar Basics'
date = 2025-08-18T18:10:19-07:00
+++


[Datastar](https://data-star.dev/) is [HTMX](https://htmx.org/)-like framework that attempts to minimize the amount of Javascript you using a few concepts:

 - Use html attributes for dynamism prefixed with `data-`
 - Easy in-document updates similar to [Turbo](https://turbo.hotwired.dev/)
 - Real-time updating via [SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
 - Signals for client-side state

 If we compare it to other approaches, we can understand some of the tradeoffs:

  - Unlike React, signals are global to a page and is expected to have less state than a full SPA. Complex UI elements are recommended to be [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) with Datastar.
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

Core to Datastar are signals. Signals come from functional programming, but it's basically a variable that can notify consumers when its value changes. Signals are defined via `data-signals-<name>` attributes on any element. Signals are global to the page regardless where they are defined. By default all requests will send the value of signals to the server.

```html
<!-- Define a signal named "count" initialized to 1 (the JS number) -->
<div data-signals-count="1"></div>
```

Signals defined as attributes convert hyphenated to camelCase, so `data-signals-first-name` names a signal called `firstName`.

```html
<div data-signals-first-name="Alice">
Hello, <span data-text="$firstName"></span>!
</div>
```

You can also use dot notation to define nested signals, which is useful for complex data structures.

```html
<div data-signals-user.name="Alice" data-signals-user.age="30">
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

If you want to define a signal based off another signal, you can use the `data-computed` attribute. This is useful for derived signals.

```html
<div data-signals-count="1" data-computed-sum="$count + 10">
  The sum is <span data-text="$sum"></span>
</div>
```

## Local Signals

If you want a certain signal NOT to be sent to the server, prefix the signal's name with underscore `_`:

```html
<!-- _count is a local signal, not sent to the server -->
<div data-signals-_count="1"></div>
```

# Datastar Attributes

One of the main interfaces is Datastar's HTML attributes. These are all prefixed with `data-`. The [reference](https://data-star.dev/reference/attributes) lists all the available attributes.

For the most part, these attributes's value are arbitrary javascript with one specific additional syntax: `$signalName` which refers to a signal. Signals are global to the page and can be set via `data-set` or updated via `data-sse`. Signals helps Datastar dynamically rerender parts of the page if those signals change.

## Attribute values are Javascript Expressions

It's worth remembering that most attributes are just JS expressions. For example, you can use `data-text` to set the text content of an element:

```html
<div data-text="'Hello, ' + $name"></div>
```

## `$` for signals

Names prefixed with a dollar sign are for referring to signals.

## `@` for actions

Actions are prefixed with `@` and are used to call functionality within Datastar. For example, you can use `data-on-click` to trigger an action when an element is clicked:

```html
<button data-on-click="@post('/increment')">Increment Count</button>
```

Unlike hypertext purists, actions send all signals and not form encoded elements by default. Use can pass `{contentType: 'application/x-www-form-urlencoded'}` as a secondary argument to `@post` or `@put` to send the signals as form-encoded data (assuming  the element resides in a form)

# Server Expectations

Actions that are defined within Datastar have a certain expectation of responses. They can either:

 1. Return HTML with an id at the root level of the response to determine what to replace.
 2. Return JSON to patch signals.
 3. Return Javascript to execute on the client.
 3. Return an SSE response to allow streaming of updates from server to the client.

The first approach is similar to Turbo or HTMX. Let's the last is the combination of all 3 before in a realtime stream.

 - Signals via patch (aka - merge) updates
 - Updating specific HTML elements on a page

It is up to you if you want to return on SSE event in the response and close it or keep it long running for the page.

Note that with SSE, browser determine when keeping the connection alive is appropriate. Browsers typically close it while the page isn't focused and reopen it when the page is focused again. This means that:

 - You have no control when the connection is open / closed
 - The browser manages reconnecting if the connection is lost automatically
 - Your server needs to be able to handle clients reconnecting arbitrarily. Either by sending a snapshot of the latest state on connect or by assuming only the latest updates matter (e.g. latest stock price).

# Security

Since Datastar attributes can be thought of effectively running arbitrary Javascript, you do have to be careful when embedding user input.

All user-provided values passed into `data-*` should be escaped to prevent XSS attacks. Datastar does not automatically escape values, so you should ensure that any user input is sanitized before being used in Datastar attributes.

`data-ignore` allows you to ignore a tree of elements from being processed by Datastar. This is useful for user-generated html content that you don't want arbitrary JS to execute through.

