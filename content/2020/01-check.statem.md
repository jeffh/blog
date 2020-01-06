# check.statem: Generating Test Programs

- date: 2020-1-5
- url_postfix: .html

--------------------------------

One of the most interesting parts of generative testing (aka [QuickCheck][]).
Is state machine testing. The original purpose I built [Fox][] was to explore
state machine testing. In particular, the talk from John Hughes video was
inspirational to exploring this further:

<p>
<iframe class="center lit" width="560" height="315"
src="https://www.youtube-nocookie.com/embed/zi0rHwfiX1Q" frameborder="0"
allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
allowfullscreen></iframe>
</p>

In short, John makes a case: dynamically generating state machines to detect
errors that is more effective and economical than traditional example based
tests. There's lots of work managing example based tests that can be better
solved with generative testing.

While I doubt John wants to completely replace example-based tests, it seems
like that example-based tests should be relegated to smaller roles in a test
suite:

 - Ensuring no regression of a bug occurs again, or ensuring specific
   happy-path case is *always* tested.
 - Testing pure functions (arguably, normal generative testing can help too)

With the most common argument against generating testing comes with the
complexity of writing generative tests, or more specifically:

>   Isn't writing a generative test equivalent to implementing the code I'm testing?

And that logically feels true. What's the benefit of implementing a state
machine that basically implements the same behavior again?

John's example in the video attempts to show the difference: that a production
implementation has many complected details that a native implementation
ignores.  And if your state machine is implemented at a higher-level, that's
still simpler than the subject under test<sup><a href="#1" name="b1">1</a></sup>.

Another way to look at this argument is how proof checking programming
languages defend themselves. Proof checking languages receive similar push back
– that if you're specifying enough detail to proof your program correctness,
isn't that effectively the same as implementing it in a programming language
that can execute it as well? Leslie Lamport states his case for [TLA+][]:

> I do know, for most computer programmers and engineers, TLA+ provides a new
> way of thinking about what they do. And this makes them better programmers
> and engineers, even in cases when TLA+ language and tools are not useful.

Furthermore, Brannon Batson (an Intel Engineer) says:

> The hard part of learning to write TLA+ specs is learning to think abstractly
> about the system. With experience, engineers learn how to do it. Being able
> to think abstractly improves their design process.

Doesn't that sound a bit like what [TDD][] proponents argue? That writing
(example-based) specifications helps drive out the design? Similar arguments
come from strongly-typed language enthusiasts as well<sup><a href="#2" name="b2">2</a></sup>.

Generative state machine testing is a (significantly) weaker version of a proof
checker. It doesn't guarantee incorrect values, only probabilistically.

## Introducing check.statem

Unfortunately, I don't do any work in Erlang, so I've been working on writing a
state machine generator based on the papers & talks of John Hughes. It's called
[check.statem][].

It's possible to built a basic state machine, one that has little to no
dependencies on another transition:

```clojure
(gen/vector (gen/one-of gen-puts gen-gets))
```

But it gets more complicated when transitions shares dependencies. That's
what [check.statem][] attempts to support.

check.statem is built on top of [test.check][] and currently only provides
two features: defining state machines and a generator that produces programs
from a state machine.

Like all other generators in test.check, check.statem will shrink values to the
"smallest" possible value. This means generated programs shrink in size (number
of statements) and parameters (associated data for each statement), all while
conforming to the model state machine.

Unlike traditional state machines, there's several bits of information to
encode on a per transition basis:

- When is the transition applicable to use, given the current state of the model?
- What is associated data for the transition, potentially using the current state of the model?
- What is the assertion after each transition is followed?

From each of those requirements, then check.statem can properly generate
programs. And it can determine if removing a statement from a generated program
is valid operation (or breaks the constraints of the model state machine).

```clojure
;; test.check requires elided
(require '[net.jeffhui.check.statem :refer [defstatem cmd-seq run-cmds]])

;; defining a state machine
(defstatem key-value-statem ;; name of the state machine
  [mstate] ;; the internal model state -- starts as nil
  ;; define transitions
  (:put ;; name of the transition
    (args [] [gen/keyword gen/any-printable-equatable]) ;; associated data generators for this transition
    (advance [_ [_ k value]] ;; next-mstate given the generated data and the current mstate
      (assoc mstate k value)))
  (:get
     ;; precondition for this transition to be utilized (here: we must have stored something)
     (assume [] (pos? (count mstate)))
     (args [] [(gen/elements (keys mstate))]) ;; generate values from model state
     ;; postcondition assertion: check model state against the return value of the subject-under-test
     ;; implementation.
     (verify [_ [_ k] return-value]
        (= (mstate k) return-value))))


;; define a property to test: `kv-interpreter` is a constructor of the subject
;;                            under test
;;
;; `kv-interpreter` returns a function that accepts a transition and returns
;;  the value that the SUT would return for the model state machine to verify.
;;
;;  commands are in the vector format:
;;
;;   [command-name-kw generated-args...]
;;     for example:
;;       [:put :f23]
;;       [:get 3]
;;
(defspec kv-spec 100
  (for-all
   [cmds (cmd-seq key-value-statem)]
   (:ok? (run-cmds key-value-statem cmds (kv-interpreter (atom []))))))
```

It's still relatively new (only snapshots versions are on
[Clojars][check.statem.clojars] right now), but I've been writing some code in
an example project to play around an it's been enlightening from first-hand
experience. The kind of signal-to-noise that John mentions happens on a regular
basis that still surprises (and delights) me: "There's no way this is the
smallest test case."

What's left until 1.0.0 of check.statem? It's mostly solidifying debugging and
usability of the API.

- Currently check.statem could provide better debugging information when it
  does find a failing test case
- And defining state machines can be complex. While the current way is
  serviceable, there should be a better approach.
- More testing to verify it's shrinking behavior

## Future Work

There's some interesting personal experiences about using generative state
machine testing that should be written up at some point.

In terms of features for check.statem, the Erlang QuickCheck does have some
really nice features when in comes to parallel testing that I would want to
implement at some point in the future.

[QuickCheck]: https://hackage.haskell.org/package/QuickCheck
[Fox]: http://github.com/jeffh/Fox
[TLA+]: http://lamport.azurewebsites.net/video/intro.html
[TDD]: https://en.wikipedia.org/wiki/Test-driven_development
[check.statem]: https://github.com/jeffh/check.statem
[test.check]: https://github.com/clojure/test.check
[check.statem.clojars]: https://clojars.org/net.jeffhui/check.statem

<ol class="footnotes">
<li class="footnote" id="1">
    To specify the behavior at a higher level makes a
    C-like quickcheck less valuable than a QuickCheck implemented in a functional
    language. <a href="#b1" class="back">&larrhk;</a>
</li>
<li class="footnote" id="2">
    Both positions seem a bit idealistic, but they have
    some kernel of truth. Anything that forces you to deviate from your normal
    style of thinking will typically make you stop and consider more
    perspectives.<a href="#b2" class="back">&larrhk;</a>
</li>
</ol>
