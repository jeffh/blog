+++
title = 'Object Oriented Programming'
date = 2025-07-24T01:51:17-07:00
tags = ['compendium', 'ai-written']
+++

Object Oriented Programming is really two different ideas: message-passing and compile-time hierarchies. The former informs modern distributed systems and the latter is the basis of popular mmordern programming architectures.

| Problem | Small-talk / Message Passing Lineage | Modern / Static Lineage |
| --------- | --------------- | ------ |
| Encourages everything to be solved with ... | message passing | classes
| Integrating two existing pieces of code | proxy objects, dynamic dispatch | interfaces / adapter-pattern |
| Extending code without modifying original code ... | Delegation | Inheritance |
| Calling a method implementation is ... | Asynchronous and knowable only at runtime | Synchronous and compile-time known |
| Iterating on Program Development by ... | Update one object at a time while preserving state, Limited type checking | Compile-time, Static type checking, Update full program by reseting state |

While both are technically about objects, one focuses on using mechnanisms of messages to solve problems, while the other focuses on using classes and inheritance to solve problems.

An small example would be about deferring some code to be executed later "in the background":

```objc
// objective-c: message passing style
[object performSelector:@selector(callMethod:)
             withObject:argument
             afterDelay:1.0];
```

```java
// java: modern OOP style
timer.schedule(new TimerTask() {
    @Override
    public void run() {
        object.callMethod(argument);
    }
}, 1000);
```

In the first class, messages are values that are passed along to a method that will do the scheduling work. In the modern style, there is a clearer structure for a type checker to know if its safe to call the method on the given object.


## Lisp Origins

Most developers familiar with OOP think of classes, inheritance, and encapsulation. However, the roots of object-oriented programming actually lie in the Lisp community, particularly with the Common Lisp Object System (CLOS). CLOS was inspired by earlier Lisp object systems such as MIT Flavors and CommonLoops, and differs radically from the OOP facilities found in more static languages such as C++ or Java.

Alan Kay, who coined the term "object-oriented programming", was inspired by biological cells and had a vision focused on encapsulated mini-computers communicating via message passing rather than direct data sharing. His famous 2003 email clarifies this: "OOP to me means only messaging, local retention and protection and hiding of state-process, and extreme late-binding of all things".

Notably, Kay later expressed regret about his terminology choice: "I'm sorry that I long ago coined the term 'objects' for this topic because it gets many people to focus on the lesser idea. The big idea is messaging".

Aside: A fun note is the CLOS adds object-oriented programming as a library in LISP because of its powerful macro system.

## Message Passing vs Modern OOP

### Message Passing OOP

Kay's original concept, implemented in Smalltalk, emphasized several key principles that differ significantly from mainstream OOP:

**Dynamic Message Processing**: In Message Passing OOP, everything revolves around sending messages to objects. Unlike modern method calls where you call code by name, you send data (a message) to an object and it figures out which code, if any, to execute in response. Objects could even ignore messages they didn't understand. A close analog is HTTP REST APIs, but with the serialization, protocol, and mechanism of communication managed by a runtime.

**Extreme Late Binding**: All decisions about object behavior are deferred until runtime. This creates incredibly flexible systems where objects could change their behavior dynamically, but requires more runtime overhead. Late binding obscures shared contracts since common interfaces among objects are implied.

**Asynchronous Communication**: Objects were designed to operate independently, communicating through asynchronous message passing rather than synchronous method calls.

**Extending via Delegation**: Objects could delegate behavior to other objects by sending messages to them.

**Live System**: Objects could be updated in a live system without needing to stop and recompile the entire program. This was a departure from the static compilation model of languages like C++.

Another perspective of looking at a message passing approach is that the runtime that objects operate in is important. Things like message delivery, serialization, and deserialization are all handled by the runtime.

### Modern OOP: Practical Evolution

