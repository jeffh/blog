# Process is King

- date: 2015-09-30
- url_postfix: .html

---------------------------------------------------------------------------

There's a process behind every result.

If you say, "we have no process, there's no meetings", then that's your process. Admitting to no process simply indicates that you don't have it formalized. A poorly defined process hurts. Processes enable efficiency and consistency. They can also act like a communication protocol among team members, teams, and organizations. Process can improve your quality.

Let's think about how you deploy an application. What does that process look like? A poorly defined deployment process is inconsistent – something undesirable for a deployment. At minimum, a quick checklist works:

- SSH into box
- Copy application files to box
- Kill old processes
- Start new processes
- Check site is up

That's clearer, but far from perfect. We can refine it with more detail:

- SSH into box
	- SSH to app server: ssh `root@instance1.example.com`
- Copy application files to /www/deploy/my-app
	- tar -czf app.tar.gz /local/application
	- scp app.tar.gz instance1.example.com:app.tar.gz
	- ssh
		- tar -xzf app.tar.gz
		- rm -rf /www/deploy/my-app
		- mv app /www/deploy/my-app
- Kill old processes
	- view processes: ps aux | grep myapp
	- kill processes: kill -9 *app-pid*
- Start new processes:
	- /www/deploy/my-app/bin/myapp
- Check site is online: `www.example.com`

Obviously you can make this more detailed<a href="#1" id="1-back"><sup>1</sup></a>. Checklists are used everywhere, from [flying planes](http://flighttraining.aopa.org/students/presolo/skills/checklist.html) to [surgery](http://www.who.int/patientsafety/safesurgery/checklist/en/). This formalization [reduces errors](http://www.theatlantic.com/health/archive/2014/03/save-a-brain-make-a-checklist/284438/): an 18% reduction in mortality in surgeries with checklists according to a Veterans Affairs study. Not bad for a process that's just a list actions on a piece of paper.

But a checklist is a straight-jacket. It's more restrictive. You'll need decipline to avoid the temptation to stray from the checklist. In software, the logical conclusion is to fully automate it, but we can't automate everything in the real world.

It's important to distinguish that not every process is great a process. But great processes usually provide the following:

 - Consistency: Clear direction to achieve a goal ensuring smaller goals are met along the way.
 - Adaptability: Provides self-reflection to allow the process to change for new situations.
 - Shareability: Processes that can be communicated to others to more easily achieve consistency.

The checklist meets all three at a basic level: it's a reminder of actions to take to solve a larger goal; a checklist can be change while not running through it; and it can be given to another person to use, copy, or follow.

It's interesting to see other teams' processes. NASA's space shuttle software [process is nearly opposite](http://www.fastcompany.com/28121/they-write-right-stuff) to many startups:

 - Psudeo-code specifications & discussions defining implementation, behavior, and impact to code - avoids code silos
 - 9-5 work hours
 - Individual contributors focus on quality: Coders & Verifiers compete to improve quality
 - Large commit messages with full history of discussion
 - "People have to channel their creativity into changing the process, not changing the software"
 - **Reduced error rates by 90%, but has an annual budget of $35 million**

Or consider an agile company<a href="#2" id="2-back"><sup>2</sup></a>, I'm taking roughly [Pivotal Labs](http://pivotal.io/labs)'s:

- Iteration Planning Meeting: review of future work - implementation and behavior
- Pair programming - avoids code silos
- 9-5 work hours
- Individual contributors focus on quality
- Retrospectives to adapt and improve the process
- [Tracker](http://pivotaltracker.com) provides history of decisions and plan future development

Looks a little bit similar?<a href="#3" id="3-back"><sup>3</sup></a> Like checklists, they're making tradeoffs - they cost more in the short-term but produce better results in the long run. I'm not saying these examples are perfect, but they're defined, sustainable and structured. But working 80 hours a week to optimize every line of code for performance is a different kind of process that doesn't seem as sustainable or productive.

Open source projects are no different. They function better with processes in place. What is are your guidelines to good pull requests? What is your process for cutting releases? Is there a process for [handling security disclosures](http://www.heavybit.com/library/video/2014-10-14-alex-gaynor)? Besides helping new core team members on the project, they reduce the likelihood of making mistakes.

So what does your process look like? We know there's always one.

-------------------------------------------------------------

<ol class="footnotes">
<li class="footnote" id="1">See section named <a href="http://www.kalzumeus.com/2014/11/07/doing-business-in-japan/">The state of the "modern web" in Japan</a>. <a href="#b1" class="back">&larrhk;</a></li>
<li class="footnote" id="2">I despise agile as a term. I'd more prefer a company that cares about its process over the commercialized "agile" process. <a href="#b1" class="back">&larrhk;</a></li>
<li class="footnote" id="3">Although it does seem like the right direction, there's similarities with other processes. See <a href="http://www.thisamericanlife.org/radio-archives/episode/403/nummi">NUMMI</a> / <a href="https://en.wikipedia.org/wiki/Toyota_Production_System">TPS</a> is yet another system that has similar patterns. <a href="#b1" class="back">&larrhk;</a></li>
</ol>
