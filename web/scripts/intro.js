import { T, isTraversable } from './modules/constants.js';
import { Robot, BumperBot } from './modules/robot.js';
import Simulation from './modules/simulation.js';
import * as challenge from './modules/challenge.js';
import * as utils from './modules/utils.js';


document.addEventListener('DOMContentLoaded', function() {

  challenge.initExamples();
  challenge.initDemos();
  challenge.initChallenges();

  // Bumper Bot
  let container = $('.robot-introduction-bumperbot');
  let simulation = $(container).find('.simulation-container').data('simulation');
  let moveForwardButton = $(container).find('.button-move-forward');
  let turnRightButton = $(container).find('.button-turn-right');
  let turnLeftButton = $(container).find('.button-turn-left');
  let senseForwardButton = $(container).find('.button-sense-forward');
  let robot = new Robot(simulation);
  simulation.addRobot(robot, 0, 2, 0);
  $(moveForwardButton).click(function(event) {
    simulation.moveForwardRobot(robot.robot_idx);
  });
  $(turnRightButton).click(function(event) {
    simulation.turnRightRobot(robot.robot_idx);
  });
  $(turnLeftButton).click(function(event) {
    simulation.turnLeftRobot(robot.robot_idx);
  });
  $(senseForwardButton).click(function(event) {
    let message = simulation.canMoveForwardRobot(robot.robot_idx) ? "True" : "False";
    $(senseForwardButton).popover('dispose');
    $(senseForwardButton).popover({
      content: message,
      placement: 'bottom'
    });
    $(senseForwardButton).popover('show');
    window.setTimeout(function() { $(senseForwardButton).popover('hide'); }, 1000);
  });

});
