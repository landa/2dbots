class Simulation {

  constructor(grid, simulationContainer, outputContainer) {
    this.RENDER_FRAMERATE = 60;
    this.SIMULATION_FRAMERATE = 60;
    this.TILE_WIDTH_PIXELS = 50;

    // HTML DOM Containers
    this.simulationContainer = simulationContainer;
    this.outputContainer = outputContainer;

    // Viewport Rendering
    this.viewportOrigin = [0, 0];
    this.viewportScale = 1.0;

    // Robots
    this.robots = [];
    this.numActiveRobots = 0;
    this.queued_actions = {};
    this.action_costs = {
      'bound moveForward': 6,
      'bound turnRight': 6,
      'bound turnLeft': 6,
      'bound clean': 9
    }

    // Grid
    this.grid = grid;
    this.occupancyGrid = fillGrid(this.grid, null);
    this.gridWidth = this.grid[0].length * this.TILE_WIDTH_PIXELS;
    this.gridHeight = this.grid.length * this.TILE_WIDTH_PIXELS;

    // Configuration
    this.debug_output = false;

    this.sketch = null;
    this.recalculateViewportParameters();
    this.reset();
  }

  p5(p) {
    p.setup = this.setup.bind(p);
    p.draw = this.draw.bind(p);
    p.simulation = this;
    this.sketch = p;
  }

  windowResized() {
    let elementWidth = this.simulationContainer.clientWidth;
    let elementHeight = this.simulationContainer.clientHeight - 7;
    this.sketch.resizeCanvas(elementWidth, elementHeight);
    this.recalculateViewportParameters();
  }

  recalculateViewportParameters() {
    let elementWidth = $(this.simulationContainer).width() - 7;
    let elementHeight = $(this.simulationContainer).height() - 7;
    let viewportScales = [elementHeight / this.gridHeight, elementWidth / this.gridWidth];
    this.viewportScale = Math.min.apply(1, viewportScales) * 0.9;

    let x = (elementWidth - this.viewportScale * this.gridWidth) / 2;
    let y = (elementHeight - this.viewportScale * this.gridHeight) / 2;
    this.viewportOrigin = [x, y];
  }

  reset(removeRobots=true) {
    if (removeRobots) {
      this.occupancyGrid = fillGrid(this.grid, null);
      this.queued_actions = {};
      this.robots = [];
      this.numActiveRobots = 0;
    }

    if (this.sketch) {
      this.draw.bind(this.sketch)();
    }
  }

  addRobot(robot, x, y, d) {
    if (!inBounds(this.grid, x, y)) {
      return false;
    }

    let gridCell = this.grid[y][x];
    if (!isTraversable[gridCell]) {
      return false;
    }

    if (this.occupancyGrid[y][x] != null) {
      return false;
    }

    this.robots.push([robot, x, y, d, robot.produceNextMove()]);
    robot.robot_idx = this.robots.length - 1;
    robot.dir = d;
    this.numActiveRobots += 1;
    this.occupancyGrid[y][x] = robot.robot_idx;
    this.queued_actions[robot.robot_idx] = [this.waitRobot];
    return true;
  }

  getForwardCoordinatesRobot(robot_idx) {
    var x = this.robots[robot_idx][1];
    var y = this.robots[robot_idx][2];
    var d = this.robots[robot_idx][3];

    if (d == 0) {
      y -= 1;
    } else if (d == 1) {
      x += 1;
    } else if (d == 2) {
      y += 1;
    } else {
      x -= 1;
    }

    return [x, y, d];
  }

  canMoveForwardRobot(robot_idx) {
    let cd = this.getForwardCoordinatesRobot(robot_idx);
    let x = cd[0];
    let y = cd[1];

    let boundCheck = inBounds(this.grid, x, y);
    if (!boundCheck) {
      return false;
    }

    let terrainCheck = isTraversable[this.grid[y][x]];
    let occupancyCheck = this.occupancyGrid[y][x] == null;

    return terrainCheck && occupancyCheck;
  }

  waitRobot(robot_idx) {
    return function() { };
  }

  moveForwardRobot(robot_idx) {
    let robot_tuple = this.robots[robot_idx];
    let ox = robot_tuple[1];
    let oy = robot_tuple[2];

    let cd = this.getForwardCoordinatesRobot(robot_idx);
    let nx = cd[0];
    let ny = cd[1];
    let nd = cd[2];

    if (this.canMoveForwardRobot(robot_idx)) {
      this.occupancyGrid[oy][ox] = null;
      this.occupancyGrid[ny][nx] = robot_idx;
      this.robots[robot_idx][1] = nx;
      this.robots[robot_idx][2] = ny;
    }
  }

  turnRightRobot(robot_idx) {
    this.robots[robot_idx][3] = (this.robots[robot_idx][3] + 1) % 4;
  }

  turnLeftRobot(robot_idx) {
    this.robots[robot_idx][3] = (this.robots[robot_idx][3] + 3) % 4;
  }

  cleanRobot(robot_idx) {
    let x = this.robots[robot_idx][1];
    let y = this.robots[robot_idx][2];
    if (this.grid[y][x] == D) {
      this.grid[y][x] = E;
    }
  }

  drawGrid() {
    this.sketch.background(61, 61, 61);
    this.sketch.noFill();
    this.sketch.strokeWeight(3);
    for (let jj = 0; jj < this.grid.length; ++jj) {
      for (let ii = 0; ii < this.grid[0].length; ++ii) {
        let value = this.grid[jj][ii];
        if (value == W) { // wall
          this.sketch.fill(34, 34, 34);
        } else if (value == E) { // empty
          this.sketch.fill(100, 100, 100);
        } else if (value == C) { // candy
          this.sketch.fill(100, 100, 100);
        } else if (value == D) { // dirt
          this.sketch.fill(100, 100, 100);
        } else if (value == S) { // start
          this.sketch.fill(100, 100, 100);
        } else if (value == T) { // target
          this.sketch.fill(100, 100, 100);
        }
        let x = ii * this.TILE_WIDTH_PIXELS;
        let y = jj * this.TILE_WIDTH_PIXELS;
        this.sketch.stroke(0, 0, 0);
        this.sketch.square(x, y, this.TILE_WIDTH_PIXELS);
        if (value == C) {
          this.sketch.fill(214, 100, 139);
          this.sketch.stroke(156, 67, 107);
          this.sketch.circle(x + this.TILE_WIDTH_PIXELS / 2, y + this.TILE_WIDTH_PIXELS / 2, this.TILE_WIDTH_PIXELS / 2);
        } else if (value == D) {
          this.sketch.fill(60, 60, 60);
          this.sketch.noStroke();
          this.sketch.circle(x + this.TILE_WIDTH_PIXELS / 2, y + this.TILE_WIDTH_PIXELS / 2, this.TILE_WIDTH_PIXELS / 2);
        } else if (value == S || value == T) {
          this.sketch.noFill();
          if (value == S) {
            this.sketch.stroke(250, 200, 200);
          } else {
            this.sketch.stroke(200, 250, 200);
          }
          this.sketch.circle(x + this.TILE_WIDTH_PIXELS / 2, y + this.TILE_WIDTH_PIXELS / 2, this.TILE_WIDTH_PIXELS * 0.2);
          this.sketch.circle(x + this.TILE_WIDTH_PIXELS / 2, y + this.TILE_WIDTH_PIXELS / 2, this.TILE_WIDTH_PIXELS * 0.4);
          this.sketch.circle(x + this.TILE_WIDTH_PIXELS / 2, y + this.TILE_WIDTH_PIXELS / 2, this.TILE_WIDTH_PIXELS * 0.6);
          this.sketch.circle(x + this.TILE_WIDTH_PIXELS / 2, y + this.TILE_WIDTH_PIXELS / 2, this.TILE_WIDTH_PIXELS * 0.8);
        }
      }
    }
  }

  mouseWheel(event) {
    this.background(34, 34, 34);
    this.simulation.viewportScale = Math.max(0.5, Math.min(3.0, this.simulation.viewportScale - event.delta / 1000));
  }

  moveRobots() {
    let counter = Math.floor(this.RENDER_FRAMERATE/this.SIMULATION_FRAMERATE);
    if (this.sketch.frameCount % counter != 0) {
      return;
    }

    for (let ii = 0; ii < this.robots.length; ++ii) {
      try {
        if (ii in this.queued_actions && this.queued_actions[ii].length > 0) {
          let nextAction = this.queued_actions[ii].pop();
          if (nextAction == undefined) {
            throw 'Unknown yielded action!';
          } else {
            nextAction = nextAction.bind(this.robots[ii][0]);
          }
          nextAction();
          continue;
        }
        let nextAction = this.robots[ii][4];
        if (nextAction == null) {
          continue; // Robot is done
        }
        nextAction = nextAction.next();
        if (!nextAction.done) {
          nextAction = nextAction.value;
          if (nextAction == undefined) {
            throw 'Unknown yielded action!';
          } else {
            nextAction = nextAction.bind(this.robots[ii][0]);
          }
          nextAction();
          if (!(ii in this.queued_actions)) {
            this.queued_actions[ii] = [];
          }
          let action_cost = this.action_costs[nextAction.name];
          for (let jj = 0; jj < action_cost; ++jj) {
            this.queued_actions[ii].push(this.waitRobot);
          }
        } else {
          this.robots[ii][4] = null;
          this.numActiveRobots -= 1;
        }
      } catch (excpt) {
        console.log(excpt.toString());
        $(this.outputContainer).text(excpt.toString());
      }
    }
  }

  drawBumperRobot(robot_tuple) {
    this.sketch.push();
    let tile = this.TILE_WIDTH_PIXELS;
    let robot = robot_tuple[0];
    let x = robot_tuple[1] * tile;
    let y = robot_tuple[2] * tile;
    let d = robot_tuple[3] * this.sketch.PI / 2;
    this.sketch.translate(x + tile/2, y + tile/2);
    this.sketch.rotate(d);
    this.sketch.translate(0, tile/8);
    this.sketch.fill(20, 20, 20);
    this.sketch.stroke(60, 60, 60);
    this.sketch.strokeWeight(1);
    this.sketch.rect(-tile/2 + tile/10, -tile/5, tile/5, tile/3);
    this.sketch.rect(tile/2 - tile/5 - tile/10, -tile/5, tile/5, tile/3);
    this.sketch.strokeWeight(3);
    if (robot.color) {
      this.sketch.fill(this.sketch.color(robot.color));
    } else {
      this.sketch.fill(60, 60, 60);
    }
    this.sketch.stroke(0, 0, 0);
    this.sketch.arc(0, 0, tile * 0.65, tile * 0.65, -this.sketch.PI - this.sketch.PI/6, this.sketch.PI/6, this.sketch.PIE);
    this.sketch.fill(255, 255, 255);
    this.sketch.stroke(0, 0, 0);
    this.sketch.arc(0, 0, tile * 0.65, tile * 0.65, -this.sketch.PI + this.sketch.PI/6, -this.sketch.PI/6, this.sketch.CHORD);
    this.sketch.pop();
  }

  drawRobots() {
    for (let ii = 0; ii < this.robots.length; ++ii) {
      let robot_tuple = this.robots[ii];
      this.drawBumperRobot(robot_tuple);
    }
  }

  drawDebug() {
    this.sketch.textSize(10);
    this.sketch.fill(255, 255, 204);
    this.sketch.text('Number of active robots: ' + this.numActiveRobots, 30, 30);
  }

  setup() {
    this.frameRate(this.RENDER_FRAMERATE);
    let canvas = this.createCanvas(this.simulation.simulationContainer.clientWidth, this.simulation.simulationContainer.clientHeight - 7);
    this.background(34, 34, 34);
    canvas.mouseWheel = this.simulation.mouseWheel;
    canvas.mouseClicked = this.simulation.mouseDragged;
  }

  moveCanvas() {
    this.background(34, 34, 34);
    this.simulation.viewportOrigin[0] += this.movedX;
    this.simulation.viewportOrigin[0] = Math.max(-this.simulation.gridWidth * this.simulation.viewportScale / 2, this.simulation.viewportOrigin[0])
    this.simulation.viewportOrigin[0] = Math.min(this.width - this.simulation.gridWidth * this.simulation.viewportScale / 2, this.simulation.viewportOrigin[0])
    this.simulation.viewportOrigin[1] += this.movedY;
    this.simulation.viewportOrigin[1] = Math.max(-this.simulation.gridHeight * this.simulation.viewportScale / 2, this.simulation.viewportOrigin[1])
    this.simulation.viewportOrigin[1] = Math.min(this.height - this.simulation.gridHeight * this.simulation.viewportScale / 2, this.simulation.viewportOrigin[1])
    this.shouldDraw = true;
  }

  draw() {
    this.push();

    this.translate(this.simulation.viewportOrigin[0], this.simulation.viewportOrigin[1]);
    this.scale(this.simulation.viewportScale);

    this.simulation.drawGrid();
    this.simulation.moveRobots();
    this.simulation.drawRobots();

    this.pop();

    if (this.simulation.debug_output) {
      this.simulation.drawDebug();
    }
  }

}
