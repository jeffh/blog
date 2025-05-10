+++
title = 'Monads: Are they worth it?'
date = 2025-05-10T12:59:43-07:00
draft = true
+++


Episode 1 · Promises are Epitome

Monads are interfaces for sequencing behaviors related to a data type.

Monads are similar to Unix pipes. They transform input and return the same output type. While pipes describe the function, Monads describe the data type flowing through pipes.

Let’s look at pseudocode defining a monad:

```java
// Java: one of the best languages for defining interfaces...
interface Monad<M, T> {
  // Return is a class method: static isn't legal java
  static Monad<M, T> Return(value T)
  Monad<M, U> Bind<U>(f Function<T, U>) // f = func(T) -> U
}
```

We define the Monad as a generic interface. _M_ is the data type implementing the monad interface and _T_ is the input type for pipeline functions. _M_ is the output value and _T_ is the input type. In the simplest case, both can be the same type, like `Text` in Unix pipes.

_Return_ is an alias to a constructor for _M_. We could name it `constructor` or `new`, but I’ll use `create` to avoid confusion since it usually indicates function results. Then, there’s `bind,` represented by `>>=` in Haskell, but let’s use the `then` method in promises. The `then` method is the pipelining operation expressed through our two generic types. We start with self _M_ as our input value and our pipeline function _f_ that translates the _T_ that M returns a new Monad instance with value _U_. If we rename the methods, we get:

```java
interface Monad<M, T> {
  static Monad<M, T> create(value T) // was Return
  Monad<M, U> then<U>(f Function<T, U>) // was Bind
}
```

In addition to this interface, Monads must conform to behavioral test cases known as Monad Laws:

1. (Left Identity) Calling `create` and `then` is equivalent to calling `f(x)`.
2. (Right Identity) `create` is an identity function.
3. (Associativity) `then` calls are associative, so applying _f_ and _g_ to _x_ is the same regardless of the ordering of the monads’ `then` methods.

That’s a monad. Let’s implement a basic `Optional` type as an example. The TL;DR of optionals: they are a type-safe way of expressing null-checks. I’ll show the code to conform to the monad interface. The constructor returns a non-empty value. Our bind calls the function only if it isn’t empty; otherwise, it propagates the null state.

```java
 class Optional<T> implements Monad<Optional, T> {
  private isNull boolean;
  private value T;
  
  static Monad<Optional, T> create(v T) {
    this.isNull = false;
    this.value = v;
    return this;
  }

  Monad<Optional, T> then<U>(f Function<T, U>) {
    if (this.isNull) {
      Monad<Optional, T> empty = new Monad<Optional, T>();
      empty.isNull = true;
      return empty;
    }
    return Optional.create(f.apply(this.value));
  }

  // ...
}
```

Our monad constructor assumes a non-null value, but we can create a null-version to short-circuit chained behavior. Now we can chain operations without manually checking for null:

```java
// making an optional from nothing
Monad<Response> makeRequest() {
    Response res = doRequest(...);
    Optional<ResponseBody> value;
    if (res.isStatusOK()) {
        value = Optional.create(res);
    } else {
        value = new Optional();
        value.isNull = true;
    }
    return value;
}

// continuing using an optional
Optional<ResponseBody> body = makeRequest().then((value) -> {
  return value.getResponseBody();
});
```

Common monad implementations are:

- Promises → `Monad<Promise, T>`
- Futures → `Monad<Future, T>`
- Signals → `Monad<Signal, T>`
- Arrays → `Monad<Array<T>, Array<T>>`

For Arrays, the `Then` method is typically known as `flatmap`. They demonstrate no need for separation between the wrapping and underlying type (sorry burrito lovers).

## Implications

Structuring a type as a Monad allows flexible composition while maintaining type safety. Monads allow a type to have regular code between `then` transformations. Monadic computations transform between _M_ and _T_.

Like any abstraction, there are compromises, mostly in syntactic complexity. JavaScript users remember [callback hell](http://callbackhell.com/) with promises. To address this, JavaScript added async/await.

Is this useful? Yes. A monad is a simple way to have a highly composable DSL, but composability doesn’t always make a great public API. Many programming structures have a sequential, compositional structure. Conforming to Monad proves shared characteristics of various concepts, like esoteric programming languages implementing another [Turing Complete language](https://esolangs.org/wiki/Brainfuck) to prove their own Turing Completeness.

Monads demonstrate the tradeoff of abstractions. They help identify similarities across disparate concepts. They’re conceptually elegant, but a hassle to use in code. Even Haskell has [special syntax](https://en.wikibooks.org/wiki/Haskell/do_notation) for Monads. They can generate a lot of garbage memory without language-level optimizations.

Coming from functional programming, Monads assume immutability, which is harder to implement in mutable languages. Mutability can also inhibit potential memory usage increases.

While Monads allow composition of type _T_, they don’t enable composability with the Monadic types themselves. That’s for Monad Transformers.

## Footnotes

1. Java is one of the popular languages that can express Monads well through types. I could use Haskell, but you’d have to learn it.
2. Monads as burritos are an imperfect analogy because the types M and T can be the same.

## Related

- RAII (Resource Acquisition Is Initialization) creates “sandwich code” around customizable behavior, like Python’s `with` statement.
- Abstraction is the art of separating intent from implementation.
