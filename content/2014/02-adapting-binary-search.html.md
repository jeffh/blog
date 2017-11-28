# Adapting Binary Search

- date: 2014-7-25
- tags: algorithms, binary-search, ios, objective-c
- url_postfix: .html

---------------------

It’s great to use classic algorithms to solve problems at hand. Take this
problem of ellipsis:

> For a given text. Fit the maximum number of words that fits in the given
> size, append “… More” if there was truncation.

No, ``NSLineBreakModeTailTruncation`` will not work. We need different text.

The näive solution would simply to cut a word one-by-one until it fits with a
custom ellipsis text:

```objc
@implementation NSString (CustomEllipsis)
- (NSString *)textThatFitsSize:(CGSize)size ellipsisText:(NSString *)text
{
    CGSize infiniteSize = CGSizeMake(size.width, INFINITY);
    CGSize fullSize = [text boundingRectWithSize:infiniteSize options:NSStringDrawingUsesFontLeading|NSStringDrawingUsesLineFragmentOrigin
                              context:nil].size;

    // if text fits
    if (fullSize.height <= size.height) {
        return text;
    }

    NSString *finalString = nil;
    // if text doesn't fit
    NSMutableArray *words = [[text componentsSeparatedByString:@" "] mutableCopy];
    while (fullSize.height > size.height) {
        [words removeLastObject];
        finalString = [words componentsJoinByString:@" "];
        finalString = [finalString stringByAppendString:@"... MORE"];
        fullSize = [modifiedString boundingRectWithSize:infiniteSize options:NSStringDrawingUsesFontLeading|NSStringDrawingUsesLineFragmentOrigin context:nil].size;
    }
    return finalString;
}
@end

```

Run that in a table cell and you’ve got performance problems!

But this is a perfect fit for our standard computer science search algorithm.
Let’s look at the problem again:

> We want to find **the number of words** that can be allowed to display.

If we visualize the possible solutions, it’s just like searching through a
sorted array items:

```
Number of words that fit in the given size:
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

```

The slight change we have to make from the traditional algorithm is ensure our
algorithm remembers the number words it last seen that fits the given bound
box. So if the final “item” we reach doesn’t fit, we know a fall-back that
fits.

```
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                ^ Check (fits) + remember

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                         ^ Does not fit

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                   ^ Fits + remember

[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                      ^ Does not fit

Selects 6 words.

```

The performance improvement great because checking of the comparison fits is
expensive. This matches the same cost function of [Big-O
notation](http://en.wikipedia.org/wiki/Big_O_notation), where number of items
“visited” is measured.

Finally, those four years of CS paid off once :)
