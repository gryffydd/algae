/*
 * Algae is based on Conway's Game of Life - a simple Finite State Automata
 *
 * The idea is that the cell survives or dies based on it's neighbours.
 * But what if your survival was determined by the amount of support you
 * got from your neighbours.  This sort of works if you weight the probability
 * of survival based on a normal distribution of the neighbours.
 *
 * In one dimension this would be `(1, 4, 6, 4, 1) / 16` chances for neighbours
 * (N-2, N-1, N, N+1, N+2).  This has been coded in the delphic version of the
 * code so I will not elaborate further.
 */

/*
 * We will use a physical one-dimensional array that is referenced as a logical
 * two-dimensional array `(index = y * width +x)`.
 */

var WIDTH = 20;
var HEIGHT = 20;
var cells = new Array(WIDTH * HEIGHT);

/*
 * The idea of a cell is that it has a 'Tribe' and an 'Age'.  In the earlier
 * version memory was scarce and so the cell was represented in bytes.  Now
 * we no longer care because we have memory to burn, so this will be an Object.
 */

/* 
 * The maximum age was intened to clear space for regrowth.  It didn't have
 * this effect, but it did look cool, so I am keeping it.
 */
var MAX_AGE = 64;

/* 
 * The idea of Algae was that there was a clear petri dish and things would
 * grow in/on it.  Again this didn't happen as expected, but that is why code
 * simulations.  Initially, there are no tribes or empty space, hence zero.
 */
var NO_TRIBE = 0;

function Cell () {
  this.tribe = NO_TRIBE;
  this.age = 0;

  this.spawn = function (tribe) {
    this.tribe = tribe;
    this.age = 0;
  }

  this.survived = function () {
    this.age += 1;
    if (this.age >= MAX_AGE) {
      this.tribe = NO_TRIBE;
      this.age = 0;
    }
  }
}


function setup() {
  createCanvas(200, 50);
  textSize(30);
  textAlign(CENTER);
  background(204);
  text("algae", width / 2, height / 2);
}

function draw() {
}
