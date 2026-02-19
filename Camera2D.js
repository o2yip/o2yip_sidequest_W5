// --------------------------------
// Camera2D Class with smooth vertical follow
// --------------------------------
class Camera2D {
  constructor(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.x = 0;
    this.y = 0;
  }

  // smooth horizontal and vertical follow
  follow(targetX, targetY, lerpAmt = 0.1) {
    const desiredX = targetX - this.viewW / 2;
    const desiredY = targetY - this.viewH / 2;

    this.x = lerp(this.x, desiredX, lerpAmt);
    this.y = lerp(this.y, desiredY, lerpAmt);
  }

  // constrain camera inside world
  clampToWorld(worldW, worldH) {
    const maxX = max(0, worldW - this.viewW);
    const maxY = max(0, worldH - this.viewH);
    this.x = constrain(this.x, 0, maxX);
    this.y = constrain(this.y, 0, maxY);
  }

  begin() {
    push();
    translate(-this.x, -this.y);
  }

  end() {
    pop();
  }
}

