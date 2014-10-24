# Parsing JSON in Objective-C

- date: 2014-10-24
- tags: objective-c, tdd, series: Parsing JSON in Objective-C

----------------------------------------

*This post was original written on the [Pivotal Labs Blog](http://pivotallabs.com/parsing-json-in-objective-c)*

JSON parsing is a frequent task for clients interfacing with any recent web API. Those web services frequently vary in quality:

- Is the API following a RESTful design pattern?
- Is it providing an object graph or just a single/collection of objects in the JSON response?
- What are the data types of the fields being returned? Can they be relied upon?
- How much work are clients duplicating to work around the server (e.g. - Performance, Business Logic, etc.)?

If you have full control of the resulting API endpoints, then it is easy to build or fix the API to your client’s specific needs. Controlling the incidental complexity can be challenging for APIs you do not control, or which have to support a variety of clients.

I’ll talk about the process of developing a JSON parser in Objective-C using TDD. Then we’ll simplify and abstract it as if we were to build a library. While this code isn’t applicable for everyone, the process is the meaty part of it to take away.

# Potential Problems

Let’s look at an example of a not-so-great API around managing a user’s contacts. I’m just going to specify enough details to show the pain points, although plenty of APIs do have similar problems. Some properties of potentially problematic APIs:

- An object graph is returned per API request. Each endpoint returns a different view of the object in question.
- JSON keys may or may not be there. If they are, they may be `null`.
- Inconsistent / Unsanitized Data: Sometimes the data included is invalid or incorrect and must be filtered out.
- Error responses are inconsistent in HTTP status and body format.

# Parsing a Simple Object Graph

For the rest of the article, I’m going to talk about techniques to convert this JSON (roughly):

```js
{
    "id": 1,
    "name": "Jeff Hui",
    "height": 70,
    "friends": [
        {},
        { "id": 1, "name": "Andrew Kitchen" }
    ]
}
```

into the model(s):

```objc
@interface Person : NSObject
@property (nonatomic) id identifier;
@property (nonatomic) NSString *name;
@property (nonatomic) NSUInteger height;
@property (nonatomic) NSArray *friends;
@end
```

All the code, and its evolution, is available on this [tagged repository](https://github.com/jeffh/ParsingJSON). I’ll be mentioning tags along the way.

## The Naive Solution

In the name of [YAGNI](http://en.wikipedia.org/wiki/You_aren't_gonna_need_it), we start by blissfully parsing the JSON. Eventually, we’ll add error cases.

It’s easy to test drive this. I’ll be using [Cedar](https://github.com/pivotal/cedar/).

```objc
describe(@"PersonParser", ^{
    __block PersonParser *subject;
    beforeEach(^{
        subject = [[PersonParser alloc] init];
    });

    describe(@"converting JSON response to a person object", ^{
        __block Person *person;
        __block NSData *data;
        // subjectAction runs after all beforeEaches for each it block
        subjectAction(^{
            person = [subject personFromJSONData:data];
        });

        context(@"successfully parsing a person", ^{
            beforeEach(^{
                data = [Fixture jsonDataFromObject:@{
                    @"id": @1,
                    @"name": @"Jeff Hui",
                    @"height": @70,
                    @"friends": @[
                        @{ @"id": @2, @"name": @"Andrew Kitchen" }
                    ]
                }];
            });

            it(@"should return a person", ^{
                person.identifier should equal(@1);
                person.firstName should equal(@"Jeff");
                person.lastName should equal(@"Hui");
                person.height should equal(70);
                person.friends.count sholld equal(1);
                Person *aFriend = person.firstObject;
                aFriend.identifier should equal(@2);
                aFriend.firstName should equal(@"Andrew");
                aFriend.lastName should equal(@"Kitchen");
            });
        });
    });
});
```

With failing tests, we need some implementation:

```objc
- (Person *)personFromJSONData:(NSData *)jsonData {
    id json = [NSJSONSerialization jsonObjectFromData:jsonData options:0 error:nil];
    Person *person = [[Person alloc] init];
    person.identifier = json[@"id"];
    NSArray *nameComponents = [json[@"name"] componentsSeparatedByString:@" "];
    person.firstName = nameComponents.firstObject;
    person.lastName = nameComponents.lastObject;

    NSMutableArray *friends = [NSMutableArray array];
    for (NSDictionary *friendDict in json[@"friends"]) {
        [friends addObject:[self personFromJSON:friendDict]];
    }
    person.friends = friends;
    return person;
}
```

*Review all the code at [first tag](https://github.com/jeffh/ParsingJSON/tree/01-happiest-of-paths).* All done, ship it! But what about the error cases?

# Error Handling

You're probably cringing right now because there's no error handling yet:

- What happens if the JSON doesn't parsed successfully?
- What if JSON keys don't exist?
- Are the types of the JSON objects that we expect?

We need a way to tell the rest of our program when we failed to parse something. I’ll use the standard Objective-C pattern of accepting [an error pointer](https://developer.apple.com/library/mac/documentation/cocoa/conceptual/ProgrammingWithObjectiveC/ErrorHandling/ErrorHandling.html).

```objc
// ...
describe(@"converting JSON response to a Person object", ^{
    __block Person *person;
    __block NSData *data;
    __block NSError *error;

    // subjectAction runs after all beforeEaches for each it block
    subjectAction(^{
        person = [subject personFromJSONData:data error:&error];
    });

    context(@"with a valid JSON object of a person", ^{
        beforeEach(^{
            id json = @{@"id": @1,
                        @"name": @"Jeff Hui",
                        @"height": @70,
                        @"friends": @[@{@"id": @2, @"name": @"Andrew Kitchen", @"height": @86}]};
            data = [Fixture jsonDataFromObject:json];
        });

        it(@"should return a person", ^{
            person.identifier should equal(@1);
            person.name should equal(@"Jeff Hui");
            person.height should equal(70);
            person.friends.count should equal(1);
            Person *aFriend = person.friends.firstObject;
            aFriend.identifier should equal(@2);
            aFriend.name should equal(@"Andrew Kitchen");
            aFriend.height should equal(86);
        });

        it(@"should return no error", ^{
            error should be_nil;
        });
    });

    context(@"with a valid JSON object of an error", ^{
        beforeEach(^{
            id json = @{@"message": @"Person not found"};
            data = [Fixture jsonDataFromObject:json];
        });

        it(@"should return nil", ^{
            person should be_nil;
        });

        it(@"should return an error indicating no person was given", ^{
            error.domain should equal(kParserErrorDomain);
            error.code should equal(kParserErrorCodeNotFound);
            error.userInfo should equal(@{NSLocalizedDescriptionKey: @"No person was found"});
        });
    });
});
// ...
```

This doesn’t compile since we changed the API contract. So let's hack on the current implementation for the compiler:

```objc
- (Person *)personFromJSONData:(NSData *)jsonData error:(__autoreleasing NSError **)error {
```

The tests now compile and run, but fail. So now we can implement to check if the JSON data has an error message.

```objc
- (Person *)personFromJSONData:(NSData *)jsonData error:(__autoreleasing NSError **)error {
    *error = nil;

    id json = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:nil];

    if (json[@"message"]) {
        *error = [NSError errorWithDomain:kParserErrorDomain
                                     code:kParserErrorCodeNotFound
                                 userInfo:@{NSLocalizedDescriptionKey: @"No person was found"}];
        return nil;
    }

    Person *person = [[Person alloc] init];
    person.identifier = json[@"id"];
    person.name = json[@"name"];
    person.height = [json[@"height"] unsignedIntegerValue];

    NSMutableArray *friends = [NSMutableArray array];
    for (NSDictionary *friendDict in json[@"friends"]) {
        Person *aFriend = [[Person alloc] init];
        aFriend.identifier = friendDict[@"id"];
        aFriend.name = friendDict[@"name"];
        aFriend.height = [friendDict[@"height"] integerValue];
        [friends addObject:aFriend];
    }
    person.friends = friends;
    return person;
}
```

This handles one case if the JSON object is an error message instead. This is getting larger, but let’s continue to cover more error cases. For brevity, we’ll only cover these error cases:

- Checking for `[NSNull null]` on the "height" key
- Checking for valid JSON

Writing the tests is easy:

```objc
describe(@"converting JSON response to a Person object", ^{
    // ...
    subjectAction(^{
        person = [subject personFromJSONData:data error:&error];
    });
    // ...
    context(@"when a valid JSON object that has heights as nulls", ^{
        beforeEach(^{
            id json = @{@"id": @1,
                        @"name": @"Jeff Hui",
                        @"height": [NSNull null],
                        @"friends": @[@{@"id": @2, @"name": @"Andrew Kitchen", @"height": [NSNull null]}]};
            data = [Fixture jsonDataFromObject:json];
        });

        it(@"should return a person", ^{
            person.identifier should equal(@1);
            person.name should equal(@"Jeff Hui");
            person.height should equal(0);
            person.friends.count should equal(1);
            Person *aFriend = person.friends.firstObject;
            aFriend.identifier should equal(@2);
            aFriend.name should equal(@"Andrew Kitchen");
            aFriend.height should equal(0);
        });

        it(@"should return no error", ^{
            error should be_nil;
        });
    });

    context(@"with a valid JSON object that has heights as strings", ^{
        beforeEach(^{
            id json = @{@"id": @1,
                        @"name": @"Jeff Hui",
                        @"height": @"70",
                        @"friends": @[@{@"id": @2, @"name": @"Andrew Kitchen", @"height": @"86"}]};
            data = [Fixture jsonDataFromObject:json];
        });

        it(@"should return a person", ^{
            person.identifier should equal(@1);
            person.name should equal(@"Jeff Hui");
            person.height should equal(70);
            person.friends.count should equal(1);
            Person *aFriend = person.friends.firstObject;
            aFriend.identifier should equal(@2);
            aFriend.name should equal(@"Andrew Kitchen");
            aFriend.height should equal(86);
        });

        it(@"should return no error", ^{
            error should be_nil;
        });
    });

    context(@"with an invalid JSON object", ^{
        __block NSError *jsonParseError;
        beforeEach(^{
            data = [@"invalid" dataUsingEncoding:NSUTF8StringEncoding];
            jsonParseError = nil;
            [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonParseError];
            jsonParseError should_not be_nil; // make sure we got the error.
        });

        it(@"should return nil", ^{
            person should be_nil;
        });

        it(@"should return an error indicating the JSON failed to parse", ^{
            error.domain should equal(kParserErrorDomain);
            error.code should equal(kParserErrorCodeBadData);
            error.userInfo should equal(@{NSUnderlyingErrorKey: jsonParseError});
        });
    });
});
```
(from [PersonParserSpec.mm](https://github.com/jeffh/ParsingJSON/blob/03-error-handling-height-key/ParsingJSON%20Tests/PersonParserSpec.mm))

With failing tests, let's add to the implementation:

```objc
- (Person *)personFromJSONData:(NSData *)jsonData error:(__autoreleasing NSError **)error {
    *error = nil;

    NSError *jsonError = nil;
    id json = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&jsonError];

    if (jsonError) {
        *error = [NSError errorWithDomain:kParserErrorDomain
                                     code:kParserErrorCodeBadData
                                 userInfo:@{NSUnderlyingErrorKey: jsonError}];
        return nil;
    }

    if (json[@"message"]) {
        *error = [NSError errorWithDomain:kParserErrorDomain
                                     code:kParserErrorCodeNotFound
                                 userInfo:@{NSLocalizedDescriptionKey: @"No person was found"}];
        return nil;
    }

    Person *person = [[Person alloc] init];
    person.identifier = json[@"id"];
    person.name = json[@"name"];
    NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
    NSString *heightObject;
    if ([json[@"height"] isEqual:[NSNull null]]) {
        heightObject = @"";
    } else {
        heightObject = [json[@"height"] description];
    }
    person.height = [[formatter numberFromString:heightObject] unsignedIntegerValue];

    NSMutableArray *friends = [NSMutableArray array];
    for (NSDictionary *friendDict in json[@"friends"]) {
        Person *aFriend = [[Person alloc] init];
        aFriend.identifier = friendDict[@"id"];
        aFriend.name = friendDict[@"name"];

        if ([json[@"height"] isEqual:[NSNull null]]) {
            heightObject = @"";
        } else {
            heightObject = [friendDict[@"height"] description];
        }
        aFriend.height = [[formatter numberFromString:heightObject] unsignedIntegerValue];

        [friends addObject:aFriend];
    }
    person.friends = friends;
    return person;
}
```
(from [PersonParserSpec.mm](https://github.com/jeffh/ParsingJSON/blob/03-error-handling-height-key/ParsingJSON%20Tests/PersonParser.m))

And we get our wonderful dots indicating all our tests pass:

```
Running With Random Seed: 16714

..........

Finished in 0.1280 seconds
```

The full code is the [tagged here](https://github.com/jeffh/ParsingJSON/tree/03-error-handling-height-key). So we finished our Red and Green. Now its time to…

# Refactor

We’re going to spend time refactoring without adding new features, such as additional parsing or error checking. Let's keep in mind that refactoring is a gradient and not necessarily a binary operation. The intended reusability should dictate the amount of refactoring we do. Regularly running the tests ensures we don’t accidentally cause regressions while we refactor.

Our ideal goal is to build a library that can perform as much of this work as possible. Of course, having all our code in one method isn’t reusable at all!

The obvious way to refactor is to break the code up into smaller methods.

Let’s break it out:

- `- (id)jsonObjectFromJSONData:(NSData *)jsonData error:(__autoreleasing NSError **)error` converts incoming NSData to a JSON object. This wraps NSJSONSerialization work and providing a custom NSError.
- `- (NSError *)errorMessageFromJSON:(id)json` returns an error if an error JSON object is provided instead of the person object.
- `- (Person *)personFromJSONObject:(id)json error:(__autoreleasing NSError **)error` is where the magic goes. It produces Person objects from dictionaries. It doesn’t check for errors the previous(es) method does.
- `- (NSArray *)friendsWithJSON:(id)jsonObject` converts an array of dictionaries into an array of Person objects (for the friends key).

The refactor is relatively straightforward. You can see the [full refactor](https://github.com/jeffh/ParsingJSON/blob/04-refactor-into-methods/ParsingJSON/PersonParser.m) below:

```objc
#pragma mark - Public

- (Person *)personFromJSONData:(NSData *)jsonData error:(__autoreleasing NSError **)error {
    *error = nil;

    id json = [self jsonObjectFromJSONData:jsonData error:error];
    if (*error) {
        return nil;
    }
    *error = [self errorMessageFromJSON:json];
    if (*error) {
        return nil;
    }

    return [self personFromJSONObject:json error:error];
}

#pragma mark - Private

- (Person *)personFromJSONObject:(id)json error:(__autoreleasing NSError **)error {
    Person *person = [[Person alloc] init];
    person.identifier = json[@"id"];
    person.name = json[@"name"];
    NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
    NSString *heightObject;
    if ([json[@"height"] isEqual:[NSNull null]]) {
        heightObject = @"";
    } else {
        heightObject = [json[@"height"] description];
    }
    person.height = [[formatter numberFromString:heightObject] unsignedIntegerValue];
    person.friends = [self friendsWithJSON:json];
    return person;
}

- (id)jsonObjectFromJSONData:(NSData *)jsonData error:(__autoreleasing NSError **)error {
    NSError *jsonError = nil;
    id json = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&jsonError];

    if (jsonError) {
        *error = [NSError errorWithDomain:kParserErrorDomain
                                     code:kParserErrorCodeBadData
                                 userInfo:@{NSUnderlyingErrorKey: jsonError}];
        return nil;
    }
    return json;
}

- (NSError *)errorMessageFromJSON:(id)json {
    if (json[@"message"]) {
        return [NSError errorWithDomain:kParserErrorDomain
                                   code:kParserErrorCodeNotFound
                               userInfo:@{NSLocalizedDescriptionKey: @"No person was found"}];
    }
    return nil;
}

- (NSArray *)friendsWithJSON:(id)jsonObject {
    NSMutableArray *friends = [NSMutableArray array];
    for (NSDictionary *friendDict in jsonObject[@"friends"]) {
        [friends addObject:[self personFromJSONObject:friendDict error:nil]];
    }
    return friends;
}

```

The original method is much shorter now! And if we wanted to use some other portion of the parser, like the `peopleFromJSONObject:error:` method, we can do so without having to rewrite our code.

And if we run our tests, they still pass.

```text
Running With Random Seed: 48417

..........

Finished in 0.1168 seconds

10 examples, 0 failures
```

# In the Next Episode ...
If this was in an application, this could be enough. In the next article in this series, we'll talk about how to redesign the code to increase its code reuse.
