# Parsing JSON in Objective-C - Part 2

- date: 2014-11-08
- tags: objective-c, tdd, series: Parsing JSON in Objective-C
- url_postfix: .html

--------------------------------------

*Note: This previously was on [Pivotal Labs blog](http://pivotallabs.com/parsing-json-objective-c-part-2/).*

In the [previous article](05-parsing-json-in-objective-c-part-1), we used TDD to parse JSON into our `Person` model and refactored the code under test. In part 2, we're going to refactor the code further to be more reusable and extendable. All the code in this article will also be in the [same repository](https://github.com/jeffh/ParsingJSON/).

# Redesign

The refactorings in the previous article were fairly straightforward and mechanical. Ultimately, we’ll need to break apart different concerns of this code. One approach would be to start with some questions:

- What is the problem we're trying to solve?
- How can the problem be broken into smaller problems to solve in separate pieces?
- What is domain-knowledge code? What is generic, machinery code? How can we separate them?
- What are the tradeoffs of the solution?

There are many possible solutions, but I'll present just one which tries to maximize flexibility and minimize the machinery.

When designing an API, it’s common to confuse easy with simple. I recommend watching Rich Hickey’s [Simple Made Easy Talk](http://www.infoq.com/presentations/Simple-Made-Easy). In summary, simplicity is about keeping things unentangled.

Here's how the solution tries to answer the questions:

## What is the problem we're trying to solve?

[Data Mapping](http://en.wikipedia.org/wiki/Data_mapping). Converting one tree of value objects into another tree of value objects. This code should treat the input of values as untrusted data and avoid any exceptions. This is functional - it's not covering anything related to network code.

## How can the problem be broken into smaller problems to solve in separate pieces?

Data mapping is a fractal problem. For example, converting string to integer is a subset of converting an array of strings to an array of integers. 

## What is domain-knowledge code? What is generic, machinery code? How can we separate them?

The domain knowledge are the specific values that are input and output. Names of things: fields, objects, and properties are all domain specific. The operations that transform the input into the output are generic, machinery code. They can be transposed to different problem domains (for instance, JSON vs. XML).

## What are the tradeoffs of the solution?

Composition increases the number of lines of code. If publicly exposed, this greatly increases the surface area of the API to test and for end-users to learn.

# Building the Abstraction

So we want a simpler abstraction. Making the code more uniform is what an abstraction is for. So let’s go with something similar to the original method.

```objc
@protocol Mapper
- (id)objectFromJSONObject:(id)jsonObject error:(__autoreleasing NSError **)error;
@end
```

Refraining from adding more methods is generally a good thing. Otherwise the interface becomes like the [Java Set interface](http://docs.oracle.com/javase/7/docs/api/java/util/Set.html) with 15 methods. Each method added to an interface leaks the abstraction - dictating implementation details. It’s better to use composition to make an abstraction easier to use instead of mixing the ease and abstraction together. For example, the one `Mapper` method implicitly dictates a synchronous API.

We’ll keep the public interface the same until the end for now.

So lets move the code previously in methods into separate classes. We’ll "talk" to other methods through the `Mapper` protocol. For example, `-[peopleFromJSONObject:error:]` is extracted into two parts:

- A mapper that uses another mapper on every element of an array. (Pure machinery)
- A mapper to convert JSON into a Person object. (More domain)

Here’s the mapper for every element in an array:

```objc
@interface ArrayMapper <Mapper>
@property (nonatomic) id<Mapper> mapper;

- (instance)initWithItemMapper:(id<Mapper>)mapper;
@end

@implementation ArrayMapper

// … init method here …

- (id)objectFromSourceObject:(id)jsonObject error:(__autoreleasing NSError **)error {
    NSMutableArray *transformedItems = [NSMutableArray array];
    for (id item in jsonObject) {
        NSError *itemError = nil;
        id transformedItem = [self.itemMapper objectFromSourceObject:item error:&itemError];
        if (itemError) {
            *error = itemError;
            return nil;
        } else {
            [transformedItems addObject:transformedItem];
        }
    }
    return transformedItems;
}

@end
```

We can further break apart the theoretical Person Mapper class. There is the domain of the keys and models to map, but the actual process is purely machinery work. We’ll generically map keys of one object to keys of another object using [KVC](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/KeyValueCoding/Articles/KeyValueCoding.html) to remove a custom class.

```objc
@interface ObjectMapper : NSObject <Mapper>

@property (nonatomic) Class classOfObjectToCreate;
@property (nonatomic, copy) NSDictionary *jsonKeysToFields;
@property (nonatomic, copy) NSDictionary *fieldsToMappers;

- (instancetype)initWithGeneratorOfClass:(Class)classOfObjectToCreate
                        jsonKeysToFields:(NSDictionary *)jsonKeysToFields
                         fieldsToMappers:(NSDictionary *)fieldsToMappers;

@end

@implementation ObjectMapper

// … init method here …

- (id)objectFromJSONObject:(id)jsonObject error:(__autoreleasing NSError **)error {
    *error = nil;

    id object = [[self.classOfObjectToCreate alloc] init];
    for (id jsonKey in self.jsonKeysToFields) {
        id field = self.jsonKeysToFields[jsonKey];

        // note: this is an assumption here. We may not want to always use key path.
        id value = [jsonObject valueForKeyPath:jsonKey];
        id<Mapper> valueMapper = self.fieldsToMappers[field];
        if (valueMapper) {
            value = [valueMapper objectFromJSONObject:value error:error];

            if (*error) {
                return nil;
            }
        }

        if (value) { // setValue:forKey: fails if value is nil
            [object setValue:value forKey:field];
        }
    }
    return object;
}

@end
```

You can see the other refactors in the [tagged repository](https://github.com/jeffh/ParsingJSON/tree/05-convert-most-methods-into-using-mappers). But the basic goal is move all methods into separate classes that conform to our new `Mapper` protocol. But the methods tend to bind details of the machinery of data mapping and the domain of what objects we’re specifically operating on.

Now our high-level solution becomes an object composition problem:

```objc
- (Person *)personFromJSONObject:(id)json error:(__autoreleasing NSError **)error {
    id<Mapper> stringToNumberMapper = [[StringToNumberMapper alloc] init];
    id<Mapper> friendMapper = [[ObjectMapper alloc] initWithGeneratorOfClass:[Person class]
                                                            jsonKeysToFields:@{@"id": @"identifier",
                                                                               @"name": @"name",
                                                                               @"height": @"height"}
                                                             fieldsToMappers:@{@"height": stringToNumberMapper}];
    id<Mapper> friendsMapper = [[ArrayMapper alloc] initWithItemMapper:friendMapper];

    NSDictionary *jsonKeysToFields = @{@"id": @"identifier",
                                       @"name": @"name",
                                       @"height": @"height",
                                       @"friends": @"friends"};
    NSDictionary *fieldsToMappers = @{@"height": stringToNumberMapper,
                                      @"friends": friendsMapper};
    id<Mapper> objectMapper = [[ObjectMapper alloc] initWithGeneratorOfClass:[Person class]
                                                            jsonKeysToFields:jsonKeysToFields
                                                             fieldsToMappers:fieldsToMappers];
    return [objectMapper objectFromJSONObject:json error:error];
}
```

This is more code! But functional programmers might recognize this as a restricted, verbose version of [partial functions](http://en.wikipedia.org/wiki/Partial_function). They maximize the amount of flexibility and code reuse - especially if they’re [pure functions](http://en.wikipedia.org/wiki/Pure_function). [Data mapping](http://en.wikipedia.org/wiki/Data_mapping) happens to fit a purely functional operation: converting one value object to another. Unfortunately, Objective-C doesn’t treat functions as first class citizens in the language (and therefore, it isn't idiomatic to compose functions). Object-oriented programming can still represent partial functions, but with more boilerplate. In exchange for a bit more code our objects become more [SOLID](http://en.wikipedia.org/wiki/SOLID_(object-oriented_design)), honoring the concepts of [Single Responsibility](http://en.wikipedia.org/wiki/Single_responsibility_principle) and [Dependency Inversion](http://en.wikipedia.org/wiki/Dependency_inversion_principle).

## Taking it to the Extreme

To indicate that this protocol works for more than just JSON objects, we can rename the method on `Mapper`:

```objc
@protocol Mapper <NSObject>
- (id)objectFromSourceObject:(id)sourceObject error:(__autoreleasing NSError **)error;
@end
```

But it’s pretty much the same otherwise. Using `Mapper`, we can expand to cover all behavioral aspects of data mapping and try to clean up the remaining private methods we extracted earlier. Abstracting common operations to be more declarative can make the associated code more useful for the general data mapping problem we’re solving. Let’s look at a new `ChainMapper` class:

```objc
@interface ChainMapper : NSObject <Mapper>
@property (nonatomic, copy) NSArray *mappers;
- (instancetype)initWithMappers:(NSArray *)mappers;
@end

@implementation ChainMapper

// … init method here …

- (id)objectFromSourceObject:(id)sourceObject error:(__autoreleasing NSError **)error {
    *error = nil;
    id result = sourceObject;
    for (id<Mapper> mapper in self.mappers) {
        result = [mapper objectFromSourceObject:result error:error];
        if (*error) {
            return nil;
        }
    }
    return result;
}

@end
```

This class simply chains each mapper’s results to the one after it, unless an error occurs. So the only public method on `PersonParser` changes to utilize more of this protocol:

```objc
- (Person *)personFromJSONData:(NSData *)jsonData error:(__autoreleasing NSError **)error {
    JSONDataToObjectMapper *jsonMapper = [[JSONDataToObjectMapper alloc] initWithErrorDomain:kParserErrorDomain
                                                                                   errorCode:kParserErrorCodeBadData];
    ErrorIfMapper *errorMapper = [[ErrorIfMapper alloc] initWithErrorDomain:kParserErrorDomain
                                                                  errorCode:kParserErrorCodeNotFound
                                                                   userInfo:@{NSLocalizedDescriptionKey: @"No person was found"}
                                                       errorIfJSONKeyExists:@"message"];

    NSArray *mappersToTry = @[jsonMapper, errorMapper, [self personMapper]];
    ChainMapper *mapper = [[ChainMapper alloc] initWithMappers:mappersToTry];
    return [mapper objectFromSourceObject:jsonData error:error];
}
```

Which essentially describes a data flow diagram:

```
jsonMapper -> errorMapper -> personMapper -> Person Object
     |            |              |
   error        error          error
```

Oh yeah, did I forget to mention all the tests still pass? We didn’t change the public API, so we didn’t change any tests. You can view all the code [we changed up to this point](https://github.com/jeffh/ParsingJSON/tree/06-full-refactor-to-one-protocol).

>	Running With Random Seed: 23518
>	
>	..........
>	
>	Finished in 0.1246 seconds
>	
>	10 examples, 0 failures


# Extending the Design

Now let’s expand the design to something it wasn’t managing before. Optional mapping.

An optional mapping is a mapping that can **succeed by not mapping a value**. An example usage is when mapping arrays.


```text
Input: @[@"foo", @"10", @"20"]
<mapping magic>
Output: @[@10, @20]
```


The first element in the input is dropped from the array as invalid input (it can’t be converted to a number). But we still want the possibility that we can reject the entire array if we want.

So we need to modify the contract of our protocol. I’ll propose adding a key to the `userInfo` of NSErrors returned: 

```objc
extern NSString *kIsNonFatalKey;

@protocol Mapper <NSObject>
- (id)objectFromSourceObject:(id)jsonObject error:(__autoreleasing NSError **)error;
@end
```

If this key is set to `@YES`, then mappers can choose to suppress the error and continue. A perfect use is for the `ArrayMapper` to simply drop that value when producing the array. The new `OptionalMapper` simply converts an error from a mapper its given into this non-fatal error. Composing both gives us our bigger solution:

```objc
NSDictionary *jsonKeysToFields = @{@"id": @"identifier",
                                   @"name": @"name",
                                   @"height": @"height"};
NSDictionary *fieldsToMappers = @{@"height": stringToNumber,
                                  @"id": required,
                                  @"name": required};
id<Mapper> friendMapper = [[ObjectMapper alloc] initWithGeneratorOfClass:[Person class]
                                                        jsonKeysToFields:jsonKeysToFields
                                                         fieldsToMappers:fieldsToMappers];
id<Mapper> objectToFriendOrEmpty = [[OptionalMapper alloc] initWithMapper:friendMapper];
id<Mapper> objectToFriends = [[ArrayMapper alloc] initWithItemMapper:objectToFriendOrEmpty];
```

The code changes are relatively straightforward. You can see the final code in the [repository](https://github.com/jeffh/ParsingJSON).

# Closing Thoughts

All the composition gives us significant flexibility to extend the system. An example is a generic object-to-object mapper - we can build a mapper that:

- Uses reflection to figure out mapping of JSON keys to model properties
- Automatically determine which types to parse
- Add fallback parsing strategies (e.g. - parsing all the known RFC formats of date strings)
- Type-checking input
- Allowing end-user customization when required.

All of which builds on top of existing functionality. A perfect example is [Hydrant](https://github.com/jeffh/Hydrant)’s [ReflectiveMapper class](https://github.com/jeffh/Hydrant/blob/b9bfad919dd61f49d5b869788690dbd312a72a68/Hydrant/Public/Mappers/Facade/HYDReflectiveMapper.m#L227-286) (which is verbose simply because it is an immutable builder too). Most of it’s functionality is achieved by composing other objects in Hydrant.

## Try it at Home

Obviously, the example code for this article isn’t thorough in covering all the error cases and is for demonstrative purposes. There are many ways to expand this code:

- Cover more edge cases
    - Check `NSError **` isn’t NULL before using it
    - Check for types of the source object before processing them
- Handle parsing other data types (XML, YAML, etc.)
- If we’re making the individual mapper classes public, we should consider adding tests to them.

As well as areas that haven’t seen a design treatment:

- How can we support key paths and key values simultaneously?
- Is using a userInfo key a good approach for this?
- Can we generalize `ArrayMapper` to more than arrays?
- How can we generalize `ObjectMapper` to be recursive?
- How can we support mapping many-to-many relationships? (e.g. - day, time keys into a date property).
- How can we serialize something back into JSON without having to repeat ourselves (the end-user)?
- How can we provide enough information for end-users to debug when a mistake in data mapping has been made?

Many of these concepts are explored in the [Hydrant](https://github.com/jeffh/Hydrant) project, but I encourage you to explore the problem and possible solutions on your own.
