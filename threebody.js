/*
 * I have always wanted to simulate the Three Body Problem
 *
 */

let SPACE = 1000;
let MASS = 10;
let bodies;
let BODY_COUNT = 6;

let padding = 20;
let c_width;
let c_height;

function setup() {
    c_width = windowWidth - padding;
    c_height = windowHeight - padding;
    createCanvas(c_width, c_height);
    background(0);
    bodies = new Bodies();
}

function draw() {
    background(color(0, 0, 0, 3));

    bodies.display();
    bodies.move();
    bodies.apply_gravity();
    bodies.pan_and_scale();

    if (mouseIsPressed) { noLoop(); }

    /* Iterate a number of times before stopping - while testing */
    // if (frameCount > 50) { noLoop(); }
}


function nice_color () {
    let r = int(random(64)) + 192;
    let g = int(random(64)) + 192;
    let b = int(random(64)) + 192;

    return color(r, g, b,);
}


let Bodies = function() {
    this.scale = 1.0;
    this.scale = 0.2;
    this.center = createVector(0, 0);

    this.bodies = [];
    for (b = 0; b < BODY_COUNT; b++) {
        this.bodies.push(new Body());
    }

    this.apply_gravity = function() {
        let z = createVector(0, 0);
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = 0; j < this.bodies.length; j++) {
                if (i == j) { continue; }
                let b1 = this.bodies[i];
                let b2 = this.bodies[j];
                let d = b1.position.copy();
                d.sub(b2.position);
                let g = (b2.mass / (d.mag() * d.mag())) * SPACE;
                g = max(min(1, g), 0.00001);
                d.normalize();
                d.mult(g);
                b1.velocity.sub(d);
            }
        }
    }

    this.display = function() {
        let c = createVector(c_width / 2, c_height / 2);
        c.sub(this.center);
        // fill(color(0, 51, 0, 17));
        noFill();
        stroke(color(0, 51, 0, 17));
        circle(c.x, c.y, SPACE * 0.5 * this.scale);
        circle(c.x, c.y, SPACE * 1 * this.scale);
        circle(c.x, c.y, SPACE * 5 * this.scale);
        circle(c.x, c.y, SPACE * 10 * this.scale);

        c = createVector(c_width / 2, c_height / 2);
        for (let i = 0; i < this.bodies.length; i++) {
            let b = this.bodies[i];
            let pos = b.position.copy();
            pos.sub(this.center);
            pos.mult(this.scale);
            pos.add(c);
            fill(b.color);
            stroke(color(0, 0, 0, 128));
            circle(pos.x, pos.y, b.mass * this.scale);
        }
    }

    this.move = function() {
        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].move();
        }
    }

    this.pan_and_scale = function() {
        let c = createVector(0, 0);
        let d = SPACE;
        for (let i = 0; i < this.bodies.length; i++) {
            c.add(this.bodies[i].position);
        }
        c.div(this.bodies.length);
        for (let i = 0; i < this.bodies.length; i++) {
            d = max(d, c.dist(this.bodies[i].position));
        }
        this.scale = max(0.02, (this.scale + (SPACE / d)) / 2);
        c.sub(this.center);
        c.div(5);
        this.center.add(c);
    }
}


let Body = function() {
    this.color = nice_color();
    this.position = createVector(SPACE * random(-0.5, 0.5), SPACE * random(-0.5, 0.5));
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


/*
 * ---- End of Javascript ----
 */
