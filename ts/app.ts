const DRAW:number = 0;
const EMPTY:number = 0;
const PLAYER_1:number = 1; //RED
const PLAYER_2:number = 2; //YELLOW
const BOARD_WIDTH:number = 7;
const BOARD_HEIGHT:number = 6;
const SCALE:number = 0.7; //Scale board and game piece size
const DEFAULT_BORDER_RADIUS = 15;
const GAME_PIECE_RADIUS:number = 46 * SCALE;
const GAME_SECTION_SIZE:number = 100 * SCALE;
const FPS:number = 1;
const RED:string = "#ce3e30";
const YELLOW:string = "#e7e051";
const BLUE:string = "#6890cb";

let board: Board;

//create the board game once window has loaded
window.onload = () => {
    board = new Board();
}

/*
 * Game Piece
 */
class GamePiece {
    private value:number;
    private x:number; //current x-axis coordinate in the canvas
    private y:number; //current y-axis coordinate in the canvas
    private end_y:number; //y-axis destination
    private color:string;

    /*
     * GamePiece's constructor.
     * @x number X-coordinate that the game piece belongs to within the board matrix
     * @y number y-coordinate that the game piece belongs to within the board matrix
     */
    constructor (x:number,y:number){
        this.value = EMPTY;
        this.x = (x * GAME_SECTION_SIZE) + (GAME_SECTION_SIZE/2);
        this.y = -GAME_PIECE_RADIUS;
        this.end_y = (y * GAME_SECTION_SIZE) + (GAME_SECTION_SIZE/2);
        this.color = null;
    }

    /*
     * Updates the game piece vertical postion.
     */
    update_pos(){
        const PIXEL_CHANGE = 5;
        if(this.value != EMPTY && this.y < this.end_y) {
            this.y = this.y + PIXEL_CHANGE;
            if(this.y > this.end_y) this.y = this.end_y;
        }
    }
    
    /*
     * Draws the game piece.
     * @ctx CanvasRenderingContext2D Canvas rending context to be drawn on
     */
    draw(ctx:CanvasRenderingContext2D){
        if(this.value == EMPTY) return;
        ctx.globalCompositeOperation='destination-over';
        ctx.beginPath();
        ctx.arc(this.x, this.y, GAME_PIECE_RADIUS, 0, 2 * Math.PI, false);
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.stroke();
    }

    /*
     * Sets the player who played this piece: Player1(RED)/Player2(YELLOW)
     * @player number Player who played the game piece
     */
    setPlayer(player:number){
        this.value = player;
        this.color = this.value == 1 ? RED : YELLOW;
    }

    /*
     * Gets the player who played this piece.
     * @return The player
     */
    getPlayer(){
        return this.value;
    }
}

/*
 * The Board which controls the game
 */
class Board {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private matrix:GamePiece[][];
    private interval: number;
    private turn:number;
    private game:number;
    private gameStop:boolean;
    private newGameBtn:HTMLButtonElement;

    /*
     * Board's contructor.
     * Initiatize the canvas and starts the game.
     * Game event listeners are also set here.
     */
    constructor(){
        this.game = 0;
        this.turn = 0;
        this.turn = PLAYER_1;
        this.canvas = <HTMLCanvasElement>document.getElementById("cnvs");
        this.canvas.width = GAME_SECTION_SIZE * BOARD_WIDTH;
        this.canvas.height = GAME_SECTION_SIZE * BOARD_HEIGHT;
        this.canvas.style["border-radius"] = (DEFAULT_BORDER_RADIUS * SCALE).toString() + "px";
        this.ctx = this.canvas.getContext("2d");
        this.matrix = new Array();
        this.gameStop = true;

        this.newGame();

        this.canvas.addEventListener("click",(event: MouseEvent) => this.checkMove(event.offsetX));
        
        this.newGameBtn = <HTMLButtonElement>document.getElementById("newGame");
        this.newGameBtn.addEventListener("click",(event: MouseEvent) => this.newGame());
    }

