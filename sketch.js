/*
Week 5 — Example 5: Side-Scroller Platformer with JSON Levels + Modular Camera

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows | Jump: Space

Learning goals:
- Build a side-scrolling platformer using modular game systems
- Load complete level definitions from external JSON (LevelLoader + levels.json)
- Separate responsibilities across classes (Player, Platform, Camera, World)
- Implement gravity, jumping, and collision with platforms
- Use a dedicated Camera2D class for smooth horizontal tracking
- Support multiple levels and easy tuning through data files
- Explore scalable project architecture for larger games
*/

// COSMIC DRIFT
// Meditative Camera Experience
// World larger than screen
// Slow pacing + hidden discoveries + hidden collectibles

const VIEW_W = 800;
const VIEW_H = 480;
const WORLD_W = 6000;
const WORLD_H = 800; // allow vertical travel

let camX = 0;
let camY = 0;

let farStars = [];
let midStars = [];
let nearStars = [];

let constellations = [];
let collectibles = [];
let blob;
let shootingStars = [];

// -------------------- SETUP --------------------
function setup() {
  createCanvas(VIEW_W, VIEW_H);
  noiseDetail(2, 0.4);

  setupStars();

  // create sparse hidden constellations
  for (let i = 0; i < 10; i++) {
    constellations.push(
      new Constellation(random(400, WORLD_W - 400), random(120, WORLD_H - 120))
    );
  }

  // hidden glowing collectibles
  for (let i = 0; i < 20; i++) {
    collectibles.push(
      new Collectible(random(50, WORLD_W - 50), random(50, WORLD_H - 50))
    );
  }

  blob = new BlobPlayer();
}

// -------------------- DRAW LOOP --------------------
function draw() {
  blob.update(); // update blob first
  updateCamera(); // camera instantly centers on blob

  drawCosmicBackground();
  drawNebula();
  drawStars();

  push();
  translate(-camX, -camY);

  for (let c of constellations) {
    c.update();
    c.draw();
  }

  for (let c of collectibles) {
    c.update();
    c.draw();
  }

  // shooting stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    shootingStars[i].update();
    shootingStars[i].draw();
    if (shootingStars[i].offscreen()) shootingStars.splice(i, 1);
  }

  pop();

  blob.draw();
  drawHUD();
}

// --------------------------------
// CAMERA (FOLLOW BLOB FULLY)
// --------------------------------
function updateCamera() {
  // Camera instantly centers on blob
  camX = blob.x - width / 2;
  camY = blob.y - height / 2;

  // horizontal looping (optional, smooth wrap)
  if (camX < 0) camX += WORLD_W;
  if (camX > WORLD_W - width) camX -= WORLD_W;

  // vertical constrain
  camY = constrain(camY, 0, WORLD_H - height);
}

// --------------------------------
// BACKGROUND
// --------------------------------
function drawCosmicBackground() {
  let topColor = color("#040412");
  let midColor = color("#0b102b");
  let bottomColor = color("#1a0f33");

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c;

    if (inter < 0.5) {
      c = lerpColor(topColor, midColor, inter * 2);
    } else {
      c = lerpColor(midColor, bottomColor, (inter - 0.5) * 2);
    }

    stroke(c);
    line(0, y, width, y);
  }
}

// --------------------------------
// NEBULA LAYERS
// --------------------------------
function drawNebula() {
  push();
  translate(-camX * 0.15, -camY * 0.05); // subtle vertical parallax

  noStroke();
  for (let i = 0; i < WORLD_W; i += 600) {
    fill(120, 80, 200, 30);
    ellipse(i + 200, WORLD_H / 2, 500, 300);
  }

  pop();
}

// --------------------------------
// STARS (PARALLAX)
// --------------------------------
function setupStars() {
  for (let i = 0; i < 250; i++) farStars.push({ x: random(WORLD_W), y: random(WORLD_H), s: random(1, 2) });
  for (let i = 0; i < 150; i++) midStars.push({ x: random(WORLD_W), y: random(WORLD_H), s: random(1, 3) });
  for (let i = 0; i < 70; i++) nearStars.push({ x: random(WORLD_W), y: random(WORLD_H), s: random(2, 4) });
}

function drawStars() {
  noStroke();
  for (let s of farStars) circle(s.x - camX * 0.1, s.y - camY * 0.05, s.s);
  for (let s of midStars) circle(s.x - camX * 0.3, s.y - camY * 0.1, s.s);
  for (let s of nearStars) circle(s.x - camX * 0.6, s.y - camY * 0.15, s.s);
}

