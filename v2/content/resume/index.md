+++
layout = "resume"
title = "Resume"
disableShare = true
ShowReadingTime = false
ShowToc = true
+++

My professional goal is continuous growth and learning. This can be as broad as
handling a financial audits. Or as narrow as using a new technology. I revel in
collaborating with my peers or other roles. Communicating is not just
enunciating one's intent, but to make sure terminology used by different
professions are aligned.

# Keywords for Recruiters

**Professionally Used Platforms**: iOS, iPadOS, macOS, Android, Ubuntu Linux,
Amazon Linux, Windows 10, AWS, GCP, Digital Ocean

**Casually Used Platforms**: Linode, Hetzner, Fly.io

**Proficient**: Clojure, Clojurescript, Java, Swift, Objective-C, Objective-C++,
C, Go, Python, Ruby, Javascript (Browser & Node), SQL, NoSQL, BaseCSS,
TailwindCSS, ReactJS, Svelte, Docker, Pair Programming, Git, Sqlite, Postgresql,
DynamoDB, Kafka

**Sufficient**: C++, C#, Haskell, Elm, Chef, Puppet, Saltstack, Terraform,
Excel, Looker, Redshift, Selenium, jQuery, Angular, Ruby on Rails, Jenkins,
Github Actions, CircleCI, AutoIt, AppleScript, Django, Typescript

**Professional Roles**: Software Engineer, Engineering Lead, Engineering
Manager, DevOps, Legal, Compliance, Data Protection Officer, IT Director, Head
of IT Operations, Data Science

**Dislikes**: MongoDB, Objective-C++, C++

# Experience

## Mayvenn

### Lead Engineer

Apr 2017 - Present

### Senior Software Engineer

Apr 2015 - Mar 2017 · 2 yr 2 mo

After ramping up in 2 weeks (including the first week traveling to a
conference!), I helped migrate from an outsourced, unstable Rails codeback in
house. Responsible for rewriting the majority of the system in Clojure.

- Processed multi-million dollars in revenue from Stripe, Paypal, Zip (formerly
  Quadpay), Store Credit
- Scale to Black Friday traffic
- Product & inventory tracking
- Promotions

This included an E2E test suite that could verify the core customer journeys
(add to bag, checkout, etc.) and admin journeys (refund, discount, returns /
exchanges). We also had these E2E tests validate pixel analytics to quickly
identify regressions in pixels misfiring.

Part of the migration away from Rails included a frontend Single-Page App (SPA)
to provide interactivity and reduce latency between interactions.

Part of the system also included disbursements (paying out) stylists via
GreenDot and PayPal. Also included deployment and provisioning via terraform and
some automated build scripts (in Ruby) to work around some rolling deploy bugs
with AWS ECS Fargate.

In addition, I also helped answer business queries using SQL, Looker, and
Redshift.

## Pivotal Labs

### Software Engineer

Jun 2012 - Apr 2015 · 2 yr, 11 mos

I worked primarily in the labs division which did consulting from Fortune 500
companies to startups that need to hire and build a product team. Pivotal Labs
is a full-service consulting company that builds high quality products at a
sustainable pace while hiring a team (engineers, product managers, designers) to
hand it off to.

My specialty was in iOS mobile development, but I also did:

- Android development (Java)
- Backend / frontend web dev (Ruby, Python, Node, Java, C#, SQL, NoSQL)
- Devops (As low-level as AWS, Chef or high-level like Heroku + addons)
- Lower-level iOS dev: (C++, Objective-C++, C)
- Open source libraries contribution (Jasmine, Cedar, Quick). I lead the project
  for Cedar during my tenure.

I worked as individual contributor to team lead which includes programming,
architecting, recruiting, hiring, training (engineers & PMs).

Also, I've worked on Pivotal's Cloud Foundry:

- Runtime Team: which manages cloud controller APIs and debug production issues
  on the public cloud (Pivotal Web Services).
- Services API Team: which manages the API & CLI for Cloud Foundry's services
  integration.

I've done it all. I can also build a product from start to finish. I'm just not
a designer (yet), although being part of the iOS community has rubbed off some
UX sensitivity.

## RPI, ECSE Department

### Undergraduate Researcher

Sep 2010 - May 2012 · 1 yr 9 mos

I work on FIPS as an undergrad researcher, which is a system that assists in
data aggregation of phasor data from power management units (PMUs). I primarily
worked on socket programming and Rails.

## Apple

### Software Engineering, Intern

May 2011 - Aug 2011 · 4 mos

I worked on internal software for the MacOS Program Office to help facilitate
Project Managers keep track on deliverables for various product releases.

### Student for Cocoa Boot Camp

Aug 2010 - Aug 2010 · 1 wk

I was accepted by Apple to attend a week-long course to learn iOS development.
At the time, Apple only accepted 30 applicants nationwide for the program.

# Education

## Rensselaer Polytechnic Institute

2008 - 2012, Bachelors in Computer Science

Grade: 3.3

# Projects

## YACS, [RCOS][RCOS]

Sep 2011 - 2013

YACS is an simple course scheduler for my school, RPI. It reads from various
data sources from RPI's sites and aggregates them into a unified form. Students
can select their courses and view possible schedules. By end of the first year,
it was used by 80% of the student body to the point that new students were
recommended to use it.

[RCOS]: https://new.rcos.io/
