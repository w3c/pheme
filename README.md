# Pheme

Pheme (FAY-may) is a daemon that provides the following services:

* It gathers events from external sources (push or pull) of arbitrary type or shape;
* It stores these events permanently using some common properties; and
* It makes it possible to query these events, notably to find out the `n` last events according to
  some specific filter.

The problem it is contributing to solve is that the work of people contributing to W3C standards has
spread out to numerous locations over the years as people have started to use the many tools that
progressively became available on the Web. Due to this, conversations may happens on GitHub or on
mailing lists, in issue trackers or on IRC, and then some further places.

Pheme is meant to provide an integration point for a very varied set of information sources, such
that the stream can be unified and then queried. Consumers of Pheme's stream could be a dashboard
application exposing what is going on around a given project, or an emailing service that would
notify people of certain specific events.

Currently Pheme can be at the receiving end of GitHub hooks (several if need be, including having a
separate secret for each) and can poll for arbitrary RSS/Atom content. Adding support for more
types of content should be straightforward.

There is a dashboard application that uses Pheme called [Midgard](https://github.com/w3c/midgard).

Since Pheme and Midgard work together, I have written up development/deployment documentation that
covers both, available in the [`DEVELOPMENT.md` 
document](https://github.com/w3c/midgard/blob/master/DEVELOPMENT.md) there.
