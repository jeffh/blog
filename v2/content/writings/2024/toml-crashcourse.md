+++
title = 'Toml Crash Course'
date = 2024-09-19T16:28:34-07:00
tags = ["TOML", "Today I Learned"]
ShowToc = true
+++

# Background

Since migrating this site to [Hugo][hugo], I felt like it was finally time to
avoid learning TOML.

This assumes you don't know [TOML][toml] but know other [data][json]
[formats][yaml]? Time to speedrun through.

# The 30-second Start

You can think of toml as key value file format with namespace prefixes that
translate to JSON:

```toml
# this is a comment
key = "value"

[my-key-prefix]
key2 = "value2"

person.name = "John"
```

Conceptually produces

```json
{
	"key": "value",
	"my-key-prefix": {
		"key2": "value2"
	},
	"person": {
		"name": "John"
	}
}
```

Dot-notation indicates a nested object. In the spec, TOML calls objects tables.

You can alternatively do inlined tables:

```toml
person = {
	given = "John",
	family = "Doe"
}
```

```json
{
	"person": {
		"given": "John",
		"family": "Doe"
	}
}
```

# Types

The following basic types are supported for values:

- strings can be quoted or double quoted. They can also by triple quoted like
  python strings for multiline support.
- integers
- booleans
- hex (with `0x` prefix)
- octal (with `0o` prefix)
- fractions / floats
- exponents (using `e` or `E`)
- NaN and Infinity like Javascript
- arrays using `[]`
- maps using `{}`
- dates & times using [RFC3339] format without any strings (eg -
  `2024-09-19T14:22:16-07:00`). You can provide be date only or time only

Note that keys must always be strings (like JSON).

# Dot Notation

The dot notation keys produces nested objects:

```toml
fruit.apple.smooth = true
```

Produces

```json
{
	"fruit": {
		"apple": {
			"smooth": true
		}
	}
}
```

Although dots in keys are not considered good practice because we should be
using sections instead.

# Sections

Sections remove repetition of the same prefix for sets of keys:

```toml
# this is
family.given = "John"
family.family = "Doe"

# equivalent to
[person]
given = "John"
family = "Doe"
```

```json
{
	"person": {
		"given": "John",
		"family": "doe"
	}
}
```

## Appending to Arrays

Sections with double the brackets indicates appending an object into an array:

```toml
[[people]]
given = "John"
family = "Doe"

[[people]]
given = "Jane"
family = "Doe"
```

```json
{
	"people": [
		{
			"given": "John",
			"family": "Doe"
		},
		{
			"given": "Jane",
			"family": "Doe"
		}
	]
}
```

Nesting still works with appends:

```toml
[[cool.people]]
given = "John"
family = "Doe"
```

```json
{
	"cool": {
		"people": [
			{
				"given": "John",
				"family": "Doe"
			}
		]
	}
}
```

That's pretty much it!

[hugo]: https://gohugo.io/
[toml]: https://toml.io/
[json]: https://www.json.org/
[yaml]: https://yaml.org/
[RFC3339]: https://tools.ietf.org/html/rfc3339
