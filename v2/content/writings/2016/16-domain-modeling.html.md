+++
title = 'Modeling the Domain'
date = 2016-01-31
url = "2016/16-domain-modeling"
tags = ["Concepts", "Software Design"]
+++

Let's mentally build an API for an an e-commerce site. Let's say we're tasked
with building the cart & checkout portion of the API. Building a RESTful API
seems like the natural choice. At first, a Cart seems like any other model
entity in the system. But what about an multi-page checkout step?

- Allow partial updating of the Cart model (sounds like a job for PATCH). We
  need to preserve as much information as possible on the server to allow the
  user to pick up where they left off.
- Each update needs to be validated against the current known state of the
  world. Store credit may not fully cover an order that has an upgraded shipping
  method specified later on.
- The final cart has to be "commited" where final validations need to be
  performed before commited.
- An finally, the committed cart requires taking to third party APIs all along
  the way (shipping, credit card processing, tax calculations) as well as at the
  commit point.

REST doesn't provide an easy way to model this.

We could add new custom endpoints, but that means this entity is no longer
following REST.

Another olution is the use new intermediary REST entities for each step of
checkout. But that's weird. Each model only be useful for that step of the
checkout. Not including the fact that we would need to know how to retrive the
intermediary model or unify the identifiers.

Our REST hammer isn't going to cut it. It's just not a general enough
abstraction to use all network communications.

What went wrong? The abstraction, REST, didn't account for something in our
problem domain. Domain modeling is half of what makes good abstractions. And
that's anything but easy.

A poor abstraction is a misunderstanding of the problem. The original problem it
ment to solve is fundamentally incorrect. Creating abstractions without initial
contact with the problem usually births these abominations.

A mediocre abstraction is leaky. That means it doesn't account for unforseen
situations. Special cases and work-around code are common symptoms. First-level
refactors tend to be this level inside applications. It's perfectly acceptable
for frontend applications to have this level of abstraction. They only need to
solve the solution for the specific context in mind and not future situations.

A decent abstraction solves the problem well, but doesn't factor in expanding
scope. It doesn't provide an obviously pattern to apply or extension point. Lots
of libraries start like this. Many libraries fall into this category. And it's
fine if the scope they're solving is a finite problem, such as implementing a
specification. Something like REST would be here. But solving a general problem
needs to go further.

A great abstraction solves the problem well with considerations for unaccounted
scope. It does provide a pattern to apply or an extension point for new
capabilities. The difficulty in reaching this level as a general purpose library
is rare and difficult.

In short, great abstractions is far from implementation details but close enough
to model the problem at hand. That's not easy.

Programmatic abstractions minimize the surface area between both sides of the
interface. A good example is go's http interface to its web server:

```go
type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}
type ResponseWriter interface {
    Header() Header
    Write([]byte) (int, error)
    WriteHeader(int) // Status Code
}
type Request struct {
    Method string
    URL *url.URL
    Header Header
    Body io.ReadCloser
    ContentLength int64
    // ... more fields ...
}
```

Go's http interface is similar to Python's WSGI or Ruby's Rack interfaces. The
surface area is a function `Handler.ServeHTTP` for the http server and
`ResponseWriter` delegate methods for the app to tell the server how to behave.
The streaming writer is intentional, as it's possible to build a buffered /
functional-like interface on top of a streaming one. Programmatic interfaces
should have a small surface area. That's one of the main arguments of
[GraphQL](http://graphql.org/) over REST: there are no ad-hoc endpoints for the
client to know about.

That's not to saying that class-based modeling of problem domain is wrong. For
example, [Joda-time]() is abstracting the complex, inconsistent rules of time
that makes it hard to abstract in a clean, concise interface. Abstracting time
is fundamentally difficult (and ever changing) problem. At worst, these
libraries tend to inform incorrect or ambigious usages.

We should minimize introducing
[human complexity](https://www.youtube.com/watch?v=l3nPJ-yK-LU) and prefer
programmatic ones. Obviously that can't apply universally - user interfaces and
business rules will likely need some of that complexity. But both areas
generally don't need highly factored code.
