class Robot {

  constructor(simulation) {
    this.simulation = simulation;
    this.pos = [0, 0];
    this.dir = 0;
    this.color = '';
    this.didMove = false;

    this.robot_idx = null;
  }

  moveForward() {
    this.simulation.moveForwardRobot(this.robot_idx);
  }

  turnRight() {
    this.dir = (this.dir + 1) % 4;
    this.simulation.turnRightRobot(this.robot_idx);
  }

  turnLeft() {
    this.dir = (this.dir + 3) % 4;
    this.simulation.turnLeftRobot(this.robot_idx);
  }

  wait() {
    this.simulation.waitRobot(this.robot_idx);
  }

  changeColor(color) {
    this.color = color;
  }

  *produceNextMove() {
  }

}

class BumperBot extends Robot {

  canMoveForward() {
    return this.simulation.canMoveForwardRobot(this.robot_idx);
  }

}
