const Tiles = Object.freeze({
  W: 1, // Wall
  E: 2, // Empty
  C: 3, // Candy
  S: 4, // Start
  T: 5, // Target
  D: 6, // Dirt
  B: 7, // Barrier
});

let isTraversable = {
  [Tiles.W]: false,
  [Tiles.E]: true,
  [Tiles.C]: true,
  [Tiles.S]: true,
  [Tiles.T]: true,
  [Tiles.D]: true,
  [Tiles.B]: false
}

export { Tiles as T, isTraversable };
