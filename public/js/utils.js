function inBounds(grid, x, y) {
  return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length;
}

function copyGrid(grid) {
  let gridCopy = [];
  for (let kk = 0; kk < grid.length; ++kk) {
    let row = [];
    for (let jj = 0; jj < grid[0].length; ++jj) {
      row.push(grid[kk][jj]);
    }
    gridCopy.push(row);
  }
  return gridCopy;
}

function fillGrid(grid, value) {
  let gridCopy = [];
  for (let kk = 0; kk < grid.length; ++kk) {
    let row = [];
    for (let jj = 0; jj < grid[0].length; ++jj) {
      row.push(value);
    }
    gridCopy.push(row);
  }
  return gridCopy;
}
