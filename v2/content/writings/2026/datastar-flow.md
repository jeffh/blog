+++
title = 'Serving Datastar Streams'
date = 2026-08-06T04:36:51-07:00
tags = ['Datastar', 'Software Design']
draft = true
+++

[Datastar][datastar] leaves the server-side implementation open-ended. Datastar
provides [SDKs][ds-sdks] for various languages, but those SDKs only cover [the
protocol on top of SSE][ds-sse] that the Datastar JavaScript client expects. To
manage Datastar connections from the server, you need two things:

1. Sending the [SSE][sse] events Datastar expects.
2. Getting state changes from one of your servers to the others.

The second is the harder one if you haven't worked with streaming
architectures. The creator of Datastar uses [NATS][nats], but any centralized
store or pub-sub queue where servers can publish and read changes is enough to
get started. Server languages that handle concurrency poorly will hit limits on
scaling SSE connections sooner.

# Streaming Flow

Here's the flow for any SSE setup with Datastar. (For a refresher on the client
side, see [Datastar Basics]({{< ref "/writings/2025/datastar" >}}).)

{{< rawhtml >}}
<style>
.dsflow { overflow-x: auto; margin: 2rem 0; }
.dsflow svg { display: block; width: 100%; min-width: 560px; max-width: 700px; height: auto; margin: 0 auto; }
.dsflow .dsf-actor { fill: var(--text-primary, #17161a); font-family: var(--font-sans, sans-serif); font-size: 14px; font-weight: 600; }
.dsflow .dsf-box { fill: var(--bg-sunk, #f2f1ee); stroke: var(--line-hairline, #e3e2e0); }
.dsflow .dsf-life { stroke: var(--line-hairline, #e3e2e0); stroke-width: 1; stroke-dasharray: 4 5; }
.dsflow .dsf-bar { fill: var(--bg-sunk, #f2f1ee); stroke: var(--line-hairline, #e3e2e0); }
.dsflow .dsf-msg { stroke: var(--text-primary, #17161a); stroke-width: 1.4; fill: none; }
.dsflow .dsf-msg.is-res { stroke-dasharray: 6 4; }
.dsflow .dsf-msg.is-sse { stroke: var(--accent, #2340e6); }
.dsflow .dsf-label { fill: var(--text-primary, #17161a); font-family: var(--font-mono, monospace); font-size: 12.5px; }
.dsflow .dsf-label.is-sse { fill: var(--accent, #2340e6); }
.dsflow .dsf-num { fill: var(--text-tertiary, #9a999f); font-family: var(--font-mono, monospace); font-size: 12.5px; }
.dsflow .dsf-note { fill: var(--text-secondary, #74737b); font-family: var(--font-sans, sans-serif); font-size: 11.5px; }
.dsflow .dsf-bracket { stroke: var(--line-underline, #c7c6ca); stroke-width: 1; fill: none; }
.dsflow .dsf-side { fill: var(--text-secondary, #74737b); font-family: var(--font-sans, sans-serif); font-size: 11.5px; letter-spacing: 0.06em; text-transform: uppercase; }
.dsflow .dsf-more { fill: var(--text-tertiary, #9a999f); font-family: var(--font-sans, sans-serif); font-size: 16px; }
</style>
<div class="dsflow">
<svg viewBox="0 0 700 512" role="img" aria-labelledby="dsflow-title dsflow-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="dsflow-title">Datastar SSE request flow between client and server</title>
  <desc id="dsflow-desc">A sequence diagram. 1: the client sends GET slash. 2: the server responds with HTML containing data-on:load="@get('/stream')". 3: the client sends GET slash stream. 4: the server responds with an event-stream and leaves the connection open. 5: the server sends a datastar-patch-elements event carrying the full page state. 6: the server keeps sending datastar-patch-elements events as state changes. 7: the client posts to slash update; the response carries no state because the stream does. Steps 5 through 7 repeat for the life of the stream.</desc>

  <defs>
    <marker id="dsfArrow" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 Z" fill="var(--text-primary, #17161a)"/>
    </marker>
    <marker id="dsfArrowSse" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 Z" fill="var(--accent, #2340e6)"/>
    </marker>
  </defs>

  <!-- actors -->
  <rect class="dsf-box" x="45" y="10" width="160" height="36" rx="4"/>
  <text class="dsf-actor" x="125" y="33" text-anchor="middle">Client</text>
  <rect class="dsf-box" x="465" y="10" width="160" height="36" rx="4"/>
  <text class="dsf-actor" x="545" y="33" text-anchor="middle">Server</text>

  <!-- lifelines -->
  <line class="dsf-life" x1="125" y1="46" x2="125" y2="490"/>
  <line class="dsf-life" x1="545" y1="46" x2="545" y2="490"/>

  <!-- open SSE connection -->
  <rect class="dsf-bar" x="121" y="256" width="8" height="214" rx="2"/>
  <rect class="dsf-bar" x="541" y="256" width="8" height="214" rx="2"/>
  <path class="dsf-bracket" d="M636 256 L644 256 L644 470 L636 470"/>
  <text class="dsf-side" x="664" y="363" text-anchor="middle" transform="rotate(-90 664 363)">stream stays open</text>

  <!-- 1 -->
  <text class="dsf-num" x="133" y="82">1</text>
  <text class="dsf-label" x="335" y="82" text-anchor="middle">GET /</text>
  <line class="dsf-msg" x1="133" y1="92" x2="537" y2="92" marker-end="url(#dsfArrow)"/>
  <text class="dsf-note" x="335" y="107" text-anchor="middle">plain page request — no SSE yet</text>

  <!-- 2 -->
  <text class="dsf-num" x="133" y="138">2</text>
  <text class="dsf-label" x="335" y="138" text-anchor="middle">200 OK · text/html</text>
  <line class="dsf-msg is-res" x1="537" y1="148" x2="133" y2="148" marker-end="url(#dsfArrow)"/>
  <text class="dsf-note" x="335" y="163" text-anchor="middle">markup contains data-on:load="@get('/stream')"</text>

  <!-- 3 -->
  <text class="dsf-num" x="133" y="194">3</text>
  <text class="dsf-label" x="335" y="194" text-anchor="middle">GET /stream</text>
  <line class="dsf-msg" x1="133" y1="204" x2="537" y2="204" marker-end="url(#dsfArrow)"/>
  <text class="dsf-note" x="335" y="219" text-anchor="middle">Datastar-Request: true</text>

  <!-- 4 -->
  <text class="dsf-num" x="133" y="250">4</text>
  <text class="dsf-label is-sse" x="335" y="250" text-anchor="middle">200 OK · text/event-stream</text>
  <line class="dsf-msg is-res is-sse" x1="537" y1="260" x2="133" y2="260" marker-end="url(#dsfArrowSse)"/>
  <text class="dsf-note" x="335" y="275" text-anchor="middle">headers only — the connection is left open</text>

  <!-- 5 -->
  <text class="dsf-num" x="133" y="306">5</text>
  <text class="dsf-label is-sse" x="335" y="306" text-anchor="middle">event: datastar-patch-elements</text>
  <line class="dsf-msg is-sse" x1="537" y1="316" x2="133" y2="316" marker-end="url(#dsfArrowSse)"/>
  <text class="dsf-note" x="335" y="331" text-anchor="middle">the full state of the page</text>

  <!-- 6 -->
  <text class="dsf-num" x="133" y="362">6</text>
  <text class="dsf-label is-sse" x="335" y="362" text-anchor="middle">event: datastar-patch-elements …</text>
  <line class="dsf-msg is-sse" x1="537" y1="372" x2="133" y2="372" marker-end="url(#dsfArrowSse)"/>
  <text class="dsf-note" x="335" y="387" text-anchor="middle">deltas, pushed as state changes</text>

  <!-- 7 -->
  <text class="dsf-num" x="133" y="418">7</text>
  <text class="dsf-label" x="335" y="418" text-anchor="middle">POST /update …</text>
  <line class="dsf-msg" x1="133" y1="428" x2="537" y2="428" marker-end="url(#dsfArrow)"/>
  <text class="dsf-note" x="335" y="443" text-anchor="middle">changes come back on the stream, not in this response</text>

  <text class="dsf-more" x="335" y="482" text-anchor="middle">⋮</text>
</svg>
</div>
{{< /rawhtml >}}

1. Client requests a server-rendered page that isn't SSE.
2. Server returns a page with an element that opens a Datastar SSE endpoint, like [`data-on:load="@get('/stream')"`][ds-attrs]. That can be the same path, if the server reads the `Datastar-Request: true` header to tell that Datastar initiated the request. This example uses a separate endpoint for clarity.
3. Client requests the endpoint that provides the SSE stream.
4. Server responds with headers indicating an SSE stream, leaving the connection open.
5. Server sends the current page's contents (again). This should be the full state of the page.
6. Server sends deltas as needed. To get started, it's fine to send the entire page's contents again.
7. The client may send mutations via request actions. Those changes come back on the stream, not in the response to the action.

Is #5 important? It's what covers reconnects, which clients do arbitrarily.

SSE connections are browser-controlled: the browser may cut the connection at any point, and reconnect at any point. So whenever a connection is established, assume a disconnect preceded it and send the latest state. Steps 3-5 should repeat every time the browser reconnects.

A browser will typically drop an SSE connection when:

 - The user switches away from the tab using it
 - The browser is backgrounded (on mobile devices)
 - The connection idles (Datastar can keep-alive the response as a best effort)

This changes from browser version to browser version, as each vendor decides what's optimal for battery life.

Sending the full state initially also handles a patch-elements edge case: navigating to a new page and then going back to the SSE-enabled one. Some browsers restore the HTML from the initial page load rather than the state Datastar patched in. Re-sending the state on connect resolves that too.

You can replace patch elements with [patch signals][ds-sse], as long as signals cover every state change you'd otherwise make through SSE.


# Backend Implementation Needs

SSE holds a connection open for a long time, so use a framework or language that supports IO concurrency (node, go, rust, etc.).

The traditional options for server-to-server communication all apply:

 - [NATS][nats]
 - [Redis PUB/SUB][redis-pubsub]
 - [Postgres LISTEN/NOTIFY][pg-notify]
 - Any cloud provider pub/sub ([Google Cloud Pub/Sub][gcp-pubsub], [AWS SNS][aws-sns], etc.)
 - P2P libs like [iroh][iroh]

Whatever writes you make should publish the entity ID or page identifier that changed. A server receiving an SSE stream request then subscribes to those entities, and gets notified when changes occur on that page.

Use a modern compression for the SSE stream ([zstd][zstd], [brotli][brotli], etc.). The [Datastar SDKs][ds-sdks] typically do this for you, but remember to if you're implementing it yourself. This one change dramatically reduces the redundant data you send down the stream — including the full page updates you send (because we're being lazy).


# Some Other Uses for SSE Streaming

Some fun ideas that you can use the above process for:

## Render Above the Fold, Stream in the Rest

The initial page render and the SSE stream don't have to return the same results. The server can return only what's above the fold — by limiting how many items a list returns, or by marking the elements to load later with an HTML element the server recognizes.

If the page doesn't need real-time streaming, the server can close the stream once it has written the full page contents.


## Multiplayer Collaboration

There is nothing more to do here! If you've implemented the design above, this already works.

## Throttling

Updates are controlled by the server, so any updates can be rate limited by the server.


[datastar]: https://data-star.dev/
[ds-sdks]: https://data-star.dev/reference/sdks
[ds-sse]: https://data-star.dev/reference/sse_events
[ds-attrs]: https://data-star.dev/reference/attributes
[sse]: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
[nats]: https://nats.io/
[redis-pubsub]: https://redis.io/docs/latest/develop/pubsub/
[pg-notify]: https://www.postgresql.org/docs/current/sql-notify.html
[gcp-pubsub]: https://cloud.google.com/pubsub
[aws-sns]: https://aws.amazon.com/sns/
[iroh]: https://www.iroh.computer/
[zstd]: https://facebook.github.io/zstd/
[brotli]: https://github.com/google/brotli
