# Software as Bridges

- date: 2015-06-29
- url_postfix: .html

---------------------------------------------------

Software is always challenging to explain to non-engineers and having a metaphor is valuable to explain complex concepts. Bridges happen to be a good analogy to software. But the devil is always in the details.

---------------------------------------------------

![Millau Viaduct](/resources/10/MillauBridge.jpg)

Any piece of software provides a benefit to its users. It's similar to people using bridges to cross rivers. As with bridges, many kinds of software can solve the same problems.

Some bridges support many cars and pedestrians which is analogous to a high-throughput like a server that can support many users. Others are very nice walkways with trees, a highly usable piece of software that supports only a few users. Most of the time, users only see the bridge from the top. Like seeing only the tip of an iceberg.

In the process of helping users accomplish a task, bridges need to overcome various forces and challenges. The ground may be very soft. The river may rise hundreds of feet. There might be severe rain or snow. There may be hurricane-force winds. Natural disasters may occur. Also, people that use the bridge to cross want to traverse by various means: walking, driving, biking, skating, etc..

Unlike the real world, software is different in two ways: it's cheap to construct and copy. That is, there are few upfront costs required to build. And replicating already constructed pieces is practically free. There's a lot of implications from those two advantages - both good and bad.

First, we can derive fast construction through modularization. We can build a component of a bridge and mass produce that component for reuse. Similar to Henry Ford's modularization of car parts vastly speeding up car production. Since bridges can be constructed quickly and with little cost, it's easy to correct an error in design after construction. Builders can get feedback, nearly immediately, from the environment it operates under. The feedback loop is fast - like building things out of Lego.

Because it's so easy to build on the shoulders of the past giants, the industry quickly falls into becoming overmodularized and underdiciplined. It's hard to build interconnected components when there are many competing, incompatible modules. And since it's easy to course correcting along the way, the final result is usually inconsistent - beams of inconsistent lengths as the project progresses.

And while building a bridge that lasts for a day is easy, building a bridge to stand for months or years is not easy. Seasoned builders have techniques and practices that can build these longer standing bridges at the cost of taking more time to build. Great builders try to anticipate all the environmental factors while supporting business requirements such as "it needs to have trees on top" or "have a toll booth on it to charge customers". More than just the bridge, there are tools and instrumentations to verify that the bridge is operating normally at all times.

Some bridges provide immense value to users and operators to the point where they are repaired and improved while actively being used. This requires foresight and infrastructure to support maintenance and improvements while the bridge is still operating.

In review, there's a lot of challenges:

- Overcome terrain and weather.
- Potential environmental impact.
- Potentially support on-demand construction and maintenance while being operated.
- Instrumentation to identify problems.
- Tooling for operators to use.
- Maintain High adaptability because:
	- it's riders always want new features (lights, new vehicles, scenery/trees, etc.)
	- it's operators/owners want other changes more internal

The last bullet is the one of the main reasons software is interesting to work on. How do you design a system that is highly adaptable with as few different components as possible? How does another engineer discover why there are a set of rivets in this particular I-beam? The technical decisions are endless.

-----------------------------

If you like analogies to computers, you should check out [Richard Feynman's Lecture explaining computers](https://www.youtube.com/watch?v=EKWGGDXe5MA).

*Photo by [Phillip Capper](https://www.flickr.com/photos/flissphil/2892568426/in/photolist-5pBaPq-67bmDr-kPAZQa-kPCcSf-sbLoMn-5pwVM2-7g6bMf-oWi7H1-5tAM39-9ygVkY-8Wf1rv-8wUqea-8wUpur-8Wf2fR-8Wf4gr-8Wf864-8Wi7iw-8Wi8TW-8wXwqC-8W84rK-53jobc-53oBNo-8z5UF3-LoDcm-2jLSUt-cLGoxy-67fx4J-4vJARY-sSNt8Q-oYKrRG-3rKnf-6PJKkD-5pBcH5-6PNWss-6PJNx6-6PJJPc-3rKxv-98hecq-4vEu9P-8EXt9n-5oXcH6-4vEwiK-59HWJZ-8F1Fc9-8EXuie-4vEuvR-bh1WBX-4vJyTQ-7cha6Z-4vJzAQ)*