    /* 
     * Clears the canvas.
     */
    clear(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /*
     * Draws the board with cut out circles.
     */
    drawBoard(){
        this.ctx.fillStyle=BLUE;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for(let i=0;i < this.matrix.length;i++){
            for(let j=0; j < this.matrix[i].length;j++){
                let x:number = (i * GAME_SECTION_SIZE) + (GAME_SECTION_SIZE/2);
                let y:number = (j * GAME_SECTION_SIZE) + (GAME_SECTION_SIZE/2);
                this.ctx.save();
                this.ctx.globalCompositeOperation='destination-out';
                this.ctx.beginPath();
                this.ctx.arc(x, y, GAME_PIECE_RADIUS, 0, 2 * Math.PI, false);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    }

    /*
     * Unlocks the game and starts a new Game.
     * This will increment the game number to determines who goes first and updates the status.
     * The game pieces will also be reseted and the animation will start.
     */
    newGame(){
        this.gameStop = false;
        this.game++;
        this.turn = this.game % 2 == 1 ? PLAYER_1 : PLAYER_2;
        this.displayTurn();
        for(var i:number = 0; i < BOARD_WIDTH; i++) {
            if(typeof this.matrix[i] == "undefined") this.matrix[i] = new Array();
            for(var j: number = 0; j< BOARD_HEIGHT; j++) {
                this.matrix[i][j] = new GamePiece(i,j);
            }
        }
        this.interval = setInterval(() => this.updateGameArea(), FPS);        
    }

    /* 
     * Updates the Game Area for animation. This is achived by 
     *  1. clearing the board.
     *  2. redrawing the board.
     *  3. updating the game pieces' position
     *  4. redrawing the game pieces.
     */
    updateGameArea(){
        this.clear();
        this.drawBoard();
        for(let i=0;i < this.matrix.length;i++){
            for(let j=0; j < this.matrix[i].length;j++){
                this.matrix[i][j].update_pos();
                this.matrix[i][j].draw(this.ctx);
            }
        }
    }

    /* 
     * Checks the move which was just made and executes the move if valid.
     * If the move was valid, this will also call on IsGameOver to check if the game has ended yet.
     * If the game has ended, it will call on gameOver to end the game.
     * If the game has not ended yet, it will switch the player.
     */
    checkMove(xInput:number){
        let x:number = Math.floor(xInput / GAME_SECTION_SIZE);
        let y:number = -1;
        let gp:GamePiece;

        if(this.gameStop) return;

        for(let i = BOARD_HEIGHT - 1; i >= 0; i--){
            if(this.matrix[x][i].getPlayer() == EMPTY) {
                y = i;
                gp = this.matrix[x][i];
                break;
            }
        }

        //check if move is valid
        if(typeof gp != "undefined"){
            gp.setPlayer(this.turn);
            let gameStatus:number = this.isGameOver(x,y);
            if(gameStatus != -1){
                this.gameOver(gameStatus);
                return;
            }
            this.switchPlayer();
        }
    }

    /* 
     * Switch between Player1(RED) and PLAYER2(YELLOW)'s turn. I will also call on displayTurn to update the status.
     */
    switchPlayer(){
        /* here the code can be changed to check if the next player is a bot
         * if it is, a new function can be created and call on to determine what move it should move and with checkMove, the move can be executed.
         */
        this.turn = this.turn == PLAYER_1 ? PLAYER_2 : PLAYER_1;
        this.displayTurn();
    }

    /* 
     * Displays the current player's turn: RED / YELLOW 
     */
    displayTurn(){
        let status:HTMLHeadElement = <HTMLHeadElement>document.getElementById("status");
        let color:string = this.turn == PLAYER_1 ? "RED" : "YELLOW";
        status.innerHTML = color + "'s turn";
    }

    /*
     * Checks if the last move is a game ending move.
     * @return Returns the winner, DRAW, or -1 for game has not ended yet.
     */
    isGameOver(x:number, y:number){
        let count:number;
        let temp_x:number;
        let temp_y:number;
        
        //1. check vertically
        count = 1;
        temp_y = y + 1;
        while(temp_y < this.matrix[x].length  && this.matrix[x][temp_y].getPlayer() == this.turn){
             count++;
             temp_y++;
             if(count == 4) return this.turn;
        }

        //2. check horizontally
        count = 1;
        temp_x = x + 1;
        while(temp_x < this.matrix.length  && this.matrix[temp_x][y].getPlayer() == this.turn){ //check right side
             count++;
             temp_x++;
             if(count == 4) return this.turn;
        }

        temp_x = x - 1
        while(temp_x >= 0  && this.matrix[temp_x][y].getPlayer() == this.turn){ //check left side
            count++;
            temp_x--;
            if(count == 4) return this.turn;
        }

        //3. check diagonally - top left to bottom right
        count = 1;
        
        temp_x = x + 1;
        temp_y = y + 1;
        while(temp_x < this.matrix.length && temp_y < this.matrix[temp_x].length && this.matrix[temp_x][temp_y].getPlayer() == this.turn){ //check bottom right side
             count++;
             temp_x++;
             temp_y++;
             if(count == 4) return this.turn;
        }

        temp_x = x - 1
        temp_y = y - 1
        while(temp_x >= 0 && temp_y >= 0 && this.matrix[temp_x][temp_y].getPlayer() == this.turn){ //check upper left side
            count++;
            temp_x--;
            temp_y--;
            if(count == 4) return this.turn;
        }

        //4. check diagonally - top right to bottom left
        count = 1;
        
        temp_x = x + 1;
        temp_y = y - 1;
        while(temp_x < this.matrix.length && temp_y >= 0 && this.matrix[temp_x][temp_y].getPlayer() == this.turn){ //check upper right side
             count++;
             temp_x++;
             temp_y--;
             if(count == 4) return this.turn;
        }

        temp_x = x - 1
        temp_y = y + 1
        while(temp_x >= 0 && temp_y < this.matrix[temp_x].length && this.matrix[temp_x][temp_y].getPlayer() == this.turn){ //check bottom left side
            count++;
            temp_x--;
            temp_y++;
            if(count == 4) return this.turn;
        }
        
        //check if board is filled
        for(let i:number = 0; i < BOARD_WIDTH; i++) {
            if(this.matrix[i][0].getPlayer() == EMPTY ) return -1;
        }

        //Board is fill and no one won
        return DRAW;
    }

    /* 
     * Update the status with the winner and locks the game.
     */
    gameOver(winner:number){
        let status:HTMLHeadElement = <HTMLHeadElement>document.getElementById("status");
        let text:string;
        switch (winner){
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