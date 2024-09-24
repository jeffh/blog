+++
title = "Svelte 5 for ReactJS Users"
date = 2024-09-23T22:17:00-07:00
tags = ["Svelte", "React", "JavaScript", "TypeScript", "Today I Learned"]
+++

Disclaimer: I didn’t learn Svelte before v5, so this is an experience report on
translating Svelte 4 code to 5.

This is a blind jump into Svelte.

# The Basics

Svelte components end in `.svelte` like `.jsx` or `.tsx`. They look more
HTML-like than JavaScript. In comparison, ReactJS is more JavaScript-like than
HTML.

```svelte
<script>
  let { name } = $props();
</script>

<h1>Hello, {name}!</h1>
```

## Typescript

To use TypeScript, add `lang=”ts”` to the script tag:

```svelte
<script lang="ts">
  let { name }: {name: string} = $props();
</script>

<h1>Hello, {name}!</h1>
```

## Builtins

Some [special forms](https://svelte-5-preview.vercel.app/docs/runes#) exist in
Svelte 5 files.

- `$props()` returns an object, similar to React props.
- `$state(initialValue)` declares a variable tracked by Svelte for automatic
  re-renders like `useState`, but without explicit setters and getters. Use the
  variable like normal JavaScript in Svelte. This is called a **rune**.
- `$derived(expression)` declares a variable to be tracked by Svelte, but its
  value depends on another **rune**.
- `$effect(fn)` calls a function for side effects after the HTML is attached to
  the DOM. Svelte will look for runes in this function to know when to
  invalidate it. Effects are invoked when a used **rune** changes.
- `$bindable()` defines a property like giving a mutable pointer. Component
  consumers can provide a place to store the bind value.
- `$inspect(value)` is a handy way to print values during debugging.

### In non-component files

One reason for runes in Svelte 5 is to work seamlessly in TypeScript/JavaScript
files. To do this, rename the file to have a `.svelte` extension:

- `example.js` to `example.svelte.js` to access runes.
- `example.ts` to `example.svelte.ts` to access runes.

## Where is the key?

In React, it’s common to have keys to inform reuse:

```svelte
{items.map((row) => {
  <tr key={row.id}>...</tr>
})}
```

This helps the diffing algorithm determine the minimal DOM operations. In Svelte
5, Proxy objects manage this – so Svelte can see what operations you perform on
vanilla JavaScript collections at runtime:

```svelte
<script lang="ts">
  let items = $state([]); // Svelte returns a proxy object to the Array
  ...
  items.push(...); // svelte knows this is an append operation
</script>

{#each items as item}
  <tr>...</tr>
{/each}
```

You can still specify keys via the each syntax:

```svelte
{#each items as item (item.id)}
  <tr>...</tr>
{/each}
```

Where ([item.id](http://item.id)) indicates the key expression. Alternatively,
use `#key:`

```svelte
{#key count}
The count is {count}
{/key}
```

## Rerenders?

Anyone experienced with React knows when re-renders occur. It’s a bane of
performance debugging in React due to JavaScript’s mutable nature and poor
equality semantics (e.g., functions). I guess this means these aren’t an issue,
since there’s no Svelte documentation on this.

## Integration with Third-Parties

For third-party libraries, it’s straightforward to attach onMount behaviors
using `$effect()` with a return value for unmount behavior.

```svelte
<script lang="ts">
  import { createPlugin, destroyPlugin } from 'randomJSLibrary';
  let element: HTMLElement;

  $effect(() => {
    createPlugin({target: element});

    return () => {
      destroyPlugin();
    }
  })
</script>

<div bind:this={element}></div>
```

# Special Elements

Svelte has [special elements](https://svelte.dev/docs/special-elements) for
activities unusual for traditional templating/layout engines. These tags are
namespaced with `svelte:`

- `<svelte:head>` allows adding elements in the page’s <head>.
- `<svelte:self>` allows recursive components.
- `<svelte:window>`, `<svelte:document>`, and `<svelte:body>` allow attaching
  handlers or behaviors to these page-level elements.

# Translating Svelte 4 code

Svelte 5 or Svelte 4 syntax is per-file. It is detected automatically based on
API usage.

## Slots

`<slot />` is replaced with `{@render children()}`. Like:

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
```

Replace `<slot name=”foo” />` attributes with `{#snippet foo()}`, where `foo`.

## Props

All `export let myPropertyName` statements can be refactored to use destructure
from `$props()`.

## svelte:component

This has been replaced by using the component directly in code:

```svelte
<svelte:component this={myTag}></svelte:component>
```

Is now:

```svelte
<myTag></myTag>
// sometimes, you may need to define a variable before using:
{@const myTag = item.Element}
<myTag></myTag>
```
