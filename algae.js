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
 * two-dimensional array `(index = y * width + x)`.
 */

var WIDTH = 80;
var HEIGHT = 40;
var TIC = 0;
var TOC = 1;

/* 
 * The maximum age was intened to clear space for regrowth.  It didn't have
 * this effect, but it did look cool, so I am keeping it.
 */

var MAX_AGE = 64;

/* 
 * The idea of Algae was that there was a clear petri dish and things would
 * grow in/on it.  Again this didn't happen as expected, but that is why we code
 * simulations.  Initially, there are no tribes, just empty space, hence zero.
 */

var NO_TRIBE = 0;
var MAX_TRIBE = 6;
var tribe_weight = new Array(MAX_TRIBE + 1);

function tribe_colour(tribe, level) {
  var colour = [0, 0, 0];
  var mask = [4, 2, 1];
  for (var c = 0; c < colour.length; c++) {
    if ((tribe & mask[c]) > 0) { colour[c] = level; }
  }
  return colour;
}

/*
 * The idea that with more of the surrounding cells occupied there should be
 * an advantage can be implimented with a exponential weighting of the tribe's
 * weight.  I'll call this mate's rate.
 */

var MATES_RATE = 1.1;

/*
 * The idea of a cell is that it has a 'Tribe' and an 'Age'.  In the earlier
 * version memory was scarce and so the cell was represented in bytes.  Now
 * we no longer care because we have memory to burn, so this will be an Object.
 */

function Cell () {
  this.tribe = NO_TRIBE;
  this.age = 0;

  this.spawn = function (tribe) {
    this.tribe = tribe;
    this.age = 0;
  }

  this.survived = function (cell) {
    this.tribe = cell.tribe;
    this.age = cell.age + 1;
    if (this.age >= MAX_AGE) {
      this.tribe = NO_TRIBE;
      this.age = 0;
    }
  }

  this.tribe_colour = function (level) {
    var colour = [0, 0, 0];
    var mask = [4, 2, 1];
    for (var c = 0; c < colour.length; c++) {
      if ((this.tribe & mask[c]) > 0) { colour[c] = level; }
    }
    return colour;
  }

  this.colour = function () {
    var level = 255 - (256 / MAX_AGE) * this.age;
    return this.tribe_colour(level);
  }
}

/*
 * Keep a tally of the cells and their ages.  Plot it.
 */

var report = new Array(MAX_AGE * (MAX_TRIBE + 1))

/*
 * This function generates a plate of empty cells.
 */

function empty_plate (width, height) {
  var plate = new Array(width * height);
  for (var c = 0; c < plate.length; c++) {
    plate[c] = new Cell();
  }
  return plate;
}

/*
 * Initialise the space.  I initially had 3 colours and randomly created 10
 * cells with a random colour.  This time I am going to create MAX_TRIBE (6)
 * random points, with one for each tribe.
 */

function seed_plate (plate) {
  for (var t = 1; t <= MAX_TRIBE; t++) {
    plate[floor(random(plate.length))].spawn(t);
  }
}

var CELLS = new Array(empty_plate(WIDTH, HEIGHT), empty_plate(WIDTH, HEIGHT));

/*
 * Neighbours are the cells from +/- 2 cells around a cell.
 * The neighbour weight is described above, weight could be generated
 * as the count of heads/tails permutations over 4 coin tosses.
 */

var WEIGHT = [1, 4, 6, 4, 1]
var NEIGHBOUR_OFFSET = new Array(WEIGHT.length * WEIGHT.length);
var NEIGHBOUR_WEIGHT = new Array(WEIGHT.length * WEIGHT.length);
var NEIGHBOUR_WEIGHT_TOTAL; /* This will be calculated in init_weights */

