import boostrap from 'bootstrap';

import { T } from './constants.js';
import Simulation from './simulation.js';

// De-mangle all of the Robot classes
import { Robot as sourceRobot, BumperBot as sourceBumperBot } from './robot.js';
let Robot = sourceRobot, BumperBot = sourceBumperBot;


export function initExamples(containerClassName='example-container') {
  let examples = $('.' + containerClassName + ' textarea');
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
}

export function initDemos(containerClassName='demo-container') {
  let demos = $('.' + containerClassName);
  for (let ii = 0; ii < demos.length; ++ii) {
    let demo = demos[ii];
    let simulationContainer = $(demo).find('.simulation-container');
    let gridContainer = $(demo).find('.grid-container');
    let robotsContainer = $(demo).find('.simulation-robots');

    let grids = eval(gridContainer.text());
    let grid = grids[0];

    let simulation = new Simulation(grid, simulationContainer.get(0));

    let robots = $(robotsContainer).children();
    for (let jj = 0; jj < robots.length; ++jj) {
      let robot = eval('(' + $(robots[jj]).find('.simulation-robot-code').text() + ')');
      let x = eval('(' + $(robots[jj]).find('.simulation-robot-x').text() + ')');
      let y = eval('(' + $(robots[jj]).find('.simulation-robot-y').text() + ')');
      let d = eval('(' + $(robots[jj]).find('.simulation-robot-d').text() + ')');
      simulation.addRobot(new robot(simulation), x, y, d);
    }

    new p5(simulation.p5.bind(simulation), simulationContainer.get(0));

    $(simulationContainer).data('simulation', simulation);

    $(window).on('resize', function(event) {
      simulation.windowResized.bind(simulation)();
    });
  }
}

export function initChallenges(containerClassName='.challenge-container') {
  let hintModalBody = $('#hints-modal .modal-body');
  let challenges = $(containerClassName);
  for (let ii = 0; ii < challenges.length; ++ii) {
    let challenge = challenges[ii];

    let questionContainer = $(challenge).find('.challenge-question-container');
    let editorContainer = $(questionContainer).find('.editor-container');
    let codeContainer = $(editorContainer).find('.editor-code-container');
    let outputContainer = $(editorContainer).find('.editor-output-container');
    let simulationContainer = $(questionContainer).find('.simulation-container');
    let gridContainer = $(questionContainer).find('.grid-container');
    let hints = $(questionContainer).find('.challenge-hints');

    let grids = eval(gridContainer.text());
    let grid = grids[0];

    let mapsDropdown = $(challenge).find('.map-button');
    let mapSelector = $(mapsDropdown).find('.dropdown-menu');
    mapSelector.html('');
    for (let jj = 0; jj < grids.length; ++jj) {
      let el = $('<a class="dropdown-item" href="#"></a>');
      el.text('Map ' + (jj + 1));
      mapSelector.append(el);
    }
    if (grids.length == 1) {
      $(mapsDropdown).hide();
    }

    if (ii <= 1) {
      let target = ii == 0 ? codeContainer : mapsDropdown;
      let content = ii == 0 ? 'Write your code here' : 'Switch between maps';
      let placement = ii == 0 ? 'right' : 'bottom';
      let bounce = ii == 0 ? 'horizontal' : 'vertical';
      $(target).popover({
        content: content,
        trigger: 'manual',
        placement: placement,
        template: '<div class="popover bounce bounce-' + bounce + '" role="tooltip"><div class="arrow"></div><h2 class="popover-header"></h2><div class="popover-body"></div></div>'
      });
      $(target).popover('show');
      $(target).click(function(event) { $(target).popover('hide'); });
    }

    var editor = CodeMirror(codeContainer.get(0), {
      lineNumbers: true,
      viewportMargin: Infinity,
      theme: 'ambiance',
      mode: 'javascript',
      tabSize: 2,
      indentWithTabs: false,
      value: `*produceNextMove() {

  // Complete the *produceNextMove function!


}`,
    });

    editorContainer.keydown(function(event) {
      if (event.key == '\'' && (event.ctrlKey || event.metaKey)) {
        runButton.click();
      }
    });

    let simulation = new Simulation(grid, simulationContainer.get(0), outputContainer.get(0));
    simulation.addRobot(new Robot(simulation), 0, 0, 1);
    new p5(simulation.p5.bind(simulation), simulationContainer.get(0), outputContainer.get(0));

    // Hack to make the canvas fit into the Bootstrap grid layout
    $(questionContainer).css('padding', '0');

    let runButton = $(questionContainer).find('.run-button');
    let runHint = 'Run your code on the Robot';
    if (navigator.platform.indexOf('Mac') >= 0) {
      runHint += '<br/>Keyboard shortcut:&nbsp;&nbsp;&nbsp;<code>&#8984; + \'</code>';
    } else {
      runHint += '<br/>Keyboard shortcut:&nbsp;&nbsp;&nbsp;<code>Ctrl + \'</code>';
    }
    $(runButton).popover({
      content: runHint,
      trigger: 'hover',
      placement: 'bottom',
      html: true
    });
    runButton.click(function(event) {
      let code = '(class IntroBot extends BumperBot {\n' + editor.getValue() + '\n})';
      try {
        $(outputContainer).text('');
        let RobotDefinition = eval(code);
        let robot = new RobotDefinition(simulation);
        simulation.reset();
        simulation.addRobot(robot, 0, 0, 1);
      } catch (excpt) {
        $(outputContainer).text(excpt.toString());
      }
      setTimeout(function(event) { $(editorContainer).popover('hide'); }, 10000);
    });

    let resetButton = $(questionContainer).find('.reset-button');
    $(resetButton).popover({
      content: 'Reset the simulation to the beginning',
      trigger: 'hover',
      placement: 'bottom'
    });
    resetButton.click(function(event) {
      simulation.reset();
      simulation.addRobot(new Robot(simulation), 0, 0, 1);
    });

    let hintButton = $(questionContainer).find('.hint-button');
    hintButton.click(function(event) {
      hintModalBody.html('');
      hintModalBody.append(hints.children().clone());
    });

    $(window).on('resize', function(event) {
      // Hack to make the canvas fit into the Bootstrap grid layout
      $(questionContainer).css('padding', '');

      simulation.windowResized.bind(simulation)();

      // Hack to make the canvas fit into the Bootstrap grid layout
      $(questionContainer).css('padding', '0');
    });
  }
}
