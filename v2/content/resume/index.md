+++
layout = "resume"
title = "Resume"
disableShare = true
ShowReadingTime = false
ShowToc = true
+++


_There's also a [PDF version](jeffhui.pdf) of my resume. Engineers may be interested
in [my Github profile][github]._

[github]: https://github.com/jeffh

## Goals

My professional goal is continuous growth and learning. This can be as broad as
handling a financial audits. Or as narrow as using a new technology. I revel in
collaborating with my peers or other roles. Communicating is not just
enunciating one's intent, but to make sure terminology used by different
professions are aligned.

**Note**: I'm not looking for a managerial role at this time. I want to
refocus based on technical skills.


# Keywords for Recruiters

**Professionally Used Platforms**: iOS, iPadOS, macOS, Android, Ubuntu Linux,
Amazon Linux, Windows 10, AWS, GCP, Digital Ocean, Heroku

**Casually Used Platforms**: Linode, Hetzner, Fly.io, Azure

**Proficient**: Clojure, Clojurescript, Java, Swift, Objective-C, Objective-C++,
C, Go, Python, Ruby, Javascript (Browser & Node), SQL, NoSQL, BaseCSS,
TailwindCSS, ReactJS, Svelte, Docker, Pair Programming, Git, Sqlite, Postgresql,
DynamoDB, Kafka, Ruby on Rails, Consul, Node, Terraform

**Sufficient**: C++, C#, Haskell, Elm, Chef, Puppet, Saltstack, Terraform,
Excel, Looker, Redshift, Selenium, jQuery, Angular, Jenkins,
Github Actions, CircleCI, AutoIt, AppleScript, Django, Typescript, Ansible,
Nomad

**Recent Interests**: Elixir, Phoenix, NixOS, Bun, Deno, LLMs, Embeddings,
QuickCheck

**Professional Roles**: Software Engineer, Engineering Lead, Engineering
Manager, Engineering Director, VP of Engineering, DevOps, Legal, Compliance,
Data Protection Officer, IT Director, Head of IT Operations, Data Scientist,
Data Analyst

**Dislikes**: MongoDB, Objective-C++, C++, OracleDB, Windows Server

# Experience

## Mayvenn

### VP of Engineering

July 2021 - Dec 2023 · 2 yrs 6 mos

Besides setting the technical vision and managerial duties, I was also
responsible for filling / fixing gaps in the company's capabilities. The
company wasn't hiring ICs at the time. Fixes ranged from small
communications gaps, and other projects I was responsible for full delivery
from project problem-to-live solution. I regularly saved the company hundreds
of thousands of dollars a month in costs.

It's best explained through examples:

 - Faciliated miscommunications between departments (e.g. marketing and
   finance; marketing and co-founders; etc.).
 - Handled the work related to a tax reporting & audits (reviewed by the CFO)
 - Designed and rolled out Data Privacy and Compliance initiatives (CCPA, CPRA, etc.)
    - Built the automated DSAR process, training data teams on the new processes
    - Built and ran the DSAR process, and then documenting & delegating the process.
 - Was the defacto compliance officer.
 - Prioritized and oversaw accessibility compliance for the company's website.
 - Legal support for the company (e.g. reviewing contracts, NDAs, discovery from legal, etc.)
    - Collaborated with Legal to write updated Terms & Conditions and Privacy Policy
 - Relaunch SMS with better training on compliance for marketing and sales departments.
 - Help set up technology for company's retail division (e.g. POS systems,
   inventory management, MDM, etc.)
 - Set processes up for majority of the company for remote work (because of the pandemic)
 - Onboard new C-level and VP-level hires
 - Set roadmap for Founder's desired offerings and customer messaging
 - Started & completed the entire company from LastPass to 1Password, including
   personally walking through the process with each employee to ensure a
   seamless transition.
 - Negotiating with Vendors for Data, Engineering, Product, Retail, and
   Marketing SaaS. Saving the company $50k+/year in costs on this line item
   along.
 - Evaluating consulting firms.
 - Helped HR migrate to Rippling from 

Oh, that doesn't include the normal set of managerial duties and mentorship.
Engineering, Data, and Customer Support also reported to me. But I still
mentored other department heads.

I also documented a lot of historical knowledge and processes for the company:

 - Annual billing areas to check
 - Security checks / renewals (e.g. SSL Certificates)

### Director of Engineering

Feb 2020 - July 2021 · 1 yr 6 mos