function init_weights () {
  var cl = CELLS[TIC].length;
  var wl = WEIGHT.length;
  var wl2 = floor(wl / 2);
  var w;
  NEIGHBOUR_WEIGHT_TOTAL = 0;
  for (var x = 0; x < wl; x++) {
    for (var y = 0; y < wl; y++) {
      NEIGHBOUR_OFFSET[x + y * wl] = (x - wl2 + (y - wl2) * WIDTH + cl) % cl;
      w = WEIGHT[x] * WEIGHT[y];
      NEIGHBOUR_WEIGHT[x + y * wl] = w;
      NEIGHBOUR_WEIGHT_TOTAL += w;
    }
  }
}

/*
 * A little function to set an array with all zeros
 */

function zero_array (a) {
  for (i = 0; i < a.length; i++) {
    a[i] = 0;
  }
}

/*
 * This is the function that does all the work.  It calculates the probability
 * of the next generation of cells based on proximity to other cells.
 */


function iterate_cells () {
  var cells = CELLS[TIC];
  var new_cells = CELLS[TOC];
  var total_weight;

  zero_array(report);

  /* For each cell work out what happens */
  for (var c = 0; c < cells.length; c++) {
    /* Zero the tribe weights */
    zero_array(tribe_weight);

    /* Sum the weight of the neighbours */
    for (var n = 0; n < NEIGHBOUR_OFFSET.length; n++) {
      var nc = cells[(c + NEIGHBOUR_OFFSET[n]) % cells.length];
      tribe_weight[nc.tribe] += NEIGHBOUR_WEIGHT[n];
    }

    /* Exponentiate the weightings because you may be more powerful with mates */
    total_weight = 0
    for (var t = 0; t < tribe_weight.length; t++) {
      tribe_weight[t] = tribe_weight[t] ** MATES_RATE;
      total_weight += tribe_weight[t];
    }

    /* Pick a random point on the distribution */
    var which_tribe = random(total_weight);
    for (var t = 0; t < tribe_weight.length; t++) {
      which_tribe -= tribe_weight[t];
      if (which_tribe < 0) {
        if (t == NO_TRIBE || cells[c].tribe == t) {
          new_cells[c].survived(cells[c]);
        } else {
          new_cells[c].spawn(t); 
        }
        break;
      }
    }

    /* Count the cells and their ages */
    report[new_cells[c].tribe * MAX_AGE + new_cells[c].age] += 1;
  }

  /* Swap the arrays of interest with a simple TIC/TOC switch */
  TIC = TOC;
  TOC = 1 - TIC;
}


/*
 * These are variables/constants related to the display of the cells
 */

var CELL_SIZE = 10;

/*
 * This is the guts of the display of the current state of the list of cells
 */

function setup() {
  createCanvas(WIDTH * CELL_SIZE + 1, HEIGHT * CELL_SIZE + MAX_AGE + 20);

  /* Initialise constants that can be determined programtically */
  init_weights();

  /* Initialise the environment - put down 6 random tribes */
  seed_plate(CELLS[TIC]);
}

function draw() {
  var cells = CELLS[TIC];
  stroke(0);
  for (var i = 0; i < cells.length; i++) {
    x = (i % WIDTH) * CELL_SIZE;
    y = floor(i / WIDTH) * CELL_SIZE;
    fill(cells[i].colour());
    rect(x, y, CELL_SIZE, CELL_SIZE);
  }

  var base = (HEIGHT + 1) * CELL_SIZE + MAX_AGE;

  for (var t = 1; t <= MAX_TRIBE; t++) {
    fill(tribe_colour(t, 102));
    noStroke();
    rect((t - 1) * (MAX_AGE + CELL_SIZE) + CELL_SIZE, (HEIGHT + 1) * CELL_SIZE, MAX_AGE, MAX_AGE);
    stroke(tribe_colour(t, 255));
    var left = (t - 1) * (MAX_AGE + CELL_SIZE) + CELL_SIZE;
    for (var a = 0; a < MAX_AGE; a++) {
      if (report[t * MAX_AGE + a] > 0) {
        line(left + a, base, left + a, max(base - MAX_AGE, base - report[t * MAX_AGE + a]));
      }
    }
  }

  iterate_cells();

  /* Iterate a number of times before stopping - while testing */
  // if (frameCount > 50) { noLoop(); }
}

/*
 * ---- End of Javascript ----
 */
