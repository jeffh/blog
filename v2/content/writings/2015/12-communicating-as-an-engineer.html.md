+++
title = 'Communicating as an Engineer'
date = 2015-08-31
url = "2015/12-communicating-as-an-engineer.html"
tags = ["Concepts", "Processes"]
+++

As an engineer, one of the most valuable skills you can have is to communicate
effectively. This applies both to your follow engineers as well as non-engineers
(PMs, designers, business). Obviously, this advice is generally applicable, but
many engineers don't craft their communication to the business well. Common
problems are:

- Talking _too much_ about technical implementation.
- Talking _too little_ about technical implementation.

Too much technical implementation drowns out the important details that
businesses are concerned about. It drags on discussions and meetings
unnecessarily. Imagine if a designer talked for hours about how they picked the
correct border radius value and color for their buttons in a meeting. That's a
waste of time for business stakeholders and engineers in that meeting. Getting
far into the weeds like that quickly wastes discussions or
meetings<a href="#1" id="1-back"><sup>1</sup></a>.

Similar to spewing technical details, using fancy words are also detrimental to
your goal of effective communication. If your collaborators aren't on the same
page with your definition, then you're introducing more error for the worst
kinds of mistakes. They can range from not being explicit on the
[units of measurement](https://en.wikipedia.org/wiki/Mars_Climate_Orbiter); not
being aligned what functional programming is; or why engineering should use a
new tool. These undefined words are assumptions. And assumptions are the enemy
of clear communication. It's assumptions that exaggerate mistakes.

In comparison, hiding too much of the the technical implementation can also be
detrimental. You're _denying_ the business from potentially making important
decisions. Similar to why the
[waterfall model](https://en.wikipedia.org/wiki/Waterfall_model) is flawed: it
assumes each step has perfect information to operate in isolation. But no one in
the company has the complete problem in their head to completely solve the
solution for the customer<a href="#2" id="2-back"><sup>2</sup></a>. A company
hires experts (designers, product managers, engineers, marketers, etc.) to
provide information and action into the decision-making process. Making
decisions is the core of a business' operation. It's what executives and
managers, including PMs, do all day. They rely on others to extract the signal
from the noise and to execute on those decisions.

Experts provide both information and execution. Sure you can implement your
software solution, but without providing the business the information _why_ it's
valuable, there's no reason to fund or support that project from an
stakeholder's perspective. A solution may become a waste of time if it's not
solving the problem for the demographic the business is targeting, for example.
This scales from the which projects to sponsor to if a bug should be fixed
instead of that new feature marketing wants.

It's not uncommon for engineers over
optimize<a href="#3" id="3-back"><sup>3</sup></a> or choose experimental
technologies<a href="#4" id="4-back"><sup>4</sup></a> without consulting the
business for feedback. That's keeping the business in the dark about the
implications for those decisions. Every decision has tradeoffs.

## What's the right amount then?

So what's the right amount of technical implementation to talk about to a
non-technical person? It's the wrong question. You actually want to talk in
terms of technical **implications**.

The company needs to understand the tradeoffs for the technical decisions you're
proposing. Saying you're using the latest NoSQL database because of its marketed
performance also comes with a lot of unknowns. How do you know it reliably
preserves the data your store? How difficult is it to maintain operationally?

[Edn](https://github.com/edn-format/edn) seems like a great serialization format
if you're using Clojure and ClojureScript now. Sure it didn't seem like a
decision the business needed to care about, but there are implications for that.
Edn effectively locks-in your ability to move off of a Clojure stack in the
future. While JSON is inferrior in capabilities, it keeps that option open.
Alternatively, you can maintain both JSON and Edn serializations, but that
increases your surface error to maintain. In this example, it's easy to infer
the correct business decision, but if you're not sure, that needs to be
presented to the business as choices with clear impacts to the business in a
variety of future scenarios.

Sure, you don't raise every little problem to the business, that's where your
expertise comes in. You need to know when the scope of the decision extends
beyond your domain and into others. You decide which technical discussions they
need to participate and which they don't. There's always a tradeoff for every
decision you make.

You're the bridge from your expertise to the
business<a href="#5" id="5-back"><sup>5</sup></a>.

Depending on the context, using
[Cloud Formation](https://aws.amazon.com/cloudformation/) may be a technical
_implementation_ or a technical **implication**. Keeping aligned with the
business' goals is important to know when to present the decision. Not all big
decisions are blocking, especially when technologies can be easily swapped
(e.g. - swapping SQL databases may be relatively easy to switch) after the
organization determines which to use.

While talking up the chain of command important for determining impact, daily
discussions on your team is primarily about course-correcting. The team needs to
communicate to find and resolve errors before they devolve into major problems.
Therefore, the team's communication should avoid ambiguities. Avoid terms
unfamiliar with your collaborators and clear any confusion as early as possible
to keep mistakes<a href="#6" id="6-back"><sup>6</sup></a> small. Use a shared
vocabulary that is explicitly agreed upon to be concise. Avoid introducing terms
arbitrarily simply because you read it up on a blog. New team members should be
given the list of agreed upon words and their definition (aka, domain
knowledge).

The context of efficient team communication could be its own article. But
suffice to say that you want to remove any confusion and provide quick feedback
to detect any problems. Listen after you explain a concept to your team members.
Is it possible to derive different meaning to what you're saying? Does the
person look a little confused? Are they unwilling to ask the question because
they feel it's silly or stupid?

Talking to someone is similar to writing, it's best to anticipate the journey in
their thoughts to effectively guide someone to understanding your thoughts. But
unlike writing, you have more feedback to what you're saying. Take advantage of
that extra information.

And this varies from day-to-day. Sometimes it feels like everyone's on the same
page, while others days feel like non-stop back-and-forth. But that's
collaboration in action: a never-ending effort to piece together the
sub-problems to provide a more comprehensive solution. It's how the sum becomes
greater than its parts.

<ol class="footnotes">
<li class="footnote" id="1">A simple metric for meetings: is it worth the cost of having each person in the meeting room for the discussion for an hour? Consultants notice this more acutely than other types because of their hourly billing. It's useful, but should be more sparingly employed. <a href="#1-back" class="back">&larrhk;</a></li>
<li class="footnote" id="2">Unless if you're a 1-person company, then only maybe. It's hard to believe if anyone has perfect technology. <a href="#2-back" class="back">&larrhk;</a></li>
<li class="footnote" id="3">Optimization definitely has it's place, but make sure you need to pay that. If you imagine the business paying $60/hr for your time, it's it worth it for the business to improve that page load time by 10ms? <a href="#3-back" class="back">&larrhk;</a></li>
<li class="footnote" id="4">Like optimizations, technologies are a tradeoff that should be considered. They may provide benefits as the increased risk. Can you deliver on the deadline? Can you recruit skill for this technology? What if the technology becomes abandoned? <a href="#4-back" class="back">&larrhk;</a></li>
<li class="footnote" id="5">It's harder for a business stakeholder to be an expert at everything needed to run a business. It's easier for you to better understand the business than a stakeholder to understand technology, negotiation, manufacturing, recruiting, human resources. It doesn't hurt to try an educate them when you can though. <a href="#5-back" class="back">&larrhk;</a></li>
<li class="footnote" id="6">Mistakes will always happen, that's just human nature. <a href="#6-back" class="back">&larrhk;</a></li>
</ol>
