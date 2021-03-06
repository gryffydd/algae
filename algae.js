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
var HEIGHT = 80;
var CELL_SIZE = 10;
var TIC = 0;
var TOC = 1;

/* A helper function to set an array to a value */

function set_array (a, v) {
  for (i = 0; i < a.length; i++) { a[i] = v; }
}

/* 
 * The maximum age was intened to clear space for regrowth.  It didn't have
 * this effect, but it did look cool, so I am keeping it.
 */

var MAX_AGE = 64;
var age_advantage = new Array(MAX_AGE);

function init_age_advantage () {
  set_array(age_advantage, 1);
  for (var i = 0; i < age_advantage.length; i++) {
    age_advantage[i] = 1 + floor((MAX_AGE - i) / 8);
  }
}

/* 
 * The idea of Algae was that there was a clear petri dish and things would
 * grow in/on it.  Again this didn't happen as expected, but that is why we code
 * simulations.  Initially, there are no tribes, just empty space, hence zero.
 */

var NO_TRIBE = 0;
var MAX_TRIBE = 6;
var tribe_weight = new Array(MAX_TRIBE + 1);
var tribal_advantage = new Array((MAX_TRIBE + 1) * (MAX_TRIBE + 1));

function adjacent_tribe (tribe, step) {
  return (tribe + step - 1) % MAX_TRIBE + 1;
}

function step_weight (step) {
  return 2 - (step / (MAX_TRIBE - 1));
}

function set_tribal_advantage (attacker, defender, value) {
  tribal_advantage[attacker * (MAX_TRIBE + 1) + defender] = value;
}

function init_tribal_advantage () {
  set_array(tribal_advantage, 1);
  for (t = 1; t <= MAX_TRIBE; t++) {
    for (s = 1; s < MAX_TRIBE; s++) {
      set_tribal_advantage(t, adjacent_tribe(t, s), step_weight(s));
    }
  }
}

function get_tribal_advantage (attacker, defender) {
  return tribal_advantage[attacker * (MAX_TRIBE + 1) + defender];
}

/* This allows for a graduated colour scale from white to black at SHADES by two levels */
var SHADES = 255 / 5;
var STEPS = 255 / SHADES;
var TOP_LEVEL = MAX_AGE + 2;

function tribe_colour(tribe, level) {
  var colour = [0, 0, 0];
  if (tribe == NO_TRIBE) { return colour; }
  var mask = [4, 2, 1];
  var first = max(min(level, SHADES), 0) * STEPS;
  var other = max(min((level - SHADES), SHADES), 0) * STEPS;
  for (var c = 0; c < colour.length; c++) {
    if ((tribe & mask[c]) > 0) { colour[c] = first; } else { colour[c] = other; }
  }
  return colour;
}

/* These are the colours that are used for the report */
var REPORT_BACKGROUND = 75;
var REPORT_LINE = 30;
var REPORT_DEAD = 20;

var REPORT_TOP = (HEIGHT + 1) * CELL_SIZE;
var REPORT_BASE = REPORT_TOP + MAX_AGE;

/*
 * The idea that with more of the surrounding cells occupied there should be
 * an advantage can be implimented with a exponential weighting of the tribe's
 * weight.  I'll call this mate's rate.
 */

