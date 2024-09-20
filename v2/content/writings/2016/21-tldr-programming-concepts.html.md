+++
title = 'TLDR Programming Concepts'
date = 2016-06-30
url = "2016/21-tldr-programming-concepts.html"
tags = ["Concepts"]
+++

Trying to concisely describe concepts is an interesting exercise. The ideal goal
is to build upon existing concepts, but as you add more concepts you run the
risk of being inconsistent.

So with at most two sentences, I present a list of common programming concepts.
This goes without warning that lossy compression is inevitable.

- **Data**: Ones and zeros.
- **Values**: Meaningful data.
- **Types / Encodings**: Interpretations of values.
- **State**: A value that changes over time. Usually also considered a Value.
- **Variables**: Names for values over time.
- **Collections**: A value that's a a group of values of same type.
- **Structs**: A value that's a group of values with possibly differing types.
- **Classes**: Structs with functions that have itself as the first argument.
- **Inheritance**: A concise way to implement a class by referring to part of
  its implementation from one class.
- **Multiple Inheritance**: A class that inherits from multiple other classes.
- **Extensions**: Adding methods to a previously defined type.
- **Mixins**: Adding (Multiple) Inheritance to a previously defined type.
- **Interface / Protocols**: Inheritance of a class that has only functions that
  should be implemented by the class that inherits it.
- **Traits**: Interfaces that may have function implementations.
- **Generics**: Treating a type as a variable. Allows algorithms independent of
  specific types.
- **Type Classes**: Generic Interfaces.
- **Monad**: An interface defining the expected behavior for `map`.
- **Functor**: An interface defining the expected behavior for `apply`.
- **Pointers**: A value that indicates where to find another value. An home
  address is a pointer to a home.
- **Big-O Notation**: A method to estimate the number of main-memory operations
- **Slice**: A value that is a pointer and length into an existing collection
- **Value Objects**: An struct / class with equality and hashCode semantics.
- **Object-Oriented Programming**: The concept of classes talking to each other
  using value objects.
- **Procedure**: A sequence of operations to execute. Most programming languages
  mean procedure when they say function.
- **Function**: Vaguely defined / blurred by current norms. See Procedure.
- **Pure Function**: A procedure that returns the same output for the same
  inputs.
- **Side Effects**: Any observable state that occurs besides a return value.
- **Functional Programming**: The practice of using less state and more pure
  functions.
- **Code**: A value that is a series of operations
- **AST (Abstract Syntax Tree)**: Hierarchy of typed code
- **Program**: A collection of code that a computer that can execute.
- **Compiler**: Program that take code and produce programs.
- **Interpreter**: A program that executes code without producing a program.
- **Emulator**: A program that mimics the behavior of hardware.
- **Virtual Machine**: A computer emulator where the hardware may not actually
  exist (eg - Java Virtual Machine).
- **Static**: Known at compile-time.
- **Dynamic**: Known at execution-time.
- **Type Checker**: A program that validates what types flowing through your
  code.
- **Type Inference**: A compiler or interpreter feature can that deduce types
  without always explicitly specifying it in code.
- **Optimization**: Writing code for the computer first, instead of humans.
- **Performance**: Turning memory operations for lower frequency, and higher
  throughput.
- **Reference Counting**: Counting number of owners of a piece of memory to know
  when to free it.
- **Garbage Collection**: An embedded program that frees another program's
  memory that is no longer being used.
- **Reflection**: Code that can inspect and/or modify itself as it's executing.
- **Macros**: An operation that can be translated to a sequence of operations
  before program execution.
- **JIT (Just-In-Time) Compilation**: A feature of interpreters or emulators
  that compiles code during its execution.

---

The last concept pushes the limits of definitions this concise. Some interesting
implications result from these definitions:

- How would you describe a library in at most two sentences?
  - Does it match with conventional definitions of libraries in interpreted
    languages?
  - Does it match with conventional definitions of libraries in compiled
    languages?
- How would you describe a plugin?
  - How does it differ from library?
- Is the `assert` replacement in [pytest](http://pytest.org/latest/) a macro?
- Is Clojure a compiler or intepreter in these definitions?
  - Clojure code [always compiles](http://clojure.org/reference/evaluation) to
    bytecode before executing (eg - in a REPL)
  - Clojure code can be compiled ahead-of-time into a jar
- Is a Python an Interpreter or Compiler in these definitions?
  - It produces bytecode to disk, before running it

Suggestions for more concise definitions or comments, just
[tweet me](https://twitter.com/jeffhui).
