+++
title = 'Algebraic Data Types: Product & Sum Types'
date = 2025-08-17T13:22:03-07:00
+++

ADTs is a fancy term for a type composed from other types. There are two kinds of Algebraic Data Types.

## Product Types

Product types are structs and tuples, which contain a sequence of types.

Most programming languages have product types, so ADTs are often seen as shorthand for sum types, but that’s technically inaccurate.

## Sum Types

Sum types are unions plus enums. They contain one of the specified underlying types:

```c
// c
union Number {
  int integer;
  float decimal;
};

union Number num;
num.integer = 2;
// below overwrites the above because they share the same space in memory
num.decimal = 2.5;
```

Note how unions allow different types to be used like an enum.

Non-C programming languages typically require type checks for verification before use, whereas unions enable sharing the same memory mutation space. Programming languages with sum types usually unshackle enums from a single type:

```rust
// rust
enum Number {
  Integer(i32),
  Decimal(f32),
}

fn add1(n: Number) -> Number {
  match n {
    Integer(i) => Integer(i+1),
    Decimal(f) => Decimal(f+1),
  }
}

let num = add1(Number::Integer(2));
```

The above code requires explicit handling of each possible type the `Number` sum type could be. Sum types reduce the state space by having relevant types apply in a certain state. Monads commonly use sum types in their implementation (like Optional or Either).

Sum types aren’t required to be memory efficient like unions, but they can be implemented using an integer and a union. Using all the memory you read indicates efficient programs.

Sum types’ tradeoffs are similar to enumerations, depending on whether they are open or closed enums.

Open enumerations anticipate future values. Go uses exclusively open enumerations:

```go
// go
type Color uint

const (
  ColorRed Color = iota // iota makes ColorRed=1, ColorGreen=2...
  ColorGreen
  ColorBlue
)

func colorText(c Color) string {
  switch c {
    case ColorRed:
      return "red"
    case ColorGreen:
      return "green"
    case ColorBlue:
      return "blue"
    default: // this is required to be exhaustive
  }
}
```

Open enumerations mean “more values may be added in the future, and it is impossible to be exhaustive without an else case”. Switch cases need to handle the “else” case to maximize the enum’s public API capability because existing consumers will need to handle this case if the API provider adds a type.

Enum sum types are typically closed enumerations. The language enforces exhaustive checks, providing useful developer ergonomics when adding a new type to the sum type.

Closed enums are better for app developers, while open enums for library writers minimizing breaking changes.

## Footnotes

1. Is it possible to have sum types in go using type checking using `any`. Although you don’t get as much memory efficiency benefits since `any` is a pointer to the underlying data.
