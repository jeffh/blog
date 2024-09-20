+++
title = 'Evaluating New Techonologies'
date = 2014-07-24T00:00:00-07:00
draft = false
url = "/2014/01-evaluating-technologies.html"
+++

Every time you look at a new (or familiar) technology. You should ask: What are
the tradeoffs?

It's obvious to see the benefits of something - it's generally advertised
everywhere. Everyone is always shouting the the pros of X.

- "X does Y easier"
- "X does Y faster"
- "X integrates with Y"

Pros tend to flood the internet way more than cons:

- X makes Z harder
- X makes Z slower
- X locks you into Y
- X does Y, at the expense of Z

These are harder to find. Especially when the library is relatively new. But you
can imagine based on how critical it is on your software stack.

For example, but I'm not exclusively selecting, Mongodb. It is easier and faster
is than a traditional SQL database, but that's because it sacrifices many
capabilities that a SQL database provides:

- fsync (is off by default)
- locks per database
- no transactions (you can atomically update a document)
- relationships - which turns out to be useful for many applications.
- documents have a
  [max size limit](http://docs.mongodb.org/manual/reference/limits/).
- [doesn't ensure data integrity](http://docs.mongodb.org/manual/tutorial/recover-data-following-unexpected-shutdown/#recover-data-after-an-unexpected-shutdown);
  especially for
  [single servers](http://blog.mongodb.org/post/381927266/what-about-durability).

Now, there are reasons why you might want to use it - although I personally feel
like other NoSQL options solve those problems better. But know what limitations
and tradeoffs you're making.
