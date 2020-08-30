/*
 * I have always wanted to simulate the Three Body Problem
 *
 */

let MASS = 10;
let bodies;
let BODY_COUNT = 3;

let padding = 20;
let c_width;
let c_height;

function setup() {
    c_width = windowWidth - padding;
    c_height = windowHeight - padding;
    createCanvas(c_width, c_height);
    background(0);
    bodies = [];
    for (b = 0; b < BODY_COUNT; b++) {
        bodies.push(new Body());
    }
}

function draw() {
    background(color(0, 0, 0, 3));

    for (let b = 0; b < bodies.length; b++) {
        bodies[b].display();
    }

    for (let b = 0; b < bodies.length; b++) {
        bodies[b].move();
    }

    apply_gravity(bodies);

    center(bodies);

    /* Iterate a number of times before stopping - while testing */
    // if (frameCount > 50) { noLoop(); }
}

let Body = function() {
    let width = c_width * random(0.05, 0.95);
    let height = c_height * random(0.05, 0.95);

    let r = int(random(64)) + 192;
    let g = int(random(64)) + 192;
    let b = int(random(64)) + 192;

    this.color = color(r, g, b,);

    this.position = createVector(width, height);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.mass = int(MASS * (1 + random(3)));

    this.display = function() {
        let x = this.position.x;
        let y = this.position.y;
        let m = this.mass;
        fill(this.color);
        circle(x, y, m);
    }

    this.move = function() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}


function apply_gravity(bodies) {
    z = createVector(0, 0);
    for (let i = 0; i < bodies.length; i++) {
        for (let j = 0; j < bodies.length; j++) {
            if (i == j) { continue; }
            let b1 = bodies[i];
            let b2 = bodies[j];
            let d = b1.position.copy();
            d.sub(b2.position);
            // let g = (b2.mass / (d.dist(z) * d.dist(z))) * 1000;
            // if (g > 1) { console.log(i, j, g); }
            // g = min(1, g);
            d.normalize();
            // d.mult(g);
            d.div(b1.mass / MASS);
            b1.velocity.sub(d);
        }
    }
}

function center(bodies) {
    c = createVector(c_width / 2, c_height / 2);
    bc = createVector(0, 0);
    for (let b = 0; b < bodies.length; b++) {
        bc.add(bodies[b].position);
    }
    bc.div(bodies.length);
    if (bc.x < 0 || bc.x > c_width || bc.y < 0 || bc.y > c_height) {
        bc.sub(c);
        for (let b = 0; b < bodies.length; b++) {
            bodies[b].position.sub(bc);
        }
    }
}

/*
 * ---- End of Javascript ----
 */
