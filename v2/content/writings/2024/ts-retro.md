+++
title = 'Typescript Retrospective'
date = 2024-10-01T20:37:50-07:00
tags = ['Svelte', 'Typescript', 'Cursor', 'VSCode', 'Clojurescript']
+++

As part of trying out Svelte, I've also stepped into the modern web development
ecosystem. I previously worked primarily in Clojurescript, so my reference point
is based on being away from conventional web dev for many years.

# The Good Parts

## Getting Started is Easy

Having not have to build anything yourself is can be nice if you want to deliver
something quickly. This is doubly true when Svelte allows you to pull a library
that doesn't have explicit view framework support (eg - ReactJS). Need auth? Use
[AuthJS][authjs]. Everything is so [easy][simple is not easy].

The getting started experience is relatively seamless, assuming you're using
recommended practices. There's little effort to make incremental changes.

## Hot Reload Just Works

While developing, the hot reload is nice and doesn't (usually) have fickly
behavior. This is unlike [air][air] or [templ][templ], which doesn't seem to
always reload properly, or sometimes hang when reloading.

## File-based Routing is Intuitive

Although it's weird to have a bunch of square brackets as part of your folders,
but it generally works without confusion or issues. It's a simple model that
maps well to the file system.

## Typescript's Type System is Powerful

Typescript's type system is powerful and flexible. It's interesting to see
autocomplete and types based on file-based routing or through inferences. It's
nice that some basic refactoring like rename just work™️. Often I'm surprised
how much effort the community puts to add types to as much as possible.

## Some Good Libraries

[Zod][zod] is great. It's a concise validation and parsing library like
Clojure's [Schema][clojure-schema]. [TRPC][trpc] is good for jump to definition
and easy of having backend-only and backend/frontend endpoints.

[Tailwind][tailwind] is also has excellent VS Code integration.

## Destructuring is Nice

Having used many programming languages with destructuring, it definitely can
save a lot of boilerplate around extracting values out of data structures.

# The Annoying Parts

There are some things that are annoying, but not table-flipping rage inducing.

## JSON is a Poor Medium

JSON only supports a limited number of types. Most notable issue is transferring
dates & times, but it does apply to other data structures that Javascript
provides: Map, RegExp, Set, URL etc.

Yes, there's [superjson][superjson].

## Null and Undefined

Javascript always had two types to represent the absent of something, but
Typescript makes it more annoying to deal with. Now you have to make sure your
empty types line up to functions and fields you pass through. It's just an ugly
wort of the the language.

## Security

I'm not thrilled about the comfortability of arbitrary code execution that
exists in the ecosystem:

1. VS Code Extensions have arbitrary code execution capabilities.
2. `npm install` is running arbitrary code from the internet

I feel like only picking popular project is the only sane way to feel like
you're not installing something bad. Oh and make sure you don't make any typos!

# The Bad Parts

## Type Errors

Yes it's typesafe, but its common to generate large type check errors that are
difficult to diagnose or troubleshoot. It almost reminds me of C++ template
errors. And that's not a good thing. I've litteral spent hours debugging type
errors in C++ before. I have spent 15-30 minutes trying to understand various
type errors in typescript.

Along with this, I feel like it is required to use something like VS Code with
[Pretty TypeScript Errors][pretty-ts-errors] as the easiest way to make sense of
errors, but any complex type can be difficult to understand the underlying
cause.

(JavaScript) runtime errors are still not particularly easy to debug.

## Slow Editing Feedback Loops

Randomly in [Cursor][cursor] or [VS Code][vscode] will take up to a couple of
minutes to some trival action. It's bad:

1. Daily, I have a few files that will take 1-5 minutes to save. It's not
   consistent and just happens randomly. I'm close to saying this negates almost
   all the benefits of hot reload.
1. Also, pasting code is randomly slow as well. This applies to any file type
   (including writing this blog post in markdown!). Slow pasting can take up to
   1 minute to complete, where any editing commands are buffers / frozen.
1. Type checking is slow that I just miss type errors when editing. And since
   Typescript type errors are optional, I don't really notice an issue until
   later. This creates a middle ground that's worst of both worlds. I can edit
   as fast as like I do without types, but have to come back to try to
   understand the (sometimes large) type errors.
1. Jumping to definition that opens a file also plays this chance-to-be-slow
   game. So opening a Typescript file can sometimes take 10 minutes to open!

I personally value fast iteration loops in local development. This editing
environment makes [Clojure REPL startup time][clojure-startup] feel great in
comparison. And that typically takes 10-30 seconds to start large projects once
with maybe one second reload times between full code reloads.

These are all on a [Mac Studio][mac-studio] M1 Ultra. Emacs, Vim, NeoVim,
Sublime Text, Focus do not suffer from any of these issues, although I don't use
them for Typescript.

[authjs]: https://authjs.dev/
[simple is not easy]: https://www.youtube.com/watch?v=SxdOUGdseq4
[air]: https://github.com/air-verse/air
[templ]: https://templ.guide/
[cursor]: https://www.cursor.com/
[vscode]: https://code.visualstudio.com/
[clojure-startup]: https://ericnormand.me/article/how-do-clojure-programmers-deal-with-long-startup-times
[zod]: https://zod.dev/
[trpc]: https://trpc.io/
[mac-studio]: https://www.apple.com/mac-studio/
[clojure-schema]: https://github.com/plumatic/schema
[superjson]: https://github.com/flightcontrolhq/superjson
[pretty-ts-errors]: https://marketplace.visualstudio.com/items?itemName=yoavbls.pretty-ts-errors
[tailwind]: https://tailwindcss.com/
