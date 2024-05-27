"use strict";

// -------- CONTROLLER --------

window.addEventListener('load', start);

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function start() {
    console.log('Game started');
    createTiles();
    displayTiles();
    tick();
}

function tick(timestamp) {
    requestAnimationFrame(tick);
    deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    movePlayer(deltaTime);
    displayPlayerAtPosition();
    displayPlayerAnimation();
    showDebugging();
}

// -------- MODEL --------

const player = {
    x: 0,
    y: 0,
    speed: 100,
    regX: 11,
    regY: 17,
    moving: false,
    direction: undefined,
    speed: 75,
    hitbox: {
        x: 0,
        y: 0,
        w: 22,
        h: 14
      }
};

const enemy = {
    x: 100,
    y: 100,
    regX: 11,
    regY: 17,
};

const tiles = [
    [0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 4, 7, 7, 7, 7, 4, 0, 0, 5, 5, 5, 5, 0, 0, 0],
    [0, 4, 7, 7, 7, 7, 4, 0, 0, 5, 6, 6, 5, 0, 6, 0],
    [0, 4, 7, 7, 7, 7, 4, 0, 0, 5, 6, 2, 5, 0, 6, 0],
    [0, 4, 7, 7, 7, 7, 4, 0, 0, 5, 2, 2, 5, 0, 0, 0],
    [0, 4, 7, 7, 7, 7, 4, 0, 5, 5, 2, 2, 5, 6, 6, 0],
    [0, 4, 7, 7, 7, 7, 3, 5, 5, 0, 2, 2, 5, 0, 0, 0],
    [0, 4, 4, 4, 4, 4, 4, 5, 0, 0, 2, 2, 5, 5, 5, 0],
    [0, 0, 0, 0, 0, 0, 0, 5, 0, 1, 1, 1, 1, 1, 5, 0],
    [0, 0, 6, 0, 0, 0, 0, 5, 0, 1, 1, 1, 1, 1, 5, 0],
    [0, 0, 0, 2, 0, 0, 0, 5, 0, 1, 0, 6, 6, 6, 5, 0],
    [0, 6, 1, 1, 0, 0, 5, 5, 0, 1, 0, 6, 2, 2, 5, 0],
    [0, 6, 1, 1, 2, 0, 5, 0, 0, 1, 0, 6, 2, 2, 5, 0],
    [0, 2, 1, 0, 0, 0, 5, 0, 1, 1, 0, 6, 2, 2, 5, 0],
    [0, 0, 0, 0, 6, 0, 5, 0, 0, 0, 0, 6, 2, 2, 5, 0],
    [0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 6, 6, 6, 5, 0]
];


const GRID_WIDTH = tiles.length;
const GRID_HEIGHT = tiles[0].length;
const TILE_SIZE = 32;

let lastTimestamp = 0;
let deltaTime = 0;

const controls = {
    left: false,
    right: false,
    up: false,
    down: false
}

function keyDown(event) {
    if (event.key === 'ArrowLeft') {
        controls.left = true;
    } else if (event.key === 'ArrowRight') {
        controls.right = true;
    } else if (event.key === 'ArrowUp') {
        controls.up = true;
    } else if (event.key === 'ArrowDown') {
        controls.down = true;
    }
    console.log("Controls: ", controls);
}

function keyUp(event) {
    if (event.key === 'ArrowLeft') {
        controls.left = false;
    } else if (event.key === 'ArrowRight') {
        controls.right = false;
    } else if (event.key === 'ArrowUp') {
        controls.up = false;
    } else if (event.key === 'ArrowDown') {
        controls.down = false;
    }
}

function movePlayer(deltaTime) {
    player.moving = false;

    const newPos = {
        x: player.x,
        y: player.y
    }

    if (controls.left) {
        player.direction = 'left';
        player.moving = true;
        newPos.x -= player.speed * deltaTime;
    } else if (controls.right) {
        player.direction = 'right';
        player.moving = true;
        newPos.x += player.speed * deltaTime;
    } else if (controls.up) {
        player.direction = 'up';
        player.moving = true;
        newPos.y -= player.speed * deltaTime;
    } else if (controls.down) {
        player.direction = 'down';
        player.moving = true;
        newPos.y += player.speed * deltaTime;
    }

    if (canMove(newPos)) {
        player.x = newPos.x;
        player.y = newPos.y;
    }
}

function getClassForTile(tile) {
    switch (tile) {
        case 0:
            return 'grass'; // Græs
        case 1:
            return 'water'; // Vand
        case 2:
            return 'tree';  // Træer
        case 3:
            return 'door';  // Dør
        case 4:
            return 'wall';  // Væg
        case 5:
            return 'path';  // Sti
        case 6:
            return 'flower';// Blomster
        case 7:
            return 'rock';  // Sten
        case 8:
            return 'gate';  // Port
        case 9:
            return 'lava';  // Lava
    }
}


function coordFromPosition({ x, y }) {
    return {
        row: Math.floor(y / TILE_SIZE),
        col: Math.floor(x / TILE_SIZE)
    }
}

function posFromCoord({ row, col }) {
    return {
        x: col * TILE_SIZE,
        y: row * TILE_SIZE
    }
}

