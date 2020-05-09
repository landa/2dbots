import { T, isTraversable } from './modules/constants.js';
import { BumperBot } from './modules/robot.js';
import Simulation from './modules/simulation.js';
import * as challenge from './modules/challenge.js';
import * as utils from './modules/utils.js';


document.addEventListener('DOMContentLoaded', function() {

  challenge.initExamples();
  challenge.initDemos();
  challenge.initChallenges();

});
