import { T, isTraversable } from './modules/constants.js';
import { BumperBot } from './modules/robot.js';
import Simulation from './modules/simulation.js';
import * as utils from './modules/utils.js';


document.addEventListener('DOMContentLoaded', function() {

  class MazeRobot extends BumperBot {

    constructor(simulation) {
      super(simulation);
      this.pos = [0, 0];
      this.visited = {};
      this.visited[[0, 0]] = true;
      this.didMove = false;
      this.didClean = false;
    }

    getEdges() {
      var edges = [];

      let attempts = [
        [[0, 1], [1, 0], [0, -1], [-1, 0]],
        [[1, 0], [0, -1], [-1, 0], [0, 1]],
        [[0, -1], [-1, 0], [0, 1], [1, 0]],
        [[-1, 0], [0, 1], [1, 0], [0, -1]]
      ];

      let directions = attempts[this.dir];

      for (let ii = 0; ii < directions.length; ++ii) {
        let x = directions[ii][0];
        let y = directions[ii][1];
        let pos = [this.pos[0] + x, this.pos[1] + y];
        edges.push([pos, [x, y]]);
      }
      return edges;
    }

    dot(a, b) {
      return a[0] * b[0] + a[1] * b[1];
    }

    cross(a, b) {
      return a[0] * b[1] - a[1] * b[0];
    }

    directionToVector(d) {
      switch (d) {
        case 0:
        return [0, 1];
        case 1:
        return [1, 0];
        case 2:
        return [0, -1];
        case 3:
        return [-1, 0];
      }
    }

    *turnTo(direction) {
      let oldDirection = this.directionToVector(this.dir);
      let dotProduct = this.dot(oldDirection, direction);
      if (dotProduct == -1) {
        yield this.turnLeft;
        yield this.turnLeft;
      } else if (dotProduct == 0) {
        let crossProduct = this.cross(oldDirection, direction);
        if (crossProduct == -1) {
          yield this.turnRight;
        } else if (crossProduct == 1) {
          yield this.turnLeft;
        }
      }
    }

    clean() {
      this.simulation.cleanRobot(this.robot_idx);
    }

    *move() {
      if (this.canMoveForward()) {
        yield this.moveForward;
        let direction = this.directionToVector(this.dir);
        this.pos = [this.pos[0] + direction[0], this.pos[1] + direction[1]];
      }
    }

    *produceNextMove() {
      yield * this.cleanTile();
      yield this.turnRight;
      yield this.turnRight;
      yield this.turnRight;
    }

    *cleanTile() {
      this.changeColor('');
      yield this.clean;
      let edges = this.getEdges();
      let D = this.directionToVector(this.dir);
      for (let ii = 0; ii < edges.length; ++ii) {
        let neighbor = edges[ii];
        if (neighbor[0] in this.visited) {
          continue;
        }
        this.visited[neighbor[0]] = true;
        yield * this.turnTo(neighbor[1]);
        if (this.canMoveForward()) {
          yield * this.move();
          yield * this.cleanTile();
          yield * this.move();
        }
      }
      this.changeColor('darkgreen');
      yield * this.turnTo([-D[0], -D[1]]);
    }
  }

  let examples = $('.example-container textarea');
  for (let ii = 0; ii < examples.length; ++ii) {
    let example = examples[ii];
    CodeMirror.fromTextArea(example, {
      lineNumbers: true,
      viewportMargin: Infinity,
      theme: 'ambiance',
      mode: 'javascript',
      tabSize: 2,
      indentWithTabs: false,
      readOnly: true,
    });
  }

  let challenges = $('.challenge-container');
  for (let ii = 0; ii < challenges.length; ++ii) {
    let challenge = challenges[ii];

    let simulationContainer = $(challenge).find('.simulation-container');
    let gridContainer = $(challenge).find('.grid-container');

    let grid = eval(gridContainer.text());

    let gridCopy = utils.copyGrid(grid);

    let simulation = new Simulation(gridCopy, simulationContainer.get(0));
    simulation.viewportOrigin = [20, 10];
    simulation.viewportScale = 0.75;
    simulation.addRobot(new MazeRobot(simulation), 0, 0, 1);
    new p5(simulation.p5.bind(simulation), simulationContainer.get(0));

    let resetButton = $(challenge).find('.reset-button');
    resetButton.click(function(event) {
      let gridCopy = utils.copyGrid(grid);
      simulation.grid = gridCopy;
      simulation.reset();
      simulation.viewportOrigin = [20, 10];
      simulation.viewportScale = 0.75;

      var x = 0;
      var y = 0;

      for (let jj = 0; jj < 10; ++jj) {
        let xx = Math.floor(Math.random() * grid[0].length);
        let yy = Math.floor(Math.random() * grid.length);
        if (grid[yy][xx] == T.E || grid[yy][xx] == T.D) {
          x = xx;
          y = yy;
          break;
        }
      }

      simulation.addRobot(new MazeRobot(simulation), x, y, 1);
    });

    $(window).on('resize', simulation.windowResized.bind(simulation));
  }

});
