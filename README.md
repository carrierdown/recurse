![Recurse](https://raw.github.com/carrierdown/recurse/master/images/recurselogo2.png)

## `re<urse`

`re<urse` is a language for generating musical patterns.

### Why `re<urse`

You might ask why you need a new language for this purpose.

- Focus on minimal syntax
- Many existing implementations focus heavily on synthesis. Since `re<urse` is focused purely on sequencing, it can focus on a few simple constructs and should therefore be easy to learn.
- It is designed to augment your existing workflow rather than adding yet another environment, meaning that it works by scripting an existing host like Ableton Live, Bitwig Studio, or Renoise. In fact, it _only_ works in conjunction with an existing DAW - it produces no audio or midi output on its own.

### Status

This project is currently in alpha, and I'm planning to release v1.0 sometime during ~~the autumn of 2016~~2017.

## Introduction

`re<urse` lets you define musical patterns by specifing rhythmic intervals and notes separately. This is done by invoking the rm (short for rhythm or rhythmic motive) and ns (short for notes or note set) functions:

`rm(interval1 interval2 intervalN) ns(note1 note2 noteN)`

An example pattern could for instance be:

`rm(4 4 2) ns(c4 c4 c3)`

A central concept in `re<urse` is that functions defined sequentially like in the example above, create a "chain" where one function operates on the output of the previous one. In the above example, rm creates a set of rhythmic intervals, which ns then assigns note values. Without this second step, you wouldn't get any output. At this point, it's reasonable to ask why these two functions are separated at all, since they need to be nested together in order to produce output. The reason is that it enables you to simplify things by only writing out the relevant bits of your sequence. For instance, let's say you want to create a simple melody where the rhythm remains constant throughout:

`rm(4 2) ns(c4 d4 e4 f4 g4 a4 b4)`

This will produce a simple scale walk where each note alternates between having a duration of four and two sixteenth notes respectively. In other words, one quarter note and one eighth note. This is because the default resolution when specifying intervals is a sixteenth note. You can however also specify fractions, and you can nest intervals to do more complex things rhythmically, but we're getting ahead of ourselves. Furthermore, the pattern will last for 4 bars (or 64 sixteenth notes), since this is the default pattern length. This can be changed using the length() function if you want to create longer or shorter patterns.

Another reason why it's useful to specify note pitches and durations individually is that you can easily experiment with polyrhythmic sequences this way. You could for instance specify 3 durations and 4 pitches for a type of evolving sequence where the pitch and duration will map up differently for each iteration, until they wrap around and match up again, before drifting out of sync again, and so on. Another way of creating evolving sequences in `re<urse` is to include one or more alternating values:

`rm(4 4 4'6'8 2) ns(c4 c4 c3)`

The three values separated by apostrophes specify an alternating interval, meaning that the interval alternates between the values 4, 6, and 8. This would result in a pattern with the intervals `4,4,4,2 4,4,6,2 4,4,8,2 4,4,4,2 ...` and so on depending on the length of the generated sequence. In this case, the third interval in our sequence will alternate between 4, 6, and 8. You could do the same thing with notes, specifying for instance `c4'e4'g4` to alternate between these three notes at any step in the sequence. Another way of specifying an alternating sequence would be to use the alt-function. Instead of saying `4'6'8`, you could instead say `alt(4 6 8)`. Why would you want to specify it in this manner? Because it gives you more flexibility to generate more complex patterns, because you could nest several alt-expressions inside one another. For instance, consider the sequence `rm(1 alt(2 3 alt(4 5 6)))` which would result in the interval sequence `1,2 1,3 1,4 1,2 1,3 1,5 1,2 1,3 1,6 ...` and so on. Lastly, since the inner alt-expression does not itself contain any other alt expressions (although it could perfectly well have as many as you'd like), it could be simplified to read `rm(1 alt(2 3 4'5'6))`. The primary focus of `re<urse` is to be as short and succinct as possible, so that you can express complex ideas without typing yourself to death. However, if you prefer a more readable syntax, you could write out the syntax in full. The following syntax is also perfectly valid for instance: `rhythm(1 alternate(2 3 4'5'6))`. So far, we've only seen basic examples using only two functions, so let's look at something slightly more involved:

`rm(4x3 6) ns(c3) even transpose(2 4 6)`

Several constructs are at work in this statement. First of all, we're using the x operator which means repeat. In other words, `4x3` is the same as specifying `4 4 4`. Moving on, we find a note set containing only one note, meaning that all notes will be assigned c3. The next operator introduces a new concept called selections. The even operator creates a selection containing all even elements. In the sequence specified above this would mean that every second element becomes part of the selection, in this case 4 and 6. Any operators appended after this would modify just these elements, and leave the others unchanged. The above code would transpose our static c3 note for every other step, resulting in the sequence `c3,d3,c3,e3,c3,f#3`).

I mentioned nested intervals before, let's have a quick look at what that's all about:

`rm(32(1x8) 16(1x8) 8(1x8) 4(1x8) 4(1x16)) ns(c3)`

So, what's going on with all these extra parentheses? This is an example of nesting, and it's a powerful feature which lets you specify intervals inside another interval. What's powerful about this is that it allows you to define a block of a given duration, and then decide how this block will be split up. For instance, you could define an interval lasting for a quarter note, and then put three equally sized intervals nested inside it, to produce eigth note triplets:

`rm(4(1 1 1)) ns(c3)`

Remember that the values specified in the nested values are calculated relative to their parent interval, so they can be seen as proportional. Therefore, the sequence below is equivalent:

`rm(4(2 2 2)) ns(c3)`

However, if you instead did something like this:

`rm(4(1 1 2)) ns(c3)`

It would mean that the third interval would be twice the length of the first two. Working with intervals this way can be a nice way of achieving unique sounding rhythmic patterns which would be very difficult to achieve in a traditional step sequencing or piano roll environment. That is, unless your step sequencer of choice features ratcheting, such as the retrig functionality featured in many of Elektrons products. However, `re<urse` goes way beyond this functionality when you consider the fact that nested intervals can contain much more than just a simple repeated interval. This wraps up our basic introduction to `re<urse`. More detailed docs will follow at a later date :)

