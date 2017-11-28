# Reverse Engineering Objective-C

- date: 2014-7-26
- tags: objective-c, reverse-engineering, talk
- url_postfix: .html

----------------------------

Languages that have dynamic introspection provide powerful meta-programming
capabilities. This is generally done at runtime with additional memory used for
storing metadata - such as types and method signatures. But they also provide
the same power for people reverse engineering your code.

Let’s look at Objective-C, a simple code snippet:


```objc
@interface MyObject : NSObject
@end

@implementation MyObject {
    NSInteger _number;
}
- (void)doSomething
{
    _number++;
    NSLog(@"The %@", [self _doSomethingSpecial:_number]);
}
- (NSString *)_doSomethingSpecial:(NSInteger)number
{
    return [NSString stringWithFormat:@"Number: %d", number];
}
@end

```


Simple enough, but what if we don’t have the source? Let’s step back to how
Objective-C works…

## The Objective-C 2.0 Runtime

In the early days, Objective-C compiled to C. To be compatible with C, it used
symbols that would normally be invalid for C. This explains why Objective-C
uses @ for many of its keywords.

In fact, Objective-C methods are simply c-functions. So lets look at how
`-[_doSomethingSpecial:]` would be defined in C:


```objc
id __methImpl_MyObject_doSomethingSpecial_(id self, SEL _cmd, NSInteger number)
{
    return objc_msgSend([NSString class], sel_registerName("stringWithFormat:"), @"Number: %d", number);
}

```


Yes, the name is still `-[MyObject _doSomethingSpecial:]`. If you use a
debugger, you can pause on this method by that name.

## Header Dumping

But how might you get the name to begin with?
[class-dump](https://github.com/nygard/class-dump).

`class-dump` allows you to generate headers from the Mach-O binary file. Using
that, you can learn of the method name.

Using `class-dump` on the source above would generate something like:

```objc
@interface MyObject : NSObject {
    int _number;
}
- (void)doSomething;
- (id)_doSomethingSpecial:(int)arg1;
@end

```

What’s most noticeably missing are all the Objective-C types. Most of the
Objective-C types are stripped at compile-time (properties are the exception).

But getting the types just takes some more laborious effort. No problem, it’s
just a bit more work to walk through it using a debugger.

Of course, if you like reading assembly, you can using something like
[Hopper](http://www.hopperapp.com) to open the binary files and read the
implementation.

## Using the Debugger

All Objective-C methods are converted to objc_msgSend’s. So setting a break at
a message send invocation, you can read the registers at the current point in
the debugger:

{<2>}![](/content/images/2014/Jul/1X1l1K3D0A1X200N0N022x0L3k1O033a.png)

Objective-C uses the same calling conventions of C for the order of registers
it uses for x86_64:

* `$rdi` is the first argument. The object receiving the method invocation in ObjC.
* `$rsi` is the second argument. The selector being sent (aka, the `_cmd` variable).
* `$rdx` is the third argument. The first argument of an ObjC method invocation if it uses one.
* `$rcx` is the fourth argument. The second argument of an ObjC method.
* `$r8` is the fifth.
* `$r9` is the sixth.
* Further arguments are placed on the stack (relative to the `$rbp` stack register).

*(It’s worth noting that variadic argument parameters behave differently.)*

After you step over the Objective-C message send (or any function invocation),
the return value is stored on the `$rax` register.

As part of the [ABI](http://en.wikipedia.org/wiki/Application_binary_interface)
[calling convention](http://wiki.osdev.org/Calling_Conventions), there are
generally [function prologues and
epilogues](http://en.wikipedia.org/wiki/Function_prologue) which saves and
restores stack and register values as appropriate. To get a good picture of the
registers contents for the function. You can set a breakpoint in the debugger
at a memory address:


```
lldb> break set --addr 0xdeadbeef

```


## Combining Everything

So lets have a look at the assembly in the debugger:


```
$ lldb # assuming app is already running

# attach to the application; pauses it
lldb> attach MyApp

# sets the breakpoint by name
lldb> break set --name '-[MyObject _doSomethingSpecial:]'

# resume the application
lldb> cont

# do stuff in app to trigger the breakpoint

# see assembly at breakpoint
lldb> dis

# set breakpoint after the function prolog found using dis
lldb> break set --addr 0x12345678

 # continue to breakpoint we just set
lldb> cont

# read the registers
lldb> reg read

# reads from $rdi register
# and returns [$rdi debugDescription]
lldb> po $rdi
<MyObject: 0xdeadbeef>

# returns c-type
lldb> p $rdi
(unsigned long)0xdeadbeef

```

Want more? Check out [An Interesting Approach to Reverse Engineering
Apps](http://cocoaheads.tv/an-interesting-approach-to-reverse-engineering-apps-by-chris-stroud/).
Or read up on Gwynne Raskind’s multi-part series on disassembly ([part
1](http://www.mikeash.com/pyblog/friday-qa-2011-12-16-disassembling-the-assembly-part-1.html),
[part
2](http://www.mikeash.com/pyblog/friday-qa-2011-12-23-disassembling-the-assembly-part-2.html),
[part
3](http://www.mikeash.com/pyblog/friday-qa-2011-12-30-disassembling-the-assembly-part-3-arm-edition.html)).

Also, you might like [my talk on
this](http://pivotallabs.com/jeff-hui-reverse-engineering-objective-c/).
