# Generative Testing

- date: 2015-01-31
- tags: objective-c, tdd, fox, quickcheck
- url_postfix: .html

--------------------------------------

It's no secret that I've been interested in testing. Most of the [work][Cedar]
[I've][Quick] [done][Nimble] are around example-based testing. While useful,
it's interesting to look at other communities for inspiration. I'm specifically
fascinated in the functional programming community. Generative testing in
particular. It was popularized in the early 2000s by a famous implementation in
Haskell, [QuickCheck][QuickCheck].

In short, generative testing is allows you specify properties your software
should have. Then the testing library *generates* test cases. It's an
alternative path the functional community has taken when it comes to testing.
This becomes evident since testing functional code becomes mostly boilerplate
management:

```clojure
;; Clojure Test
(are [x y] (= x y)
	(add5 5) 10
	(add5 2) 7
	(add5 -5) 0)

;; Alternative (drier) representation
(are [x y] (= (add5 x) y)
	5 10
	2 7
	-5 0)
```

This clojure example shows how functional communities try to remove the
boilerplate common in traditional unit testing libraries. There are no test
method names, assertions separated from the action. It's not [behavior driven
development][BDD], but they share the goal of improving software quality.
Notice how the test data is usually front and foremost in functional
programming.

Generative tests are the next iteration. They are abstraction representations
of tests like the one above:

```clojure
;; clojure.test.check
(prop/for-all [x gen/int]
	(= (add5 x) (+ 5 x)))
```

This reads:

> For all integers **x**, **add5** of **x** should equal **x** added by 5.

In fact, it reads a lot like a proof statement. And in a simplified
form, the generative testing library tries to generate the smallest counter
example.

However, this *isn't* a good property test. It completely duplicates the
possible implementation. Instead, it might be better to write other properties
that result from the implementation:

```clojure
(prop/for-all [x gen/int]
	(= (- (add5 x) x) 5))
```

This reads:

> For all integers **x**, subtracting **x** from the **add5** of **x** should
> always equal 5.

It (arguably) prevents us from rewriting the implementation. Instead, it tries
to state some known truth of the code we're testing. This style of thinking is
definitely not natural to a example-based testers (for me at least). The 3 most
common ways of writing property-based tests are:

- **Describe an inverse relationship using multiple functions.** A good example
  of this is encoding and decoding. A property test of JSON encoding can be
  that ``decode(encode(value)) == value``.
- **Describe a relationship of the inputs to its outputs.** The concatentation
  of two arrays preserves sizes: ``len(a) + len(b) == len(a + b)``.
- **Use an existing implementation.** Use an array to test a circular buffer
  implementation. Or use an existing base64 encoder to test your new faster
  version.

Generative tests shine for exploratory testing where edge cases tend to surface
bugs. But it's not a complete replacement to a traditional test suite. An
example-based test suite can reliably reproduce significant cases: a known
happy-path or a previously discovered bug. Both suites compliment each other
well.

Instead of focusing on ease of writing and maintaining tests, generative
testing focuses on discovering new bugs.

An implementation of QuickCheck is also [particularly fasinating][test.check].
It's a great example of a well-designed functional program. If you're
interested in an implementation for Objective-C and Swift, check out
[Fox][fox].

[Cedar]: https://github.com/pivotal/cedar "Cedar - BDD for Objective-C"
[Quick]: https://github.com/Quick/Quick "Quick - BDD for Swift and Objective-C"
[Nimble]: https://github.com/Nimble/Nimble "Nimble Matcher Library for Swift and Objective-C"
[QuickCheck]: https://hackage.haskell.org/package/QuickCheck
[BDD]: http://dannorth.net/introducing-bdd/
[test.check]: http://reiddraper.com/writing-simple-check/
[Fox]: http://github.com/jeffh/Fox