The C++ lineage (C++, Java, C#) evolved away from Kay's vision toward more practical concerns. Modern OOP prioritized:

**Class Hierarchies over Message Flexibility**: Instead of proxy objects that could dynamically handle messages, modern languages use inheritance and interfaces for extensibility.

**Synchronous Method Calls**: For performance reasons, modern OOP languages favor direct method invocation over message passing.

**Static Type Systems**: Modern languages added compile-time type checking for safety and performance, trading away the dynamic flexibility Kay envisioned. Interfaces add type safety across different types.

**Full-Program Compilation**: Rather than updating objects in a live system, modern approaches recompile entire programs.

**Extending via Inheritance**: Modern OOP languages use inheritance to extend behavior, which can lead to rigid class hierarchies and the "fragile base class" problem. Interfaces are typically a no-implmentation-copying form of inheritance.

**Static System**: Modern OOP languages typically require stopping the system to update code, which is a departure from Kay's live system vision.

Casey Muratori's coining of ["compile-time hierarchies"][compile-time-hierarchies] as a common form of OOP architecture that is common in modern languages. He describes it as software that uses class inheritance and/or composition to define relationships between objects while hiding state. A proposed alternative is a flatter structure where state is readily accessible across the system, such as ECS / Entity-Component-System style.

While compile-time hierarchies are faster than message passing within a single process, it tends to perform slower than ECS or systems that more open about data access within the program.

## Actor Model: Distributed Message Passing OOP

### Erlang

Interestingly, Erlang's creators didn't initially know about the Actor Model when they designed their language, but ended up creating something remarkably aligned with Kay's original vision. The problems Erlang was trying to solve (reliability, replication, redundancy) are the same nature was trying to solve when it evolved cells, and Alan Kay explicitly modeled OO on biological cells.

Erlang extends massage-passing OOP principles to distributed systems:

**Isolated Actors**: Erlang processes can only communicate via messages, with immutable boundaries preventing actors from passing mutable references or altering another actor's state.

**Fault Isolation**: Errors are scoped to individual processes, so exceptions don't escape beyond an actor, enabling sophisticated supervision patterns.

**Location Transparency**: Actors can send messages to other actors on different machines using the same syntax as local communication.

**Fair Execution**: Actors have fair scheduling, ensuring that no single actor can monopolize the CPU and starve other actors.

### Virtual Actors

Virtual Actors are an evolution of the Actor Model, where actors have dynamic lifetimes similar to virtual memory access: where the OS can determine when to allocate a process' memory to RAM or not depending on read/write access patterns. Virtual actors can be automatically persisted and rehydrated, allowing for a more flexible and scalable approach to distributed systems. The runtime handles the lifecycle of these actors, creating them on demand and migrating them across nodes as needed.

#### Microsoft Orleans

Microsoft Orleans introduced the Virtual Actor abstraction, where actors exist perpetually as purely logical entities that always exist, virtually. This innovation solved several distributed systems challenges:

**Automatic Lifecycle Management**: Orleans automatically creates in-memory instances called activations. An actor will not be instantiated if there are no requests pending for it.

**Transparent Distribution**: Orleans provides a virtual "actor space" that allows developers to invoke any actor in the system, whether or not it is present in memory, using indirection that maps from virtual actors to their physical instantiations.

In Orleans:

- Virtual Actors are called Grains. Grains can be found via unique id defined ahead of time (e.g. - email address of the user)
- Grains are accessed through a Silo, which manages each grain's lifecycle and distribution. Unique ids of grains are by silo.

Aside: Orleans is commonly use for Xbox Live multiplayer servers since it allows dynamically scaling up and down based on player activity, with actors representing game sessions, players, and other entities. It has been used in the Halo 4.

#### Cloudflare Durable Objects: JavaScript Virtual Actors

Cloudflare Durable Objects represent a JavaScript implementation of Virtual Actors, fitting neatly into the Actor programming model with perpetual existence where actors are purely logical entities that always exist, virtually.

**Global Distribution**: Cloudflare automatically determines the datacenter each object lives in and can transparently migrate objects between locations as needed.

**Serverless Storage**: Each object has persistent state stored on disk that is private to it, meaning access to storage is fast and the object can maintain a consistent copy of state in memory.

## Modern Language Implementations: A Spectrum

Contemporary programming languages implement OOP concepts along a spectrum from message-passing to modern class-based approaches:

### Objective-C
Objective-C straddles the middle ground between message-passing and modern approaches, having evolved from more message-passing-style messaging in earlier days toward modern approaches for performance and type safety.

```objc
// Common method call syntax
NSString *result = [object methodName:argument];
// Dynamic message invocation. Technically @selector() is a special syntax for a method name as a string.
[object performSelector:@selector(methodName:) withObject:argument];
```

Objective-C also uses common message-passing pattern such as:

- Delegation ([UITableViewDelegate](https://developer.apple.com/documentation/uikit/uitableviewdelegate?language=objc) being a perfect example)
- Proxy Objects (via `forwardingTargetForSelector:` and `NSProxy`), but was deprecated in practice due to ARC and stricter type checking of selectors.

### Ruby

Ruby's `method_missing` provides a mechanism closer to Kay's vision:

```ruby
class DynamicHandler
  def method_missing(method_name, *args)
    # Handle unknown messages dynamically
    puts "Received message: #{method_name} with #{args}"
  end
end
```

## The Path to Microservices Architecture

The evolution from Kay's original OOP vision to modern distributed systems follows a clear trajectory:

**Message-Passing Objects** → **Distributed Actors** → **Microservices**

Modern microservices architecture embodies many of Kay's original principles:

- **Encapsulation**: Each service encapsulates its own state and logic
- **Message Communication**: Services communicate via HTTP/gRPC rather than shared memory  
- **Location Independence**: Services can be deployed anywhere and discovered dynamically
- **Late Binding**: Service composition happens at runtime through service discovery

# Related Topics

- [Alan Kay][alan kay]: Coined the term "object-oriented programming" and envisioned OOP as messaging between distributed entities. [1](https://www.youtube.com/watch?v=cNICGEwmXLU)
- [Smalltalk][smalltalk]: The original implementation of Kay's vision, emphasizing dynamic message processing and extreme late binding.
- C++: A language that popularized OOP toward class hierarchies and static typing instead of dynamic message passing. Along with OOP, C++ popularized strongly typed languages, compile-time polymorphism, and static type checking.
- [Erlang][erlang]: A language that implemented OOP principles in a distributed context, focusing on [reliability][erlang-supervision] and [message passing][erlang-message-passing].
- [Orleans][ms-orleans]: A framework for building distributed applications using the [Virtual Actor][virtual-actors] model, allowing for automatic lifecycle management and transparent distribution. [github](https://github.com/dotnet/orleans)
- [Cloudflare Durable Objects][durable-objects]: A JavaScript implementation of similar to Virtual Actors, providing global distribution and serverless storage.
- [Proto.Actor][proto-actor]: is another implementation of virtual actors in .NET and Go
- [Microservices][microservices]: Modern architecture that embodies OOP principles through encapsulation, message communication, and late binding.
- [Actor Model][actor-model]: A conceptual model for building distributed systems where independent entities communicate through messages, closely aligned with Kay's original vision.
- Casey Muratori's ["The Big OOPs"][the-big-oops] talk has better origins. He's delinination about compile-time class heirarchies is a useful form of OOP.
- Entity Component System (ECS): A different approach to structuring software programs where state is not hidden within objects, but rather shared across components.

[alan kay]: https://en.wikipedia.org/wiki/Alan_Kay
[smalltalk]: https://en.wikipedia.org/wiki/Smalltalk
[erlang]: https://www.erlang.org
[erlang-supervision]: https://erlang.org/documentation/doc-4.9.1/doc/design_principles/sup_princ.html
[erlang-message-passing]: https://www.erlang.org/blog/message-passing/
[ms-orleans]: https://learn.microsoft.com/en-us/dotnet/orleans/overview
[virtual-actors]: https://www.microsoft.com/en-us/research/project/orleans-virtual-actors/
[durable-objects]: https://developers.cloudflare.com/durable-objects/what-are-durable-objects/
[microservices]: https://martinfowler.com/articles/microservices.html
[actor-model]: https://en.wikipedia.org/wiki/Actor_model
[proto-actor]: https://proto.actor/
[the-big-oops]: https://www.youtube.com/watch?v=wo84LFzx5nI
[compile-time-hierarchies]: https://youtu.be/wo84LFzx5nI?si=WlRsWr6-ESWWcBWL&t=665
