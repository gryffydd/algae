/*
 * I have always wanted to simulate the Three Body Problem
 *
 */

let SPACE = 1000;
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
    bodies = new Bodies();
}

function draw() {
    // background(color(0, 0, 0, 3));

    bodies.display();
    bodies.move();
    // bodies.limit_extent();
    bodies.apply_gravity();
    bodies.pan_and_zoom();

    if (mouseIsPressed) { noLoop(); }

    /* Iterate a number of times before stopping - while testing */
    // if (frameCount > 50) { noLoop(); }
}


function nice_color () {
    let r = int(random(128)) + 128;
    let g = int(random(128)) + 128;
    let b = int(random(128)) + 128;

    return color(r, g, b,);
}


function draw_center_circles (c, s) {
    noFill();
    stroke(color(0, 17, 0, 17));
    let radius = SPACE * s / 2;
    for (i = 1; i < 5; i++) {
        circle(c.x, c.y, radius);
        radius *= 2;
    }
}

let Bodies = function() {
    this.scale = 1.0;
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
        // draw_center_circles (c, this.scale);

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

    this.pan_and_zoom = function() {
        let c = createVector(0, 0);
        let d = SPACE;
        for (let i = 0; i < this.bodies.length; i++) {
            c.add(this.bodies[i].position);
        }
        c.div(this.bodies.length);
        for (let i = 0; i < this.bodies.length; i++) {
            d = max(d, c.dist(this.bodies[i].position));
        }
        // if (d > SPACE * 50) { noLoop(); }
        this.scale = max(0.05, (this.scale + (SPACE / d)) / 2);
        c.sub(this.center);
        if (c.mag() > SPACE / 5) {
            // console.log(c.mag());
            d = (c.mag() - SPACE / 5) / 10;
            c.normalize();
            c.mult(d);
            this.center.add(c);
        }
    }

    this.limit_extent = function() {
        let c = createVector(0, 0);
        let d = 0;
        for (let i = 0; i < this.bodies.length; i++) {
            c.add(this.bodies[i].position);
        }
        c.div(this.bodies.length);
        for (let i = 0; i < this.bodies.length; i++) {
            d = max(d, c.dist(this.bodies[i].position));
        }
        if (d > SPACE * 9) {
            console.log(d);
        }
        if (d > SPACE * 10) {
            for (let i = 0; i < this.bodies.length; i++) {
                if (d == c.dist(this.bodies[i].position)) {
                    console.log("Teleport " + i);
                    console.log(this.bodies[i].position);
                    this.bodies[i] = new Body();
                    this.bodies[i].position.add(c);
                    console.log(this.bodies[i].position);
                }
            } 
        }
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
