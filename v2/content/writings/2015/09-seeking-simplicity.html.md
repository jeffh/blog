+++
title = 'Seeking Simplicity'
date = 2015-05-03
tags = ["Clojure", "Javascript", "Swift"]
url = "2015/09-seeking-simplicity.html"
+++

What is simple?

Rich Hickey makes a good abstract definition, but it can be difficult to
translate to everyday code. I encourage you to
[watch that](http://www.infoq.com/presentations/Simple-Made-Easy) before
returning to this. I'll still be here.

Ok, let's start at that definition. Hickey's simplicity is the **disentangling
of concerns**. It's easy to convolute from what seems like straight-forward
statement.

For example, a high-level example would be what domain-driven design proponents
argue for. Separate solving your problem domain from the machinery that you use
to solve it. Separate How from What or When.

Using inversion of control or dependency injection is simpler than creating new
objects when it's convenient. It's separating object creation from objects that
do work. This allows interchangeable collaborators and encourage reused.

This notion of simple _can be more difficult_. That sounds counter-intuitive at
first. Simplicity may be more code. It may require more conceptual knowledge
before modifying the code. But those are excuses for complexity. We could say we
get less code by:

- creating objects ad-hoc vs dependency injection.
- hard-coding instead of using abstractions.
- using arbitrary memory locations for code or shared lookups.

For example, `if` and `for` are two separate concepts stemming from `goto`. But
we don't complain about how `goto`s lead to to more complex code. But `if` and
`for` aren't difficult concepts for us to grasp because we're familiar with
concepts from past experience.

Simple designs also provide obvious extension points for expanding
functionality. It can be jarring because the composition is the solution instead
of a direct, hard-coded fashion. A personal example that has surfaced many times
is input validation. It is
[sufficiently](https://github.com/cloudfoundry/cloud_controller_ng/blob/54b0778cbffe808288957aa310ec98649082e973/lib/services/service_brokers/v2/response_parser.rb#L12-L134)
[complex](/2014/05-parsing-json-in-objective-c-part-1.html)
[enough](/2014/06-parsing-json-in-objective-c-part-2.html) that just providing
friendly names and a DSL may not suffice for domain rules.

Rich warns about confusing separation from compartmentalization. It's easy to
mix up moving code into smaller modules as separating concerns. Even inserting
an interface between modules may not be simple enough. Instead, we must have
code empathy to understand how much each module knows about one another:

- Does a module have an implicit ordering of calls for a protocol?
- Do all collaborators need to know about this ordering?
- Does a collaborator expect specific side effects?
- Do collaborators share state?
- Does a object know about it's collaborator's collaborators?

It's a perfect example of compartmentalization are typical usages of Ruby's
`include` for modules. It is only a method of splitting a class' code across
multiple files instead of splitting its responsibilities into separate objects.

## JavaScript

Unsuprisingly, this simplicity is what makes Clojure (and other LISPs)
compelling. LISPs are simpler than most other progamming languages.

Let's compare by trying describe the syntax of JavaScript (without pulling in
compiler theory). If we're explain what's the meaning of every syntactic feature
of JavaScript, it would be something like this:

- JS file contains many statements:
  - statements separated by `;` or blocks `{` `}`
- Expressions may be one of the following:
  - `( expr )` for a parenthesized expression.
  - `123` are numbers (floats).
  - `"string"`, `'string'` are strings.
  - `/reg-exp/` are regular expressions.
  - `null` is the null type.
  - `true` and `false` are boolean values.
  - `bar()` is a function call.
  - `new Object()` creates a new object.
  - `delete obj.field` unassigns the value from the object's field member.
  - `[expr1, expr2, ...]` are array literals.
  - `{name1: expr1}` are object literals.
  - `foo = expr` is variable assignment. Variable may or may not exist.
  - `obj.method` is the function of the object's method, but does not bind `obj`
    to `this`.
  - `expr1 op expr2` is an two-arg operator expression for:
    - `||`, `&&`, `<`, `<=`, `>`, `>=`, `==`, `===`, `|`, `&`, `^`, `~`, `+`,
      `-`, `*`, `/`, `<<`, `>>`, `<<<`, `>>>`
  - `op expr` is an unary operator for:
    - `-`, `!`
  - `function foo(bar, baz...) { statements }` is a function definition.
    Definitions are implicitly above other statements within the same list of
    statements.
  - `function(bar, baz...) { statements }` is an annoymous function
  - `foo.bar` is accessing the `bar` property of object `foo`
  - `foo['bar']` is accessing the `bar` property of object `foo`. Does not bind
    `this`.
  - `foo.bar()` is a method invocation of `bar` on object `foo`.
  - `expr ? expr : expr` is an inlined if-else statement.
  - `this` is the local execution context for a function.
  - `typeof variable` for getting the data type of the variable.
  - `object instanceof class` for checking object type.
  - Assignment Operators: `+=`, `-=`, `*=`, `/=`, `<<=`, `>>=`, `~=`, `&=`,
    `^=`, `|=`, `++`, `--`, `<<<=`, `>>>=`
- Statements may be one of the following:
  - `with(expr) { statements }` uses expr as the local context for statements.
  - `if (cond) { statements }` is an if statement
    - Which may have an arbitrary number of `else if` clause.
    - Which may end in an `else` clause.
  - `for (stmt; cond; stmt) { statements }` is a for-loop
  - `for (variable in object) { statments }` is a for-each-like loop
  - `try { statments } catch (variable) { statements }` for exception catching
  - `throw err` to throw exceptions.
  - `while (expr) { statements }` is a while loop
  - `var foo, bar` is a variable definition
  - `break` breaks loop control flow
  - `continue` breaks current iteration of loop control flow
  - `return expr` returns an expression and exits current function
  - Any expression

This doesn't fully cover the rules of having a program understand JavaScript at
a syntactic level:

- Order of operations for operators (eg - `<=` vs `||`)
- Optional characters in the syntax (eg - `if (cond) foo;`)
- Error recovery (automatic semicolon insertion).

This isn't covering what's inside a standard library of JavaScript (node,
browers, etc). Libraries are not technically part of the language itself.

And JavaScript is argubly one of the easier languages to write up these rules in
comparison to Python, Java, or C.

Now let's look at how simple Clojure (a LISP) is in comparison:

- A clojure file consists of many expressions
- Expressions are data literals
  - `(expr1 expr2)` Lists with any number of expressions
  - `[expr1 expr2]` Vectors with any number of expressions
  - `{expr-key expr-value}` Maps/Hashes with any number of expressions as
    key-value pairs
  - `#{expr1 expr2}` Sets with any number of expressions
  - `123` Numbers
  - `"foo"` Strings
  - `#"foo"` Regular Expressions
  - `\c` Characters
  - `foo` Symbols (think variable names). Symbols are namespaced.
- Semantically
  - `(expr1 arg1 arg2)` means to call
    - a function named `expr1` with 2 arguments
    - a macro named `expr1` with 2 arguments (macros are special functions that
      hook into the compiler)
  - Symbols evaluate to values
- Clojure has special forms. They look like function invocations, but have
  special meaning in clojure
  - `(def sym init)` defines a variable `sym` to value `init`. Can optionally
    store metadata.
  - `(if test then else)` is an if statement. `then` and `else` are expressions
    that `if` returns.
  - `(do expr1 expr2...)` is a way to evaluate multiple expressions, returning
    only the last one.
  - `(let [var value...] expr1 expr2...)` defines local variables for the
    expressions. `let` returns the last expression. Allow destructuring.
  - `(quote form)` escapes `form`. So you can create a list literal or symbol
    that isn't evaluated. Alias is `'form`
  - `(var sym)` refers to Var which is like a pointer to a value that a symbol
    is associated with.
  - `(fn name [args...] exprs..)` is a function definition. Args can be
    destructured.
  - `(loop [var value...] exprs...)` is a `let`-like expression that allows
    looping with `recur`.
  - `(recur exprs...)` jumps back to the nearest outer `loop` expression with
    expression as the new variable values.
  - `(throw expr)` throws an exception
  - `(try expr (catch expr)... (finally expr))` try expression. catch and
    finally are optional
  - `(monitor-enter x)` `(monitor-exit x)` low-level locking primitives. Used
    only for clojure core.
  - `(.method instance arg)` java interop to do method invocation.
  - `(new ClassName)` java interop to create new instance
  - `(set! field expr)` java interop to set a field

This is relatively comprehensive description of Clojure's syntax. Most of the
special forms are no different from normal function invocations. Features
normally found in the language are delegated to the standard library similar to
the function invocation format. An example is the `or` operator. `or` is the
composition of `let` and `if`:

```clojure
;; Clojure

;; defmacro is part of stdlib, that is an alias defining a named function with
;; metadata indicating its a macro
(defmacro or
  ([] nil)    ; zero args is always false
  ([x] x)     ; one arg is simply x
  ([x & next] ; more args are nested or calls
      `(let [or# ~x]
         (if or# or# (or ~@next)))))
```

Clojure avoids complexity common in other languages:

- No special order of operations. The prefix-notation dictates the order of
  execution.
- Clojure treats `,` as whitespace. Only whitespace after the first whitespace
  character are optional.
- Macros are just functions whose arguments are lazily evaluated. This provides
  meta programming capabilities if needed while reducing the size of the meta
  programming API.

Both Clojure and JavaScript are trying to solve a problem of expressing
programs. But one seems to do it with fewer internal components.

It's worth noting that Clojure could be simplier. Rich has made tradeoffs to
leverage the JVM. State management is explicit, but not simple. Even something
as small as ordered argument parameters for functions is a tradeoff in concision
over potential readability.

But Clojure **isn't easy**. It's a departure from the C-family of languages.
Clojure has large (Jvava) stacktraces. It's common to hear developers complain
about the number of parentheses. But it's analogous to multi-responsibility
classes in OO. Large objects can be an entirely separate article. Easy is
something we can overcome. Complexity we can only paint over.

The beginner's mindset can reveal what we internalize as complexity. I was
always fascinated why first-time developers had difficulty grasping
object-oriented programming.
[Ben Orenstein](http://blog.cognitect.com/cognicast/075) observed the same
troubles: new developers usually write in a functional style. Beginners can
easily learn functional programming, followed by object oriented programming.
Yet, learning object oriented programming first makes learning functional
programming more difficult.

The question to ask is: how can one express the problem with fewer internal
components?

## Value Objects

This an example I've [looked into](https://github.com/jeffh/JKVValue), but there
are definitely other patterns in software worth looking at.

In the Object Oriented Programming space, this is the basis of good design. And
to make this clear ahead of time: **values objects are an improvement**. But the
way object-oriented languages employ them could be better.

Why? Traditional value objects look a lot like this:

```swift
// Swift

// object-y value object
class Person {
    var firstName: String, lastName: String
    init(firstName: String, lastName: String) {
        self.firstName = firstName
        self.lastName = lastName
    }
}

// better value object
struct Person {
    let firstName: String, lastName: String
    init(firstName: String, lastName: String) {
        self.firstName = firstName
        self.lastName = lastName
    }
}
```

What did we just do by doing this instead of a dictionary?

- We excluded other libraries from using our value object unless they explicitly
  depend on our library.
- We must manually serialize this value object - one for each new value object
  we create.
- We must reimplement the behavior of value object. Behaviors like comparison,
  pretty-printing, copying, etc.

Essentially, we start building our API for our value objects from scratch. A
classic computer science data structure avoids most of those problems.

Many languages have problems for the built-in data structures: Ruby's
inconsistent missing key handling vs objects, or verbose syntax. While both
aren't perfect, one is more general than the other.

Ideally, value objects should conform to a generalized access pattern. Lists,
arrays and dictionaries conform to some common access patterns: Iterators,
Sequences, Mapping Functions, Printability.

# Wrapping Up

It's never-ending quest to reduce complexity. Hopefully, I've laid out some
things worth pondering. Some other patterns that can get a similar critical eye:

- Interface / Protocol design: Fewer or more methods are better? When there are
  too few methods?
- OOP: How many objects should we have in a system? Should they be dynamically
  reallocating or a stable system?
- Concurrency: Can we use the same patterns in single-threaded systems and
  multi-threaded ones?
- Distributed Systems: Why don't we use the same patterns for distributed
  systems and single-system designs?
- Persistence: Why do we seek ORMs over the repository pattern?

The goal is to be clear and concise, but it's easy to be either verbose or
terse.