I exchanged engineering-specific duties for more communication and cross-functional related ones:

 - Talked with with Investors for technical due diligence.
 - Vendor search & evaluation for nearly every SaaS for the company, such as
   find POS vendors and systems for expanding into retail.
 - Mentoring other department heads (peers) with career growth.
 - Vision setting to help clarify the company's direction and initiatives with co-founders.
 - Structure company organization to help execute on leadership initiatives and vision.
 - Kickoff cross-functional project initiatives
 - Root-cause analyzed company-wide issues and helped resolve them (e.g.
   identifying cause of bad customer reviews and fixing them)


### Lead Engineer

Mar 2017 - Feb 2020 · 2 yr 11 mo

I lead the engineering team at Mayvenn, participating in architectural
decisions, managerial duties, and hiring. Some highlights include:

 - Worked cross functionally with Product, Data, Design, Marketing, Sales, and Customer Service.
 - Scoped out work for engineering with third party vendor integrations. Partaking in the procurement process.
 - Built the engineering hiring pipeline from scratch: phone screening, coordinating
   technical interviews, and onboarding. Manage communications with external
   recruiters. I ran technical interviews as a fallback. Trained other engineers
   to run technical interviews. I designed the process for hiring.
 - Part of the hiring process for Product (cultural fit), Data (technical), and Design (cultural fit).
 - IT support for other departments.
 - Occasional engineering work: sometimes fixing small bugs during the course of
   helping other departments, but mostly using "low-code" tools that various
   SaaS tools had to configure what departments needed.
 - Manage on-call rotation for engineering: being available to escalate for any
   issues
 - Helped Email marketing with IP Reputation, warming, etc.

### Senior Software Engineer

Apr 2015 - Mar 2017 · 2 yr 2 mo

After ramping up in 2 weeks (including the first week traveling to a
conference!), I helped migrate from an outsourced, unstable Rails codebase to in-house.
Responsible for rewriting the majority of the system in Clojure.

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
- Open source libraries contribution ([Jasmine][jasmine], [Cedar][cedar],
  [Quick][quick], [Nimble][nimble]). I lead the Cedar open source project
  during my tenure and created the Nimble project.

I worked as individual contributor to team lead which includes programming,
architecting, recruiting, hiring, training (engineers & PMs).

Also, I've worked on Pivotal's [Cloud Foundry][cf]:

- Runtime Team: which manages cloud controller APIs and debug production issues
  on the public cloud (Pivotal Web Services).
- Services API Team: which manages the API & CLI for Cloud Foundry's services
  integration.

I've done it all. I can also build a product from start to finish. I'm just not
a designer (yet), although being part of the iOS community has rubbed off some
UX sensitivity.

[cf]: https://www.cloudfoundry.org/
[jasmine]: https://jasmine.github.io/
[cedar]: https://github.com/cedarbdd/cedar
[quick]: https://github.com/quick/quick
[nimble]: https://github.com/quick/nimble

## RPI, ECSE Department

### Undergraduate Researcher

Sep 2010 - May 2012 · 1 yr 9 mos

I worked on FIPS as an undergrad researcher, which is a system that assists in
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

Taken courses in: Computer Graphics, Compilers, Cryptography, Network Programming, Operating Systems, Databases, and more.

# Projects

## YACS, [RCOS][RCOS]

Sep 2011 - 2013

YACS is an simple course scheduler for my school, RPI. It reads from various
data sources from RPI's sites and aggregates them into a unified form. Students
can select their courses and view possible schedules. By end of the first year,
it was used by 80% of the student body to the point that new students were
recommended to use it.

I did majority of work. Another student did help with support (looking through
our school's reddit) and another helped me make flyers. Years later, it
took RCOS a team of students to replace and build most (but not all) the
fatures of the original. The most complicated feature was building to conflict
detection algorithm: the site could tell you why a course time was not
available (which one of your selections cause a conflict) as you were selecting.

Noteable features:

 - Conflict Detection
 - Calendar Export (ics)
 - Print-friendly schedules
 - Showing seats available
 - Mobile-friendly (iPhone, Android, Windows Phone)

There was several rewrites in the course of 4 months:

 - CoffeeScript => JavaScript
 - jQuery => Backbone => Angular + Underscore
 - MySQL => Postgres
 - Self-deploying makefile via SSH => Fabric

I ran this off of a cheap VPS host using python, postgres, nginx, celery, and memcached.

[RCOS]: https://new.rcos.io/
