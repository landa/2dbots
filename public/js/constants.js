let W = 0; // Wall
let E = 1; // Empty
let C = 2; // Candy
let S = 3; // Start
let T = 4; // Target
let D = 5; // Dirt
let B = 6; // Barrier

let isTraversable = {
  [W]: false,
  [E]: true,
  [C]: true,
  [S]: true,
  [T]: true,
  [D]: true,
  [B]: false
}
