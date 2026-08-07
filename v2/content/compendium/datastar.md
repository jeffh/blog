+++
title = 'Datastar'
date = 2026-08-06T12:01:35-07:00
+++

[Datastar][datastar] is an [HTMX][htmx]-like framework that attempts to minimize the amount of Javascript.

In short:

 - Use html attributes for dynamism prefixed with `data-` like HTMX
 - Easy in-document updates similar to ReactJS using Idiomorph.
 - Real-time updating via [SSE][sse]
 - Signals for client-side state (but minimize this when possible)

The ethos of Datastar:

 - Datastar is for adding dynamicism on a single page, not to provide single-page app styled navigation. This allows you to leverage as much as possible from the web browser itself.
 - Most of your complexity and behavior should be driven by the server. The client should hold little to no state.
 - Make your requests initiate mutations, but get the rest of the updates through SSE streams.

Refer to the [Tao of Datastar][tao].

For more details see the notes:

 - [Datastar Basics]({{< ref "/writings/2025/datastar" >}})
 - [Serving Datastar Streams]({{< ref "/writings/2026/serving-datastar-streams" >}})

Areas where Datastar may not be ideal:

 - A site where you want something dynamic that persists its state across page navigation. An example would be a Picture-in-Picture (PiP) video to follow the user as they navigate.
 - Offline support. Some intermittent network connectivity issues are okay, but it is not designed for long offline uses without a connection to the server.
 - "Primary-UI element" pages that are high in interaction complexity (ie. Code Editor, Canvas-based editor, etc.)

Areas where Datastar has potential, but needs more fleshing out:

 - Building isolated components. Datastar recommends Web Components. There is a premium feature, [Rocket][rocket] that is exploring this.
 - Likewise, there isn't a prebuilt set of web components available to drop into a Datastar project like Shadcn.
 - Styling has been centralizing towards TailwindCSS, which assumes the JS build ecosystem, there is an alpha [Stellar][stellar-css] as an attempt to address this.

Perfect use cases for Datastar:

 - Need less read-acess area for security or compliance reasons (or just being paranoid)
 - More dynamic interaction that Javascript-less Multi-Page Apps
 - Streaming real time updates
 - You have a team more comfortable on the backend than the backend
 - Looking for something more than HTMX
 - Looking for fast page loads by avoid the multi-megabyte JS bundles for your site
 - Side-stepping Typescript/Javascript on the frontend and backend to support SSR


[datastar]: https://data-star.dev/
[tao]: https://data-star.dev/guide/the_tao_of_datastar
[htmx]: https://htmx.org/
[sse]: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
[rocket]: https://data-star.dev/pro#rocket
[stellar-css]: https://data-star.dev/pro#stellar-css
