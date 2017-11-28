# Daily Processes Check-In

- date: 2015-11-30
- url_postfix: .html

----------------------------------------------

*Instead of sounding prescriptive, this article is much more descriptive.*

I'm describing my regular workflows: what is working; what isn't working. I'm documenting this for completely selfish reasons since it's useful to track progression (if any). It happens to be a great inflection point since a recent illness has thrown me off my routine in the past week.

-------------------------------------------

Like most people, there's a need to regularly do:

- Respond to messages (twitter, facebook, texts)
- Respond to mail (physical, email)
- Attend events (birthdays, social gatherings, meetups)
- Capture ideas (they tend to come up in the most random places)
- Living (rent, bills, taxes, laundry, cleaning)

All while (attempting) to achieve other goals:

- Personal (eg - Open Source) Projects
- Work / Career
- Learning
- (Re)formation of Habbits

The problem is balancing between them all. I've been trying a series of techniques over the few years, but rarely checked-in and reflected. I want to increase this "check-in" frequency to be less than a couple years. But let's review how they've been.

## The Keep

**Defer non-emergency messages & mail to specific times (usually during or after commutes).** This is an okay result. It's great at freeing my time at the potential (social) cost of not responding quickly. This partially results from my time at Pivotal, where it's less compulsive to check these sources. In a weird turn of events, I happen to use e-mail as a way to avoid having an rss feed (for news & github issues). While those notifications greatly increase the time to process my inbox (from 30 daily messages to 200+), it also discourages the likelihood of randomly checking my mail. And that's something I like.

It might be unfortunate that twitter, facebook, text messages, and **phone calls** happen to fall into this deferred group too. I still feel weird not answering phone calls or text messages, because I'll inevitably forget about it. I'm not sure what's the best balance to strike there.

**Automate what's possible.** What I've automated has been great. Unfortunately, that's not much:

- Autopay rent and bills
- Auto-transfer retirement investments
- Use software like Turbotax to fill out taxes in a couple hours at most.
- Recurring calendar events for laundry / cleaning (weird, but works surprisingly well).
- Automate deploys
	- Cutting new releases of Quick & Nimble has been a huge time saver with less errors (I still can't get the release notes 100% yet).
	- Fully automating the deployment of [YACS](http://yacs.me) has saved countless hours. It's the gift that keeps on giving.
	- CI is valuable to merge pull requests via my phone when it's working. Travis & CircleCI have not been the best at keeping up to date though.

Also, cooking 4-5 times per week is way better than zero! :)

## The Watch

**Inboxing items** has been invaluable. I tend to get tasks in a form I'm ready to process:

- Send a reminder to me as an email so I can create a calendar event later. (You can guess I'm an inbox zero fan.)
- File an issue instead of just telling me, because I can't possibly remember that.
- Using a derivation of the [bullet journal](http://bulletjournal.com/). More on that below.

The bullet journal is about organizing tasks into monthly, daily tasks with room to take free-form notes. It's basic layout is as follows:

- The first few pages are an index to quickly jump to pages (which are numbered).
- The next couple pages are for tasks for months in the future (aka - tasks to do later).
- Each "section" starts with a monthly calendar on a task list
- Every day is a "daily" log entry containing a bulleted list:
	- tasks (dots)
	- events (circles)
	- notes (bullet points)
- You can then transfer tasks to each month as follows:
	- `X` out the dot if it's been completed
	- `>` the dot if the task is deferred to next month
	- `<` the dot if the task is deferred to more than a month later
- Every month, move all the deferred tasks to their appropriate locations.
- Feel free to use the next available page as free-form notes and mark the page number in your index.

![Daily Bullet Journal](/resources/15/bullet-journal.jpg)

I have been doing a subset of this that involves only a daily log entries and indexes. I'll continue to expand to more of the full bullet journal over time. This analog form has been a lot better than most digital forms. I use a A6 notebook which is about the size of an iPhone 6+

The main problem is that there are still too many inboxes. I haven't been great at processing them all.

At work, [Tracker](http://pivotaltracker.com) is this inbox list. It feels like a conflict between this and the bullet journal. Calendar events are separate from my bullet journal and cut into perceived time to complete tasks. Github issues are fragmented into an inbox per project. They're duplicated into my email inbox to ensure I don't miss them, but I still happen to. Also, github does not provide any useful tools for organizing the issues and pull requests.

I need to unify the inbox. I'll attempt to use the bullet journal as the primary inbox with my mailbox as the review to other's requests.

## The Change

All this organizing tends to let me cut up my tasks into smaller chunks that what's needed for large tasks. It allows me to respond consistently, but discourages allocating full-day tasks -- such as a CLI-only Quick implementation, or rewriting Fox into Swift.

This severely has cut into my long-term tasks and goals. There's an ideal to record screencasts that has been lavishing for months. I need to fully dedicate a day or two in a month to work on these tasks. Similar to other habits: daily exercising and avoiding nail biting.


## Actions

What should change?

- Use bullet journal as the primary "inbox"
	- Add tasks to check other inboxes
- Allow allocation of all-day tasks to a weekend
	- Side projects
	- Screencasts
	- Reading
	- Learning
- Increase the frequency time slots for messages & mail activities
	- Perhaps 3 - 4 / day instead of just 1 - 2 / day
