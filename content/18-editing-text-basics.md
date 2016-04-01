# Editing Text (Basics)

- date: 2016-03-31

---------

I'm deviating from my normal style of writing to focus on something more technical. It's part-research, part-learning.

--------

# Background

The problem seems simple: open, edit, and save text files. This can range from JSON files to source code like every other editor.

Turns out, this is a relatively difficult problem. The rise of [javascript](https://atom.io "Github Atom") [text](https://code.visualstudio.com/ "Microsoft Visual Studio Code") [editors](http://brackets.io/ "Adobe Brackets") surfaces the performance problem of editing large text. It's a non-trivial problem. There are several desirable characteristics that editors want:

- Editors need to **optimize for edits**. Having immediate feedback for changes is paramount to text editing. This includes editing large files.
- Editors need to **optimize for reads**. This is implied for optimized edits so that users can see immediate feedback to their edit. This also includes support for large files.
- Editors should **minimize memory usage**. Reduced overhead for storage of text leaves more memory for more text buffers. This is useful for developers editing multiple projects at once (eg - microservices).

Different data structures support these requirements in varying degrees of success. For the sake of this article, I'm ignoring many other features editors usually have:

- Syntax highlighting
- Autocomplete
- Code Folding

Onward!

# Naïve Solution

The easiest way to solve this is to use your favorite programming language's `String` type. This is usually analogous to a (resizable) array of characters:

``` python
# python
contents = ['a', 'b', 'c'] # mutable
# or
contents = 'abc'           # mutable
```
Arrays have great performance for reading any character. But making changes [isn't great][array-performance].

- Editing the **end** of text is fast: just by adding characters at the end of the buffer.
- Editing the **middle** of the text is not too fast: inserting characters first requires moving all characters after it off by the number of characters being added.
- Editing the **beginning** of the text is the worst case: inserting characters requires shifting the entire text buffer.

The performance characteristics can be *shifted* if you switch from a standard resizable array to a resizable [circular buffer](https://en.wikipedia.org/wiki/Circular_buffer "Wikipedia: Circular Buffer") to allow fast inserts on either end. But there still poor performance in most the common case of editing in the middle of the text.

# Array of Strings

The next level, is using an array of strings. It helps minimize the worst case by assuming that most lines are relatively small - less than 200 characters. This doesn't fundamentally solve the problem:

- Large single lines (eg - compressed JS / JSON) devolves into an array.
- Files with many lines exhibit performances problems when creating new lines.

This is common for JavaScript editors. The performance impact of strings versus `ArrayBuffer` is unknown. The potential performance gains of `ArrayBuffer` may be negated by having character encoding and conversion being done all the time when reading and writing from the buffer.

# Gap Buffer

When the programming language supports direct manipulation of bytes, a common data structure is call the [Gap Buffer](https://en.wikipedia.org/wiki/Gap_buffer "Wikipedia: Gap Buffer"). It's simply an array with a "gap" of free space that's used to allow efficient edits that are close to each other. The gap is moved to the desired location by shifting characters. Since moving the gap buffer is the most expensive, it is generally only done when an edit is needed to be performed.

``` python
# python
gap_size = 3  # field to track the size of the gap
gap_start = 2 # field to track the location of the gap
buffer = ['a', 'b', None, None, None, 'c']
#                   ^    "Gap"     ^
```
The gap moves to where edits are being made. This is done by shifting the characters to either side of the buffer. The follow examples demonstrate how basic operations behave.

### Moving to the Beginning

``` python
# before: buffer = ['a', 'b', None, None, None, 'c']
# after
gap_size = 2
gap_start = 0
buffer = [None, None, 'a', 'b', 'd', 'c']
```
### Inserting 'd'

``` python
# before: buffer = ['a', 'b', None, None, None, 'c']
# after
gap_size = 2
gap_start = 3
buffer = ['a', 'b', 'd', None, None, 'c']
```
### Deleting 'b'

``` python
# before: buffer = ['a', 'b', None, None, None, 'c']
# after
gap_size = 4
gap_start = 1
buffer = ['a', None, None, None, None, 'c']
```
Some famous text editors utilize the Gap Buffer as their preferred storage mechanism, such as [Emacs](https://www.gnu.org/software/emacs/). Unlike how I've demonstrated the examples above, implementation commonly backed by a circular buffer where the gap is the edges of the array. Think of it as "inverting" the storage representation of an array of characters using a circular buffer.

It's reasonably efficient assuming your files also don't get too large. While gap buffers can generally handle much larger files (because edits aren't usually all over the place), they tend to still perform poorly on extremely large files in a find-replace use case.

# References

Here's a list of editors and their storage mechanisms:

- [Atom](https://atom.io "Github Atom") uses [Array of Strings](https://github.com/atom/text-buffer/blob/master/src/text-buffer.coffee)
- [Visual Studio Code](https://code.visualstudio.com/ "Microsoft Visual Studio Code") uses [Array of Strings](https://github.com/Microsoft/vscode/blob/90eed31518ac40f9b038d85952e6320f79a51dc3/src/vs/editor/common/model/textModel.ts)
- [Brackets](http://brackets.io/ "Adobe Brackets") uses [Array of Strings](https://github.com/codemirror/CodeMirror/blob/master/lib/codemirror.js#L7256-L7260) via [CodeMirror](https://codemirror.net/)
- [Vim](http://www.vim.org/) represents [text as an Array of Strings](https://github.com/vim/vim/blob/master/src/memline.c) using an internal tree data structure, similar to [Rope](https://en.wikipedia.org/wiki/Rope_(data_structure)), but leaf nodes holding lines when possible.
- [Emacs](https://www.gnu.org/software/emacs/) uses [Gap Buffers](https://www.gnu.org/software/emacs/manual/html_node/elisp/Buffer-Gap.html).
- [Eclipse](https://eclipse.org/) uses [Gap Buffers](https://github.com/eclipse/eclipse.platform.text/blob/master/org.eclipse.text/src/org/eclipse/jface/text/GapTextStore.java).

Other Data Structures that need to be elaborated on:

- Ropes (or other tree data structures)
- Piece table (preferred by many commercial "editors" like Word).

Comments, questions, corrections? Tweet me at [@jeffhui][https://twitter.com/jeffhui].
