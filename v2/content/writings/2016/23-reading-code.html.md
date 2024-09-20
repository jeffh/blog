+++
title = 'Reading Code – Assertions & Assumptions'
date = 2016-08-31
url = "2016/23-reading-code.html"
tags = ["Processes"]
+++

I'm fascinated by how engineers read and interpret code that they work on a
daily basis. It's no doubt different for everyone, but few explain how they go
about and understand a unfamiliar codebase.

For me, being comfortable in a codebase usually means two things:

- Being able to jump to relevant, related parts of the code.
- Understand the implications of changing a piece of code
  - **Inside the system** – impact of code quality. How does the code influence
    code in the same project?
  - **Outside the system** – implications for human and program collaborators.
    How does the code influence other projects, teams, or users?

Both can be addressed by following the data flow of the code. I refer to my
strategy as assertions and assumptions. Take this arbitrary
[code snippet](https://github.com/django/django/commit/4bc6b939944183533ae74791d21282e613f63a96)
from [Django](https://github.com/django/django):

```python
# from django/forms/models.py
def fields_for_model(model, fields=None, exclude=None, widgets=None,
                     formfield_callback=None, localized_fields=None,
                     labels=None, help_texts=None, error_messages=None,
                     field_classes=None):
    field_list = []
    ignored = []
    opts = model._meta
    # Avoid circular import
    from django.db.models.fields import Field as ModelField
    sortable_private_fields = [f for f in opts.private_fields if isinstance(f, ModelField)]
    for f in sorted(chain(opts.concrete_fields, sortable_private_fields, opts.many_to_many)):
        if not getattr(f, 'editable', False):
            if (fields is not None and f.name in fields and
                    (exclude is None or f.name not in exclude)):
                raise FieldError(
                    "'%s' cannot be specified for %s model form as it is a non-editable field" % (
                        f.name, model.__name__)
                )
            continue
        if fields is not None and f.name not in fields:
            continue
        if exclude and f.name in exclude:
            continue

        kwargs = {}
        if widgets and f.name in widgets:
            kwargs['widget'] = widgets[f.name]
        if localized_fields == ALL_FIELDS or (localized_fields and f.name in localized_fields):
            kwargs['localize'] = True
        if labels and f.name in labels:
            kwargs['label'] = labels[f.name]
        if help_texts and f.name in help_texts:
            kwargs['help_text'] = help_texts[f.name]
        if error_messages and f.name in error_messages:
            kwargs['error_messages'] = error_messages[f.name]
        if field_classes and f.name in field_classes:
            kwargs['form_class'] = field_classes[f.name]

        if formfield_callback is None:
            formfield = f.formfield(**kwargs)
        elif not callable(formfield_callback):
            raise TypeError('formfield_callback must be a function or callable')
        else:
            formfield = formfield_callback(f, **kwargs)

        if formfield:
            field_list.append((f.name, formfield))
        else:
            ignored.append(f.name)
    field_dict = OrderedDict(field_list)
    if fields:
        field_dict = OrderedDict(
            [(f, field_dict.get(f)) for f in fields
                if ((not exclude) or (exclude and f not in exclude)) and (f not in ignored)]
        )
    return field_dict
```

Without looking much into the other code around it, we can make (roughly) two
kinds of interferences: assumptions and assertions in alternating fashion.

## 1. Assumptions

- This code probably has to deal with html formdata handling based on the name
  and project (django being a web framework)
- It seems to be a public method because the function's name isn't prefixed with
  an underscore for private / protected functions as per python's coding
  conventions
  - There's also no other private or protected indicator that may indicate that
    if the developer was for accustomed to programming in another language.
- The function name indicates getting some fields (a collection?) given a model
  (a form model?)

## 2. Assertions

- This code loops over fields specified in the Model's `_meta` field.
- This function returns an `OrderedDict` type.
  - The keys are the field's `name` property and the values are something called
    a `formfield`.
- Form fields are constructed with `kwargs` map that the loop spends most of its
  time building.
- Form fields are sortable.
- There is a special case handled for Django's database models.
- `widgets`, `localized_fields`, `labels`, `help_texts`, `error_messages`,
  `field_classes` is dictionary-like with field names as keys.
- `formfield_callback` is a callable (aka - function)
- `fields` and `exclude` are list-like
- `f.name` is hashable and support equality

## 3. Assumptions

- FormFields must be some class. They may be different from regular `Field`
  classes, or they could be related via inheritance or abstract base-class. If
  this code wasn't python, then could also be an interface.
- `fields` and `exclude` are probably whitelists and blacklists respectively
- `formfield_callback` is an alternative constructor for these formfield
  instances
- It looks like this function read's some or all of a models' fields. Models are
  from the database or elsewhere. The return value is a dictionary of field
  names to some field model.

This cycle of assumptions and assertions can be repeated as many times as
needed. Exploring more code that is related will help convert some assumptions
into assertions (eg - jumping to a piece of code that uses this function). But
the goal is to build a collection of assertions you can make about the code at
any given point in time.

# Navigating through the Code

Navigating through code is primarily driven by the need to convert assumptions
into assertions. In the example above, I happened to pick a piece of code at
random. But usually exploring a codebase is driven by a goal – usually to make a
change to the software.

When I navigate _down_ into more implementation details, the goal is to
understand how or what is being accomplish in a piece of code. This means I need
to understand how a piece of code works, what arguments a function or class
expects, etc.

Learning context of the a given code's execution when I navigate _up_ to find
usages of the code I was reading. This helps understand the bigger picture of
why the some code was written and if it can make assumptions about its
execution. It's only natural for a function to be implemented against the cases
it's known to encounter.

# Implications

In short:

- Don't trust names of things. The human language is a highly context-specific
  form of communication. Original meanings are easily lost to time. Never trust
  names of things unless you have verified it yourself.
- Code is always contextual to decisions both inside and outside the codebase.
  Since time changes the context, code must also change over time.
- Even if you don't use a strongly-typed language, it is still valuable to think
  in terms of how a type checker works.
