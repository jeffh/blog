# Two Kinds of Abstractions

- date: 2016-05-31

------------------------------

When someone talks about abstractions, they're usually trying to make the software more flexible. But that's usually one of two kinds of abstractions.

## Build an abstraction to *hide an implementation*

Abstractions that hide implementations are more commonly touted as good designs. [Ruby's Faraday][faraday] abstracts the specific HTTP library implementation. Rails' [ActiveRecord][activerecord] abstracts the SQL you need to write to interface with a relational database. The [Data Mapper Pattern][data mapper pattern] abstracts the persistent storage from your application.

A recent example of this kind of abstraction I've done is integrate with payment processors. Here's a theoretical example of an interface to accept payments:

```java
// Java: Just because it's concise for defining interfaces

class Payment { ... } // Value
class PaymentResponse { // Tuple of Error and updated Payment
  public Error error;
  public Payment payment;
}

interface PaymentProcessor {
  // Return a response that indicates success, or failure and
  // a Payment object for persistence and the UI.
  PaymentResponse startPayment(Order order)

  // Take a given set of input from the UI
  // Return a response that indicates success, or failure and
  // an updated Payment object for persistence.
  PaymentResponse updatePayment(
    Order order,
    Payment payment,
    FrontEndInputParameters input
  )

  // Authorize a payment to ensure we can charge this payment
  // Return a response that indicates success, or failure and
  // optionally can update the payment
  PaymentResponse authorizePayment(
    Order order,
    Payment payment
  )

  // Charge a payment and collect money.
  // Return a response that indicates success, or failure and
  // optionally can update the payment (eg - store charge id)
  PaymentResponse capturePayment(
    Order order,
    Payment payment
  )
  
  // Refund a charged payment and return the money
  // Return a response that indicates success, or failure and
  // optionally can update the payment (eg - indicate its been
  // fully refunded)
  PaymentResponse refundPayment(
    Order order,
    Payment payment,
    int amountInCents
  )
}
```

This kind of abstraction is usually more procedural — following an ordered series of method invocations.

Payment interface above could possible support many implementations:

- Stripe
- Braintree
- Store Credit
- Admin Adjustments

The consumer of the `PaymentProcessor` interface doesn't need to know anything about how payments are processed with the exception of these methods. Any payment system that works similarly to what `PaymentProcessor` expects can easily replace what's there.

In more dynamic languages, such as Python or Ruby, these interfaces may be implicitly assumed, but it's valuable to explicitly define them. Well-designed RPC-styled micro-services also fit these kinds of abstractions.

Implementation-hiding abstractions are usually few and far between. There's usually not a good reason to hide implementations that don't interact with code you don't control. There's not much benefit to hiding implementations for code you control — since that's akin to code organization.

## Build an abstraction to *compose* the solution

The second kind of abstraction is breaking the core problem down into a small set of composable pieces. Each piece may not necessarily be small, but each piece shouldn't repeat work that can be isolated and composed.

A well-trodden path is parsing text. There's many [talks][swift-parsers] and [articles][wikipedia] that demonstrate composing smaller parsers into larger ones. Data mapping between two similar data structures is a related problem that also has relatively clear composition traits. Composing a solution gives future flexibility to adapt to changing requirements of the problem being solve.

In composable abstraction, interfaces define how each piece communicates to one another. An interface for composability looks less procedural, and more functional:

```java
// Java
class Node { // Value
  public String name;
  public Collection<Node> children;
}

// How we read characters. Not well defined but just to
// illuminate the implementation of parsers
class Stream {
  int getOffset() { ... }
  void setOffset(int newOffset) { ... }
  Character get() { ... }
  boolean isEndOfStream() { ... }
}

interface Parser {
  Collection<Node> parse(Stream stream);
}
```

Parsers can be composed by passing parsers into each others constructors:

```java
// Parses if the stream starts with <literal> by returning
// that literal as a Node
class TextParser implements Parser {
  TextParser(String literal) { ... }
  Collection<Node> parse(Stream stream) { .. }
}

// Parses if the stream satisfies multiple parsers and returns
// the concatenation of all those parser results
class SequenceParser implements Parser {
  SequenceParser(Collection<Parser> parsers) { ... }
  Collection<Node> parse(Stream stream) { ... }
}

// Parses if the stream satisfies multiple parsers and returns
// the concatenation of all those parser results
class AnyOfParser implements Parser {
  AnyOfParser(Collection<Parser> parsers) { ... }
  Collection<Node> parse(Stream stream) { ... }
}

// Usage: compose to build a larger parser
Parser myParser = new SequenceParser(
  new AnyOfParser(
    new TextParser("Hello"),
    new TextParser("Goodbye")
  ),
  new TextParser(" Jeff")
)

// this parser accepts: "Hello Jeff" or "Goodbye Jeff"
myParser.parse(...);
```

`myParser` may look weird, but it's now easier to adapt to new requirements based on what we have. Changing the parser to parse 10 digits can be done without having to write a new class that implements `Parser`.

## Which abstraction should I use?

**Both**. The combination of both of these patterns that can make your software adaptable.

- Implementation-hiding abstractions are great for removing interactions with third party APIs from the rest of your code. Replacing or multiplexing implementations is easier. Use this for managing code you don't control.
- Composable abstractions are great for expanding the flexibility of your own code. It's great for adapting to change. Use this for code you do control that isn't directly interfacing with code you don't control.

Using both is not new at all. Combining both gives you a style of architecting that may sound familiar for OO programmers: [Hexagonal Architecture](https://vimeo.com/68375232).

Alternatively, others have called similar designs with different names:

- [Clean Architecture](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Functional Core, Imperative Shell](https://www.destroyallsoftware.com/talks/boundaries)
- [Ports and Adapters](http://www.dossier-andreas.net/software_architecture/ports_and_adapters.html)

If you pick up a classic [TDD testing book][GOOS], you'll see it built with Use Cases. Use Cases are similar to [Command Query Architecture](CQRS) (CQRS) [1]. which is becoming more popular because of Flux / ReactJS. They are similar in fundamentals with differing in details:

- Avoid code you don't control from proliferating in your code base
- Compose together code you control as much as possible
- Hide the composition of your code behind a series of Use Cases. A composable solution exposes the complexity of the problem you're solving that a Use Case can hide.

Functional programming has similar architectures under the different names:

- Interpreter Pattern - Compose a solution that emits a sequence of commands that can be read by an abstract machine to do stateful work. Programs that produce bytecode is the most familiar example, but commands can also just be enums with associated data that can be `switch`-ed
- Functional Reactive Programming - Provide a mechanism of composition that is also a way to abstract input/output behavior in user interfaces.

Functional programs tend to favor more composition, OO programs usually favor implementation hiding. While the mixture is debatable, it seems that both are necessary for well-designed programs.

----

[1]: Despite Martin Fowler's dislike of CQRS, I happen to find them valuable in conjunction with event sourcing. From personal experience, many long-lived applications usually build up a complicated domain beyond what a CRUD application can accomplish. Especially with cross-cutting concerns—authentication and authorization are usually the first two to come to mind. Add the ease of debugging an application from its event stream, and I feel the tradeoff of CQRS is worth its complexity if you event source your application

[faraday]: https://github.com/lostisland/faraday

[activerecord]: http://guides.rubyonrails.org/active_record_basics.html

[data mapper pattern]: https://en.wikipedia.org/wiki/Data_mapper_pattern

[swift-parsers]: https://realm.io/news/tryswift-yasuhiro-inami-parser-combinator/

[wikipedia]: https://en.wikipedia.org/wiki/Parser_combinator

[CQRS]: http://martinfowler.com/bliki/CQRS.html

[GOOS]: http://amzn.to/1Z26qv9