function canMove(newPos) {
    const { row, col } = coordFromPosition(newPos);

    if (row < 0 || col < 0 || row >= GRID_HEIGHT || col >= GRID_WIDTH) {
        return false;
    }

    const tileType = getTilesAtCoord({ row, col });
    switch (tileType) {
        case 0: // grass
        case 3: // door
        case 5: // path
        case 6: // flower
        case 7: // rock
            return true;
        case 1: // water
        case 2: // tree
        case 4: // wall
        case 8: // gate
        case 9: // lava
            return false;
    }

    if (newPos.x < 0 || newPos.y < 0 || newPos.x >= GRID_WIDTH * TILE_SIZE || newPos.y >= GRID_HEIGHT * TILE_SIZE / 2.2) {
        return false;
    }
    return true;
}

function setTileClass(tileElement, tileValue) {
    const tileClass = getClassForTile(tileValue);
    tileElement.className = tileClass;

    for (let row = 0; row < GRID_HEIGHT; row++) {
        for (let col = 0; col < GRID_WIDTH; col++) {
            const tileElement = document.querySelector(`#tile-${row}-${col}`);
            const tileValue = getTilesAtCoord({ row, col });
            setTileClass(tileElement, tileValue);
        }
    }
}

function getTilesAtCoord({ row, col }) { // destructuring
    return tiles[row][col];
}

function createTiles() {
    const background = document.querySelector('#background');
    background.style.setProperty('--GRID_WIDTH', GRID_WIDTH);
    background.style.setProperty('--GRID_HEIGHT', GRID_HEIGHT);
    background.style.setProperty('--TILE_SIZE', TILE_SIZE + 'px');

    for (let row = 0; row < GRID_WIDTH; row++) {
        for (let col = 0; col < GRID_HEIGHT; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile', getClassForTile(tiles[row][col]));
            tile.id = `tile-${row}-${col}`;
            background.append(tile);
        }
    }
    console.log("Tiles created:", document.querySelectorAll('#background .tile').length);
}

function displayTiles() {
    for (let row = 0; row < GRID_WIDTH; row++) {
        for (let col = 0; col < GRID_HEIGHT; col++) {
            const tileElement = document.getElementById(`tile-${row}-${col}`);
            if (tileElement) {
                const tileClass = getClassForTile(tiles[row][col]);
                tileElement.className = 'tile';
                tileElement.classList.add(tileClass);
            } else {
                console.error(`Tile element not found: #tile-${row}-${col}`);
            }
        }
    }
}

// -------- VIEW --------

function showDebugging() {
    showDebuggingUnderPlayer();
    showDebugPlayerRect();
    showDebugPlayerRegistration();
    showDebugPlayerHitbox();
}

function displayPlayerAnimation() {
    const visualPlayer = document.querySelector('#player');

    if (player.moving) {
        visualPlayer.classList.add('animate');
        visualPlayer.classList.remove('left', 'right', 'up', 'down');
        visualPlayer.classList.add(player.direction);
    } else {
        visualPlayer.classList.remove('left', 'right', 'up', 'down');
        visualPlayer.classList.add('animate');
    }
}

function displayPlayerAtPosition() {
    const visualPlayer = document.querySelector("#player");
    visualPlayer.style.translate = `${player.x - player.regX}px ${player.y - player.regY}px`;
}

function displayEnemyAtPosition() {
    const visualEnemy = document.querySelector("#enemy");
    visualEnemy.style.translate = `${enemy.x - enemy.regX}px ${enemy.y - enemy.regY}px`;
}

function highlightTile(coord) {
    const visualTiles = document.querySelectorAll('.tile');
    const visualTile = visualTiles[coord.row * GRID_WIDTH + coord.col];
    visualTile.classList.add('highlight');
}

function unhighlightTile(coord) {
    const visualTiles = document.querySelectorAll('.tile');
    const visualTile = visualTiles[coord.row * GRID_WIDTH + coord.col];
    visualTile.classList.remove('highlight');
}

let lastPlayerCoord = { row: 0, col: 0 };

function showDebuggingUnderPlayer() {
    const coord = coordFromPosition(player);

    if (coord.row != lastPlayerCoord.row || coord.col != lastPlayerCoord.col) {
        unhighlightTile(lastPlayerCoord);
        highlightTile(coord);
        console.log("Highlighted Tile: " + coord.row + " " + coord.col);
    }
    lastPlayerCoord = coord;
}

function showDebugPlayerRect() {
    const visualPlayer = document.querySelector('#player');
    if (!visualPlayer.classList.contains("show-rect")) {
        visualPlayer.classList.add('show-rect');
    }
}

function showDebugPlayerRegistration() {
    const visualPlayer = document.querySelector('#player');
    if (!visualPlayer.classList.contains("show-reg-point")) {
        visualPlayer.classList.add('show-reg-point');
    }
    visualPlayer.style.setProperty('--regX', player.regX + 'px');
    visualPlayer.style.setProperty('--regY', player.regY + 'px');
}

function showDebugPlayerHitbox() {
    const visualPlayer = document.querySelector("#player");
    if (!visualPlayer.classList.contains("show-hitbox")) {
        visualPlayer.classList.add("show-hitbox");
    }
    visualPlayer.style.setProperty("--hitboxX", player.hitbox.x + "px");
    visualPlayer.style.setProperty("--hitboxY", player.hitbox.y + "px");
    visualPlayer.style.setProperty("--hitboxWidth", player.hitbox.w + "px");
    visualPlayer.style.setProperty("--hitboxHeight", player.hitbox.h + "px");
}
