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
var MAX_TRIBE = 6;

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


/*
 * Neighbours are the cells from +/- 2 cells around a cell.
 * The neighbour weight is described above, weight could be generated
 * as the count of heads/tails permutations over 4 coin tosses.
 */

var WEIGHT = [1, 4, 6, 4, 1]
var NEIGHBOUR_OFFSET = new Array(WEIGHT.length * WEIGHT.length);
var NEIGHBOUR_WEIGHT = new Array(WEIGHT.length * WEIGHT.length);
var NEIGHBOUR_WEIGHT_TOTAL = 256; /* This will be recalculated in init_constants */

function init_constants () {
  var wl = WEIGHT.length;
  var sum = 0;
  for (var x = 0; x < wl; x++) {
    for (var y = 0; y < wl; y++) {
      NEIGHBOUR_OFFSET[x + y * wl] = (x - 2 + (y - 2) * WIDTH + cells.length) % cells.length;
      NEIGHBOUR_WEIGHT[x + y * wl] = WEIGHT[x] * WEIGHT[y];
      sum += WEIGHT[x] * WEIGHT[y];

      print(NEIGHBOUR_OFFSET[x + y * wl] + ' -> ' + NEIGHBOUR_WEIGHT[x + y * wl]);
    }
  }
  NEIGHBOUR_WEIGHT_TOTAL = sum;
}


/*
 * Initialise the space.  I initially had 3 colours and randomly created 10
 * cells with a random colour.  This time I am going to create MAX_TRIBE (6)
 * random points, with one for each tribe.
 */

function init_cells () {
  /* Fill with empty cells */
  for (var i = 0; i < cells.length; i++) {
    cells[i] = new Cell();
  }

  /*
   * Place one tribe randomly in the space, note there is a possibility of
   * overwriting a previous placement
   */
  for (var t = 1; t <= MAX_TRIBE; t++) {
    i = floor(random(cells.length));
    // print(i);
    cells[i].spawn(t);
  }
}

function iterate_cells () {
  print("frameCount: " + frameCount);
  var new_cells = new Array(cells.length);
  var tribe_weight = new Array(MAX_TRIBE + 1);

  /* For each cell work out what happens */
  for (var c = 0; c < cells.length; c++) {
    new_cells[c] = new Cell();
    new_cells[c].tribe = cells[c].tribe;
    new_cells[c].age = cells[c].age;

    /* Zero the tribe weights */
    for (var t = 0; t < tribe_weight.length; t++) {
      tribe_weight[t] = 0;
    }
    /* Sum the weight of the neighbours */
    for (var n = 0; n < NEIGHBOUR_OFFSET.length; n++) {
      var nc = cells[(c + NEIGHBOUR_OFFSET[n]) % cells.length];
      tribe_weight[nc.tribe] += NEIGHBOUR_WEIGHT[n];
    }

    /* Pick a random point on the distribution */

    var which_tribe = random(NEIGHBOUR_WEIGHT_TOTAL);
    for (var t = 0; t < tribe_weight.length; t++) {
      which_tribe -= tribe_weight[t];
      if (which_tribe < 0) {
        if (t == NO_TRIBE || cells[c].tribe == t) {
          new_cells[c].survived();
        } else {
          new_cells[c].spawn(t); 
        }
        // print('Cell: ' + c + ', Tribe: ' + t + ' -> ' + tribe_weight[t]);
        break;
      }
    }
  }

  /* Point the cells array to the new array */
  cells = new_cells;
}


/*
 * These are variables/constants related to the display of the cells
 */

var CELL_SIZE = 10;
var TRIBE_COLOUR = [ "#000000",
    "#0000FF", "#00FF00", "#00FFFF", "#FF0000", "#FF00FF", "#FFFF00" ];


/*
 * This is the guts of the display of the current state of the list of cells
 */


function setup() {
  createCanvas(WIDTH * CELL_SIZE, HEIGHT * CELL_SIZE);

  /* Initialise constants that can be determined programtically */
  init_constants();

  /* Initialise the environment - put down 6 random tribes */
  init_cells();
}

function draw() {
  for (var i = 0; i < cells.length; i++) {
    x = (i % WIDTH) * CELL_SIZE;
    y = floor(i / WIDTH) * CELL_SIZE;
    fill(TRIBE_COLOUR[cells[i].tribe]);
    rect(x, y, CELL_SIZE, CELL_SIZE);
  }

  iterate_cells();

  /* Iterate a number of times before stopping - while testing */
  // if (frameCount > 50) { noLoop(); }
}

/*
 * ---- End of Javascript ----
 */
