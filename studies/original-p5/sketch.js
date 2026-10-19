// Press Space to move the shadow from side to side.
let shadowX = 120;
let targetX = 120;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(235);
  shadowX = lerp(shadowX, targetX, 0.1);

  noStroke();

  // The instruction and space-bar shape invite the action.
  fill(45);
  textAlign(CENTER);
  textSize(16);
  text('PRESS SPACE TO MOVE THE SHADOW', 200, 52);

  fill(100);
  ellipse(shadowX, 275, 130, 28);

  fill(250);
  ellipse(200, 225, 100, 100);

  // The state label confirms where the shadow is heading.
  fill(45);
  textSize(12);
  if (targetX === 120) {
    text('SHADOW: LEFT', 200, 315);
  } else {
    text('SHADOW: RIGHT', 200, 315);
  }

  fill(55);
  rect(130, 338, 140, 38, 7);
  fill(255);
  textSize(14);
  text('SPACE BAR', 200, 363);
}

function keyPressed() {
  if (key === ' ') {
    if (targetX === 120) {
      targetX = 280;
    } else {
      targetX = 120;
    }
    return false;
  }
}