var MATES_RATE = 2;

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
    if (this.tribe == NO_TRIBE || this.age >= MAX_AGE) {
      /* Stay Dead or Die anyway... */
      this.tribe = NO_TRIBE;
      this.age = 0;
    }
  }

  this.colour = function () {
    return tribe_colour(this.tribe, TOP_LEVEL - this.age);
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
 * WEIGHT = N! / (n! * (N-n)!)
 */

var WEIGHT = [1, 4, 6, 4, 1];
var NEIGHBOUR_OFFSET = new Array(WEIGHT.length * WEIGHT.length);
var NEIGHBOUR_WEIGHT = new Array(WEIGHT.length * WEIGHT.length);

function init_weights () {
  var cl = CELLS[TIC].length;
  var wl = WEIGHT.length;
  var wl2 = floor(wl / 2);
  for (var x = 0; x < wl; x++) {
    for (var y = 0; y < wl; y++) {
      NEIGHBOUR_OFFSET[x + y * wl] = (x - wl2 + (y - wl2) * WIDTH + cl) % cl;
      NEIGHBOUR_WEIGHT[x + y * wl] = WEIGHT[x] * WEIGHT[y];
    }
  }
}

function neighbour_weight_report (left, top) {
  var size = 64;
  var w = WEIGHT.length;
  var l = left + 2;
  var t = top + 2;
  var c;
  var m = max(NEIGHBOUR_WEIGHT);
  var s = 12;

  fill([204, 204, 204]);
  noStroke();
  rect(left, top, size, size);

  for (var x = 0; x < w; x++) {
    for (var y = 0; y < w; y++) {
      c = int((1 - (NEIGHBOUR_WEIGHT[x + y * w] / m)) * 128) + 32;
      fill([c, c, c]);
      rect(l + x * s, t + y * s, s, s);
    }
  }

  return size;
}

function age_advantage_report (left, top) {
  var size = (MAX_AGE + 2) * 2;
  var w = MAX_AGE;
  var l = left + 2;
  var t = top + 2;
  var c;
  var m = max(age_advantage);
  var s = 2;
  var h = 28;

  fill([204, 204, 204]);
  noStroke();
  rect(left, top, size, 32);

  for (var x = 0; x < w; x++) {
      c = int((1 - (age_advantage[x] / m)) * 128) + 32;
      fill([c, c, c]);
      rect(l + x * s, t, s, h);
  }

  return size;
}

function mates_rates_report (left, top) {
  var size = 32;
  var l = left + 2;
  var t = top + 2;
  var w = 30;
  var h = 60;
  var m = (2 - MATES_RATE) * 40 - 2;

  fill([204, 204, 204]);
  noStroke();
  rect(left, top, size, size * 2);

  fill([192, 192, 192]);
  rect(l, t, w, h);

  fill([160, 160, 160]);
  rect(l, t + 42, w, h - 42);

  fill([128, 128, 128]);
  rect(l, t, w, 2);
  rect(l, t + 20, w, 2);
  rect(l, t + 40, w, 2);

  fill([64, 64, 64]);
  rect(l + 12, t + m, 6, 6);

  return size;
}

function tribal_advantage_report (left, top) {
  var size = 64;
  var w = MAX_TRIBE + 1;
  var l = left + 2;
  var t = top + 2;
  var c;
  var m = max(tribal_advantage);
  var s = 10;

  fill([204, 204, 204]);
  noStroke();
  rect(left, top, size, size);

  for (var x = 1; x < w; x++) {
    for (var y = 1; y < w; y++) {
      c = int((1 - (tribal_advantage[x + y * w] / m)) * 128) + 32;
      fill([c, c, c]);
      rect(l + (x - 1) * s, t + (y - 1) * s, s, s);
    }
  }

  return size;
}

function static_values_report () {
  /* Top Left for the report graphics */
  var width = 64 + CELL_SIZE + 132 + CELL_SIZE + 32 + CELL_SIZE + 64;
  var left = (WIDTH - 1) * CELL_SIZE - width;
  var top = (HEIGHT + 1) * CELL_SIZE;

  /* Grid for the Neighbour Weight */
  left += neighbour_weight_report(left, top) + CELL_SIZE;

  /* Bar for the Age Advantage */
  left += age_advantage_report(left, top + 16) + CELL_SIZE;

  /* Bar for the Mates Rates */
  left += mates_rates_report(left, top) + CELL_SIZE;

  /* Grid for the Tribal Advantage */
  left = tribal_advantage_report(left, top);
}

/*
 * This is the function that does all the work.  It calculates the probability
 * of the next generation of cells based on proximity to other cells.
 */

function iterate_cells () {
  var cells = CELLS[TIC];
  var new_cells = CELLS[TOC];
  var total_weight;

  set_array(report, 0);

  /* For each cell work out what happens */
  for (var c = 0; c < cells.length; c++) {
    /* Zero the tribe weights */
    set_array(tribe_weight, 0);

    /* Sum the weight of the neighbours */
    for (var n = 0; n < NEIGHBOUR_OFFSET.length; n++) {
      var nc = cells[(c + NEIGHBOUR_OFFSET[n]) % cells.length];
      tribe_weight[nc.tribe] += NEIGHBOUR_WEIGHT[n] * age_advantage[nc.age];
    }

    /* Exponentiate the weightings because you may be more powerful with mates */
    base_weight = 0;
    total_weight = 0;
    for (var t = 1; t < tribe_weight.length; t++) {
      base_weight += tribe_weight[t];
      tribe_weight[t] = tribe_weight[t] ** MATES_RATE;
      tribe_weight[t] *= get_tribal_advantage(t, cells[c].tribe);
      total_weight += tribe_weight[t];
    }
    /* Normalise the weight of the dead spaces */
    tribe_weight[0] *= (total_weight / base_weight);
    total_weight += tribe_weight[0];

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
 * This is the guts of the display of the current state of the list of cells
 */

function draw_cells (cells) {
  var cells = CELLS[TIC];
  stroke(0);
  for (var i = 0; i < cells.length; i++) {
    var x = (i % WIDTH) * CELL_SIZE;
    var y = floor(i / WIDTH) * CELL_SIZE;
    fill(cells[i].colour());
    rect(x, y, CELL_SIZE, CELL_SIZE);
  }
}

function draw_report (report) {
  for (var t = 1; t <= MAX_TRIBE; t++) {
    var still_alive = false;
    var left = (t - 1) * (MAX_AGE + CELL_SIZE) + CELL_SIZE;
    fill(tribe_colour(t, REPORT_BACKGROUND));
    noStroke();
    rect(left, REPORT_TOP, MAX_AGE, MAX_AGE);
    stroke(tribe_colour(t, REPORT_LINE));
    for (var a = 0; a < MAX_AGE; a++) {
      var pop_age = report[t * MAX_AGE + a];
      if (pop_age > 0) {
        still_alive = true;
        line(left + a, REPORT_BASE, left + a, max(REPORT_TOP, REPORT_BASE - pop_age));
      }
    }
    if (! still_alive) {
      fill(tribe_colour(t, REPORT_DEAD));
      noStroke();
      rect(left, REPORT_TOP, MAX_AGE, MAX_AGE);
    }
  }
}

function setup() {
  createCanvas(WIDTH * CELL_SIZE + 1, HEIGHT * CELL_SIZE + MAX_AGE + CELL_SIZE * 2);

  /* Initialise constants that can be determined programtically */
  init_weights();
  init_age_advantage();
  init_tribal_advantage();

  /* Initialise the environment - put down 6 random tribes */
  seed_plate(CELLS[TIC]);

  /* Reports on initial (static) settings */
  static_values_report();
}

function draw() {
  draw_cells(CELLS[TIC]);
  draw_report(report);

  iterate_cells();

  /* Iterate a number of times before stopping - while testing */
  // if (frameCount > 50) { noLoop(); }
}

/*
 * ---- End of Javascript ----
 */
