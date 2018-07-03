# algae
A sandbox for a project started nearly 20 years ago.

## Current
My son introduced me to `p5.js` and it has inspired me to have another go
at the problem space.  So initially, I want to replicate what I wrote in
Delphi.

## Installation
Download https://github.com/processing/p5.js/releases/download/0.6.1/p5.zip
or a later one if that is your preference.  Version 0.6.1 (April 27, 2018).

Open algae.html in your web browser.

### Quick Setup
```
git clone https://github.com/gryffydd/algae
cd algae

# get p5.js dependancy - Version 0.6.1 (April 27, 2018)
wget https://github.com/processing/p5.js/releases/download/0.6.1/p5.js
```

## Recent History
### Simple Weighted Probability
The original implementation had equally weighted probabilities.  The density
of pixels was always going to stay about the same.  Occasionally, random
advantages gained over time would cause one colour to gain a greater proportion
of the count and over many iterations only one colour would remain, but this
was many iterations.  The general distribution of the colours was quite
dispersed.

### Sum of the Squares
The next simple improvement to the algorithm was to square the weights for
each colour.  This had a marked effect and was closer to what I had originally
suspected would (althought it didn't).  There were distinct borders for the
colours and stable patterns emerged.  If a colour were to 'connect' to form a
band, this would be very stable.  Depending on the random distribution of the
initial seeds, a stable set of two or three (rarely four) bands could form.
I imagine that over time, one band of colour could dominate, but I haven't
seen this happen much.  If three colours were to meet the colour with the
straighter line would dominate, squeezing out the other two colours.  Hence,
a colour that had a stable 'band' would eventually wipe out the other two
colours.

### Exponentiation
If you can sum the squares, you can sum something less than a square, therefore
exponents.  Calling this Mate's Rate (`MATES_RATE`) it was found that a very
small advantage (`1.1`) could bring on this behaviour.  A value of `1.2` was
not that different to `2.0` in the way that the cells 'clumped' together.
Interstingly, value of less than `1.0` caused an extreme version of the diffused
behaviour shown in the 'Simple Weighted' initial version.

### Aging and Weakening
Implementing an advantage/disadvantage for Age created another interesting
effect.  Without Exponential advantage, younger cells that were weaker had the
same characteristic as the 'Sum of the Squares' approach forming barriers or
rather borders around the territory claimed.  Older Stronger cells would hold
on to territory and the configuration was pretty stable.  A variant that had
Older Weaker cells created the diffused behaviour as previously observed.
The really interesting behaviour that has been created at the time of this edit
is a simple `1 + (MAX_AGE - Age) / 8` (as an intger) with a `MATES_RATE = 1.5`.
This creates a field of cells that hold for a while until they are overrun by
a bunch of Younger cells, which in turn age and are overrun themselves.  At
the time of writting this I am watching green and purple oscilate as the
dominate colour.

### Next Steps
I would like to see what effect a tribal advantage would have on the way
colours behave.  I am hoping that it will be similar to the current Age
effect, but with different colours chasing each other around the map.
I suspect that the elimination of a colour might cause one colour to become
dominant quickly and it may not be as interesting as first thought.  It may
be that the 'Aging and Weakening' scenario is in fact the more interesting of
the simulations.

## Ancient History
First written in Delphi using Conway's Game of Life as inspiration.
The implementation made pretty pictures that (initially) looked like algae.

The delphic code has been checked in for reference, although the forms and
resources have not.  Probably not an issue as it will never be compiled.
The latest date stamp on the files was 2001/04/07.

The version control used was numbered copies of folders. The earliest
timestamp is 1999/12/30, so this must have been a Christmas Holidays
project.  I probably got a Borland Delphi compiler for Christmas...

## Reference
 * https://p5js.org/
 * https://en.wikipedia.org/wiki/Algae
 * https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

----