// --------------------------------
// CONSTELLATIONS (DISCOVERY)
// --------------------------------
class Constellation {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.found = false;
    this.alpha = 0;
  }

  update() {
    let screenX = this.x - camX;
    let screenY = this.y - camY;

    if (!this.found && dist(screenX, screenY, width / 2, height / 2) < 40) {
      this.found = true;
    }

    if (this.found && this.alpha < 120) this.alpha += 1;
  }

  draw() {
    if (!this.found) {
      stroke(255, 180);
      strokeWeight(1);
      line(this.x - 15, this.y, this.x + 15, this.y);
      line(this.x, this.y - 15, this.x, this.y + 15);
    } else {
      noFill();
      stroke(255, this.alpha);
      strokeWeight(2);
      circle(this.x, this.y, 60);
    }
  }
}

// --------------------------------
// HIDDEN GLOWING COLLECTIBLES
// --------------------------------
class Collectible {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.found = false;
    this.alpha = 0;
  }

  update() {
    let screenX = this.x - camX;
    let screenY = this.y - camY;

    if (!this.found && dist(screenX, screenY, width / 2, height / 2) < 25) this.found = true;
    if (this.found && this.alpha < 255) this.alpha += 5;
  }

  draw() {
    if (!this.found) return;
    noStroke();
    fill(255, 255, 100, this.alpha);
    ellipse(this.x, this.y, 15);
  }
}

// --------------------------------
// COSMIC BLOB (PRESENCE + INTERACTIVE BRIGHTNESS)
// --------------------------------
class BlobPlayer {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;

    this.baseR = 32;
    this.r = this.baseR;

    this.speed = 6; // slightly faster so blob can move well
    this.t = random(1000);
    this.tSpeed = 0.01;

    this.wobble = 6;
    this.points = 48;

    this.brightness = 210;
  }

  update() {
    if (keyIsDown(65)) this.x -= this.speed; // A
    if (keyIsDown(68)) this.x += this.speed; // D
    if (keyIsDown(87)) this.y -= this.speed; // W
    if (keyIsDown(83)) this.y += this.speed; // S

    // constrain inside world
    this.x = constrain(this.x, 0, WORLD_W);
    this.y = constrain(this.y, 0, WORLD_H);

    // brightness reacts to movement
    if (keyIsDown(65) || keyIsDown(68) || keyIsDown(87) || keyIsDown(83)) {
      this.brightness = 255;
    } else {
      this.brightness = 210;
    }

    this.t += this.tSpeed;
  }

  draw() {
    noStroke();
    fill(120, 180, 255, 40);
    circle(this.x, this.y, this.r * 3);

    fill(160, 200, 255, 80);
    circle(this.x, this.y, this.r * 2);

    fill(this.brightness, 230, 255);
    beginShape();
    for (let i = 0; i < this.points; i++) {
      const a = (i / this.points) * TAU;
      const n = noise(cos(a) * this.wobble + 100, sin(a) * this.wobble + 100, this.t);
      const rr = this.r + map(n, 0, 1, -this.wobble, this.wobble);
      vertex(this.x + cos(a) * rr, this.y + sin(a) * rr);
    }
    endShape(CLOSE);
  }
}

// --------------------------------
// SHOOTING STARS
// --------------------------------
class ShootingStar {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(8, 12);
    this.vy = random(-1, 1);
    this.alpha = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5;
  }

  draw() {
    stroke(255, 255, 200, this.alpha);
    strokeWeight(2);
    line(this.x, this.y, this.x - this.vx * 2, this.y - this.vy * 2);
  }

  offscreen() {
    return this.alpha <= 0 || this.x > WORLD_W;
  }
}

// --------------------------------
// INPUT: SHOOTING STARS
// --------------------------------
function keyPressed() {
  if (key === " ") shootingStars.push(new ShootingStar(blob.x, blob.y));
}

// --------------------------------
// HUD: INSTRUCTIONS
// --------------------------------
function drawHUD() {
  fill(255);
  noStroke();
  textSize(14);
  text("Controls: A/D = Left/Right | W/S = Up/Down | Space = Shooting Stars", 10, 20);
  text("Explore the cosmos, discover constellations and hidden collectibles!", 10, 40);
}
