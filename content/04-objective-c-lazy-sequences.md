# Objective-C: Lazy Sequences

- date: 2014-8-7
- tags: objective-c, clojure, lazy-sequences

----------------------------------------

Lazy data structures are a powerful abstraction can increase the readability of
your program while encouraging separation of concerns.

What are they? Simply put, they are data structures that "realize" what they
contain when they're needed (or right before they're needed).

What can you do with lazy data structures? How about a page-scraper that
paginates as needed:

```
// pseudocode
seed_url = "http://example.com/page/"
// generate a lazy list of urls:
// - http://example.com/page/1
// - http://example.com/page/2
// - etc.
urls = lazy {
    for (i = 0; i < 100; i++) {
        yield seed_url + string(i)
    }
}
// a lazy list of html pages
pages = map(urls, fetchURLPageContents)
// a lazy list of list of links
links_per_page = map(pages, extractLinksFromHTML)
// flatten to just a lazy list of links
links = join(links_per_page)
// do stuff with links
for link in links {
    record(link)
}
```

This creates a powerful abstract that separate tasks your program needs to get
done behind an implicit interface. The ending for loop doesn't need to know
that those links came from multiple page fetches or the file system. If the
loop short-circuited, then it minimizes the number of unnecessary fetches.

As a fun experiment, I recently built [Clojure's sequence
abstraction](http://clojure.org/sequences) in Objective-C. Clojure's Sequences
are based on LISP's famous linked list, converted to an interface that provides
uniform api for a wide range of data structures in Clojure. It's simple:

```
@protocol Sequence <NSObject>
- (id)firstObject; // clojure: (first seq); nil indicates end
- (id<Sequence>)remainingSequence; // clojure: (rest seq)
@end
```

A variety of data structures can fit this interface at the potential sacrifice
of performance of the underlying data structure:

- Linked Lists
- Arrays (remainingSequence would just drop the first element)
- Dictionary (each element is the key-value pair -- which can also be represented as a sequence)
- Trees (firstObject is the root, remainingSequence can be children)

More interestingly, a lazy sequence can also be built from this interface. Lazy
data structures only **realize their contents as needed**. They aren't as
complicated to implement as it sounds. Here's a näive implementation based on
the Clojure's [Java
implementation](https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/LazySeq.java):

```
// LazySequence.h
@interface LazySequence : NSObject <Sequence>
// clojure equivalent to (lazy-seq (block))
- (instancetype)initWithBlock:(id<Sequence>(^)())block;
@end

// LazySequence.m
@interface LazySequence ()
@property (nonatomic, copy) id<Sequence>(^block)();
@property (nonatomic) id blockValue;
@property (nonatomic) id<Sequence> sequenceValue;
@end

@implementation LazySequence

- (instancetype)initWithBlock:(id<Sequence>(^)())block {
    if (self = [super init]) {
        self.block = block;
    }
    return self;
}

- (id)firstObject {
    return [[self evaluateSequence] firstObject];
}

- (id<Sequence>)remainingSequence {
    return [[self evaluateSequence] remainingSequence];
}

#pragma mark - Private

- (id)evaluateBlock {
    @synchronized (self) {
        if (self.block) {
            self.blockValue = self.block();
            self.block = nil;
        }
        return self.blockValue;
    }
}

- (id<Sequence>)evaluateSequence {
    [self evaluateBlock];
    @synchronize (self) {
        if (self.blockValue) {
            id value = self.blockValue;
            self.blockValue = nil;
            while ([self.block isKindOfClass:[LazySequence class]]) {
                value = [value evaluateBlock];
            }
            self.sequenceValue = value;
        }
        return self.sequenceValue;
    }
}

@end
```

While it might not be a typical first attempt at a lazy sequence, but it does
have some interesting characteristics:

 - There is locking to support access on multiple threads
 - It is readonly/immutable (assuming you don't do any runtime magic)
 - It stores an intermediate value - the sequence returned directly from the block and the "final" sequence after flattening any potentially recursive ``LazySequence``.
 - There is an ``isKindOfClass:`` check, ew.

But lazy, higher-ordered functions (``map``, ``filter``, ``reduce``, etc.) can
be implemented from this:

```
id<Sequence> filterSequence(id<Sequence> seq, BOOL(^filter)(id value)) {
    if (![seq firstObject]) {
        return [ConcreteSequence emptySequence];
    }

    return [[LazySequence alloc] initWithBlock:^id(id obj){
        if (filter(obj)) {
            return [[ConcreteSequence alloc] initWithFirstObject:obj
                                               remainingSequence:filterSequence([self remainingSequence], filter)];
        } else {
            return filterSequence([self remainingSequence]);
        }
    }];
}
```

The Sequence abstraction lends itself to allow easy lazy evaluation, but other
interface designs can be created to support more complex data structures while
maintaining better performance than Sequence: such as a lazy dictionary that
doesn't require walking key-value pairs and instead only lazily realizes
values).

There are tradeoffs for a relatively elegant design. You lose potential
performance gains for using the abstaction -- like random access on your data
structure's elements. Also, laziness makes standard debugging techniques
difficult. Stacktraces are less comprehensible because the execution order no
longer reads procedurally. This is a common complaint of
[Haskell](http://www.haskell.org/haskellwiki/Haskell), where computation is
lazily evaluated.
