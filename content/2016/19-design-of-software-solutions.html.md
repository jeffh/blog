# Design of Software Solutions

- date: 2016-04-30
- url_postfix: .html

----------

What's the best way to model a solution? In software, there's several common ways of building solutions that solve specific problems. It's worth trying to identify their characteristics and the tradeoffs they make.

## Architect the Software After the Current Problem

The easiest is way to model software. There's no need to take in consideration of future solutions the user made want.

Sometimes this is what you need. If you're writing a throw-away program, the fastest possible way to implement it is to codify for the exact problem you're trying to solve. An example are most shell scripts. They tend to not be abstracted and usually automate a very specific task.

It's a bit unfortunate that Object-Oriented Programming is generally taught as this way:

```python
class Vehicle:
  def gas_consumed(self, velocity):
    return velocity

class Car(Vehicle):
  pass # inherits from Vehicle
  
class Truck(Vehicle):
  def gas_consumed(self, velocity):
    return velocity * 2
```

It's a useful way to describe how classes work by using a mental schema that most people have in their heads. But this is more inflexible to actually adapt to changing requirements that software users always want.

For the example above, what if we want to model hybrid vehicles? Is it abstract like the `Vehicle` class? If it's a concrete vehicle, then we need to make new classes for each kind of concrete vehicle we need (eg - `HybridCar` and `HybridTruck`).

A feature like [multiple inheritance][inheritance] can solve this problem to some degree, but it lacks the ability to remove features. For example, what if the `Vehicle` assumed that a car needs to be powered by gasoline? Our hybrid vehicle becomes harder to introduce.

This is same for shell scripts – most scripts will hardcode values and make assumptions to its execution environment.

These kinds of programs are cheaper to produce, but more expensive to change.

[inheritance]: https://en.wikipedia.org/wiki/Multiple_inheritance

## Architect the Software After the Hardware

Another way to model software comes from its past, when computers were slower and more expensive. This design of software embraces the hardware it executes on – capable of efficiently executing on the platform. Embedded software, drivers, and video games tend to lean towards this model because of their performance sensitivity.

Software tends to optimize for the efficiencies of computers. After algorithmic complexity, memory utilization ratio is common to measure. That is, how much of each block of memory fetched is utilized by the CPU. A nice (but a bit ranty) talk about this is [Mike Acton's Data Oriented Design][Data-Oriented-Design] talk.

A more readily visible pattern is [columnar storage][columnar] over tabular storage patterns.

```python
# (Of course, python's memory structure isn't a direct mapping
# as a language like c/c++, but we can pretend)

# Tabular form, more conventional object-oriented pattern
class Vehicle:
  def __init__(self, name, mpg, doors, miles, top_speed):
    self.name = name
    self.mpg = mpg
    self.doors = doors
    self.top_speed
    self.miles = miles
    # ... more fields ...
  
vehicles = [Vehicle(...), Vehicle(...)]
total_distance = 0
for vehicle in vehicles:
  total_distance += vehicle.mpg * vehicle.miles

# Columnar form, only storage values that are needed together
miles = [(mpg1, miles1), (mpg2, mile2), ...]
total_distance = 0
for mpg, miles in vehicles:
  total_distance += mpg * miles
```

Since the CPU fetches memory in chunks, we waste some of the memory fetch to the extra fields each vehicle has. This means more memory fetches. Looking at a [latency chart][latency chart], it's easy to imagine many of these extra fetches adding up to a noticable additional time.

No doubt performance-centric designs sacrifice hardware abstractions. Most of this software couples to the exact hardware it executes on: a computer chip; or the kind of CPU architecture. Changing to another platform may waste all the effort put in to turning the execution performance.

These systems are also more expensive to build. They cater to the needs of the computer and optimize less for the readability of the programmer. A logical extreme to being performance-centric is to manually manage memory (probably using a custom memory allocator). And while it's more efficient to execute on the machine, it comes at the cost of future flexibility.

[Data-Oriented-Design]: https://www.youtube.com/watch?v=rX0ItVEVjHc

[columnar]: https://en.wikipedia.org/wiki/Column-oriented_DBMS

[latency chart]: https://gist.github.com/jboner/2841832

## Architect the Software After a Composable, Isolated Abstraction

This is harder to describe.

Modeling software toward small abstractions avoids having the directly model either end. Instead, it's road less traveled. Mostly because it's a chicken-egg problem: a good abstraction requires a in-depth knowledge of the problem at hand; but the best way to know the problem well is to try and solve it multiple times.

A great example of an abstraction is how many HTTP interfaces are defined: [rack][rack], [wsgi][wsgi], [go/http's Handler][go-http].  They naturally provide the notion of middleware. Middleware can solve parts of what is needed to for an HTTP request:

- Divide work up by request (eg - URI routes, HTTP method, etc.)
- Perform authorization / authentication
- Automatically parse and emit specific data encodings (eg - JSON, XML, etc.)

While middleware is generally focused toward solving HTTP, there's no reason why you can't use it to also solve your business domain.

The goal for composable abstractions is to maximize flexibility. They can suffer performance if it's not considered. But more importantly, these little composable pieces are more complicated to understand at first. There's a rampup cost for newcomers. That's because a highly composable abstraction is a domain-specific language that needs to be learned. They're overkill for small problems.

[rack]: http://rack.github.io

[wsgi]: http://wsgi.readthedocs.io/en/latest/

[go-http]: https://golang.org/pkg/net/http/#Handler

## Disclaimers Apply, see Fine Print

Of course it's all a gradient. Although large-scale software tends to be some of each, in different proportions. Although larger systems can forego composable abstractions due to the number of developers involved.
