const DRAW = 0;
const EMPTY = 0;
const PLAYER_1 = 1;
const PLAYER_2 = 2;
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 6;
const SCALE = 0.7;
const DEFAULT_BORDER_RADIUS = 15;
const GAME_PIECE_RADIUS = 46 * SCALE;
const GAME_SECTION_SIZE = 100 * SCALE;
const FPS = 1;
const RED = "#ce3e30";
const YELLOW = "#e7e051";
const BLUE = "#6890cb";
let board;
window.onload = () => {
    board = new Board();
};
class GamePiece {
    constructor(x, y) {
        this.value = EMPTY;
        this.x = (x * GAME_SECTION_SIZE) + (GAME_SECTION_SIZE / 2);
        this.y = -GAME_PIECE_RADIUS;
        this.end_y = (y * GAME_SECTION_SIZE) + (GAME_SECTION_SIZE / 2);
        this.color = null;
    }
    update_pos() {
        const PIXEL_CHANGE = 5;
        if (this.value != EMPTY && this.y < this.end_y) {
            this.y = this.y + PIXEL_CHANGE;
            if (this.y > this.end_y)
                this.y = this.end_y;
        }
    }
    draw(ctx) {
        if (this.value == EMPTY)
            return;
        ctx.globalCompositeOperation = 'destination-over';
        ctx.beginPath();
        ctx.arc(this.x, this.y, GAME_PIECE_RADIUS, 0, 2 * Math.PI, false);
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
    }
    setPlayer(player) {
        this.value = player;
        this.color = this.value == 1 ? RED : YELLOW;
    }
    getPlayer() {
        return this.value;
    }
}
class Board {
    constructor() {
        this.game = 0;
        this.turn = 0;
        this.turn = PLAYER_1;
        this.canvas = document.getElementById("cnvs");
        this.canvas.width = GAME_SECTION_SIZE * BOARD_WIDTH;
        this.canvas.height = GAME_SECTION_SIZE * BOARD_HEIGHT;
        this.canvas.style["border-radius"] = (DEFAULT_BORDER_RADIUS * SCALE).toString() + "px";
        this.ctx = this.canvas.getContext("2d");
        this.matrix = new Array();
        this.gameStop = true;
        this.newGame();
        this.canvas.addEventListener("click", (event) => this.checkMove(event.offsetX));
        this.newGameBtn = document.getElementById("newGame");
        this.newGameBtn.addEventListener("click", (event) => this.newGame());
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawBoard() {
        this.ctx.fillStyle = BLUE;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                let x = (i * GAME_SECTION_SIZE) + (GAME_SECTION_SIZE / 2);
                let y = (j * GAME_SECTION_SIZE) + (GAME_SECTION_SIZE / 2);
                this.ctx.save();
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.beginPath();
                this.ctx.arc(x, y, GAME_PIECE_RADIUS, 0, 2 * Math.PI, false);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    }
    newGame() {
        this.gameStop = false;
        this.game++;
        this.turn = this.game % 2 == 1 ? PLAYER_1 : PLAYER_2;
        this.displayTurn();
        for (var i = 0; i < BOARD_WIDTH; i++) {
            if (typeof this.matrix[i] == "undefined")
                this.matrix[i] = new Array();
            for (var j = 0; j < BOARD_HEIGHT; j++) {
                this.matrix[i][j] = new GamePiece(i, j);
            }
        }
        this.interval = setInterval(() => this.updateGameArea(), FPS);
    }
    updateGameArea() {
        this.clear();
        this.drawBoard();
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                this.matrix[i][j].update_pos();
                this.matrix[i][j].draw(this.ctx);
            }
        }
    }
    checkMove(xInput) {
        let x = Math.floor(xInput / GAME_SECTION_SIZE);
        let y = -1;
        let gp;
        if (this.gameStop)
            return;
        for (let i = BOARD_HEIGHT - 1; i >= 0; i--) {
            if (this.matrix[x][i].getPlayer() == EMPTY) {
                y = i;
                gp = this.matrix[x][i];
                break;
            }
        }
        if (typeof gp != "undefined") {
            gp.setPlayer(this.turn);
            let gameStatus = this.isGameOver(x, y);
            if (gameStatus != -1) {
                this.gameOver(gameStatus);
                return;
            }
            this.switchPlayer();
        }
    }
    switchPlayer() {
        this.turn = this.turn == PLAYER_1 ? PLAYER_2 : PLAYER_1;
        this.displayTurn();
    }
    displayTurn() {
        let status = document.getElementById("status");
        let color = this.turn == PLAYER_1 ? "RED" : "YELLOW";
        status.innerHTML = color + "'s turn";
    }
    isGameOver(x, y) {
        let count;
        let temp_x;
        let temp_y;
        count = 1;
        temp_y = y + 1;
        while (temp_y < this.matrix[x].length && this.matrix[x][temp_y].getPlayer() == this.turn) {
            count++;
            temp_y++;
            if (count == 4)
                return this.turn;
        }
        count = 1;
        temp_x = x + 1;
        while (temp_x < this.matrix.length && this.matrix[temp_x][y].getPlayer() == this.turn) {
            count++;
            temp_x++;
            if (count == 4)
                return this.turn;
        }
        temp_x = x - 1;
        while (temp_x >= 0 && this.matrix[temp_x][y].getPlayer() == this.turn) {
            count++;
            temp_x--;
            if (count == 4)
                return this.turn;
        }
        count = 1;
        temp_x = x + 1;
        temp_y = y + 1;
        while (temp_x < this.matrix.length && temp_y < this.matrix[temp_x].length && this.matrix[temp_x][temp_y].getPlayer() == this.turn) {
            count++;
            temp_x++;
            temp_y++;
            if (count == 4)
                return this.turn;
        }
        temp_x = x - 1;
        temp_y = y - 1;
        while (temp_x >= 0 && temp_y >= 0 && this.matrix[temp_x][temp_y].getPlayer() == this.turn) {
            count++;
            temp_x--;
            temp_y--;
            if (count == 4)
                return this.turn;
        }
        count = 1;
        temp_x = x + 1;
        temp_y = y - 1;
        while (temp_x < this.matrix.length && temp_y >= 0 && this.matrix[temp_x][temp_y].getPlayer() == this.turn) {
            count++;
            temp_x++;
            temp_y--;
            if (count == 4)
                return this.turn;
        }
        temp_x = x - 1;
        temp_y = y + 1;
        while (temp_x >= 0 && temp_y < this.matrix[temp_x].length && this.matrix[temp_x][temp_y].getPlayer() == this.turn) {
            count++;
            temp_x--;
            temp_y++;
            if (count == 4)
                return this.turn;
        }
        for (let i = 0; i < BOARD_WIDTH; i++) {
            if (this.matrix[i][0].getPlayer() == EMPTY)
                return -1;
        }
        return DRAW;
    }
    gameOver(winner) {
        let status = document.getElementById("status");
        let text;
        switch (winner) {
            case DRAW:
                text = ": Draw";
                break;
            case PLAYER_1:
                text = ": RED won";
                break;
            case PLAYER_2:
                text = ": YELLOW won";
                break;
        }
        status.innerHTML = "Game Over" + text;
        this.gameStop = true;
    }
}
