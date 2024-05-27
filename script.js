window.addEventListener('load', start);

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
// model

const player = {
    x: 0,
    y: 0,
    speed: 100,
    regX: 16,
    regY: 16,
    moving: false,
    direction: undefined
};

const tiles = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,5,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,5,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,5,0,0,1,0,0,0,0,0,2,2,2,0,0,0],
    [0,5,5,5,1,0,0,0,0,0,2,2,2,0,0,0],
    [0,0,0,5,1,2,2,2,0,0,2,2,2,0,0,0],
    [0,0,0,5,5,5,5,5,5,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,5,0,0,4,4,4,4,0],
    [0,0,0,0,0,0,0,0,5,5,5,5,5,5,4,0],
    [0,0,0,0,0,0,0,0,0,0,0,4,5,5,4,0],
    [0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,0]
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

    const newPos =  {
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
    console.log("Activate Player Animation: " + visualPlayer.classList)
}

function displayPlayerAtPosition() {
    const visualPlayer = document.querySelector('#player');
    visualPlayer.style.transform = `translate(${player.x}px, ${player.y}px)`;
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

function getClassForTile(tile) {
    switch (tile) {
        case 0:
            return 'grass';
        case 1:
            return 'water';
        case 2:
            return 'tree';
        case 3:
            return 'path';
        case 4:
            return 'wall';
        case 5:
            return 'door';
        default:
            return 'grass';
    }
}

function coordFromPosition({x, y}) {
    const row = Math.floor(y / TILE_SIZE);
    const col = Math.floor(x / TILE_SIZE);
    return {row, col};
}

function posFromCoord({row, col}) {
    return {
        x: col * TILE_SIZE,
        y: row * TILE_SIZE
    }
}

function canMove(newPos) {
    const {row, col} = coordFromPosition(newPos);

    if (row < 0 || col < 0 || row >= GRID_HEIGHT || col >= GRID_WIDTH) {
        return false;
    }

    const tileType = getTilesAtCoord({row, col});
    switch (tileType) {
        case 0:
            return true;
        case 1:
            return true;
        case 4:
            return true;
        case 2:
            return false;
        case 3:
            return false;
        case 5:
            return false;
    }

    if (newPos.x < 0 || newPos.y < 0 || newPos.x >= GRID_WIDTH*TILE_SIZE || newPos.y >= GRID_HEIGHT*TILE_SIZE/2.2) {
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
            const tileValue = getTilesAtCoord({row, col});
            setTileClass(tileElement, tileValue);
        }
    }
}

function getTilesAtCoord({row, col}) {
    return tiles[row] [col];
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

let lastPlayerCoord = {row: 0, col: 0};

function showDebugging() {

    showDebuggingUnderPlayer();
    showDebugPlayerRect();
    showDebugPlayerRegistration();
}

function showDebuggingUnderPlayer() {
    const coord = coordFromPosition({x: player.x, y: player.y});

    if (coord.row !== lastPlayerCoord.row || coord.col !== lastPlayerCoord.col) {
        unhighlightTile(lastPlayerCoord);
        highlightTile(coord);
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