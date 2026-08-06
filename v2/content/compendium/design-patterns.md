+++
title = 'Design Patterns'
date = 2025-07-26T19:16:24-07:00
draft = true
+++

Design Patterns are often misunderstood. Design patterns are often misunderstood to be about best practices, when in actuality they're about putting names to common code patterns seen in codebases. For example, a singleton is a well-known pattern that lots of codebases have, which are essentially global variables / states, but that doesn't necessarily mean it is good. It just means that we know how to name the pattern in one word: a singleton.

The original book named patterns that were found in the the code they reviewed. That's all.

Whether or not they are good is independent of naming those patterns. Some pertinent languages will provide more convenient constructs so that these patterns will become nearly invisible, but they do exist and they're useful for engineers to communicate with each other about patterns and code.

I'm gonna do a simplified attempt and explain the purposes of each pattern. You can obviously look at each individual pattern implementation online.


# Factory Method

Converts object construction to be a function for some similar standard procedure, as opposed to a language-specific contract that we `new` up.

# Abstract Factory Method

Same problem that the Factory Method pattern solves, but for Factories.

# Builder

A safer way to have composable object construction by separating the process of configuring fields and object construct.

# Decorator

A process to dynamically modify a method or function by wrapping it.

# Adapter

An implementation that bridges two interfaces.

# Strategy

An interface over a set of algorithms solving a similar problem.

# Observer

The original PUB/SUB implementation in code. Callbacks is another name for this.

# Visitor

This is an Observer with an enumerated type of each kind of input to process.

# Command

A data representation of potential mutation and its input parameters. Optionally can be useful to attach undo to as well.

# Singleton

A global variable that has shares state in various parts of the program. There is a guarantee that its constructor is called exactly once before its first use.

# Iterator

An interface to walk through a data structure's elements. The goal is to make sure the caller's code doesn't need to change if the data structure does.

# Proxy

An object that passes through most of its implementation to another object. This is the composition version of inheritance.

# State

A state machine whose transitions are part of an interface. Each state is its own implementation.
