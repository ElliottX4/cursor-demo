class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        
        // 游戏板
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        
        // 方块形状定义
        this.shapes = {
            I: [[1, 1, 1, 1]],
            J: [[1, 0, 0], [1, 1, 1]],
            L: [[0, 0, 1], [1, 1, 1]],
            O: [[1, 1], [1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            T: [[0, 1, 0], [1, 1, 1]],
            Z: [[1, 1, 0], [0, 1, 1]]
        };
        
        // 方块颜色
        this.colors = {
            I: '#00f0f0',
            J: '#0000f0',
            L: '#f0a000',
            O: '#f0f000',
            S: '#00f000',
            T: '#a000f0',
            Z: '#f00000'
        };
        
        this.currentPiece = this.getNewPiece();
        this.nextPiece = this.getNewPiece();
        
        this.bindControls();
        this.initButtons();
    }
    
    initButtons() {
        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.gameOver) {
                this.reset();
            }
            this.start();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
    }
    
    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.isPaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    break;
                case 'ArrowDown':
                    this.moveDown();
                    break;
                case 'ArrowUp':
                    this.rotate();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
            }
        });
    }
    
    getNewPiece() {
        const shapes = Object.keys(this.shapes);
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        return {
            shape: this.shapes[randomShape],
            color: this.colors[randomShape],
            x: Math.floor((this.cols - this.shapes[randomShape][0].length) / 2),
            y: 0
        };
    }
    
    drawBlock(x, y, color, ctx = this.ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, this.blockSize - 1);
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制已固定的方块
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }
        
        // 绘制当前方块
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(this.currentPiece.x + x, this.currentPiece.y + y, this.currentPiece.color);
                }
            });
        });
        
        // 绘制下一个方块
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * this.blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * this.blockSize) / 2;
        
        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(
                        offsetX + x * this.blockSize,
                        offsetY + y * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                }
            });
        });
    }
    
    moveLeft() {
        this.currentPiece.x--;
        if (this.checkCollision()) {
            this.currentPiece.x++;
        }
        this.draw();
    }
    
    moveRight() {
        this.currentPiece.x++;
        if (this.checkCollision()) {
            this.currentPiece.x--;
        }
        this.draw();
    }
    
    moveDown() {
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.freeze();
            this.clearLines();
            this.spawnNewPiece();
        }
        this.draw();
    }
    
    hardDrop() {
        while (!this.checkCollision()) {
            this.currentPiece.y++;
        }
        this.currentPiece.y--;
        this.freeze();
        this.clearLines();
        this.spawnNewPiece();
        this.draw();
    }
    
    rotate() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const previousShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision()) {
            this.currentPiece.shape = previousShape;
        }
        
        this.draw();
    }
    
    checkCollision() {
        return this.currentPiece.shape.some((row, dy) => {
            return row.some((value, dx) => {
                if (!value) return false;
                
                const newX = this.currentPiece.x + dx;
                const newY = this.currentPiece.y + dy;
                
                return (
                    newX < 0 ||
                    newX >= this.cols ||
                    newY >= this.rows ||
                    (newY >= 0 && this.board[newY][newX])
                );
            });
        });
    }
    
    freeze() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][this.currentPiece.x + x] = this.currentPiece.color;
                    }
                }
            });
        });
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
    }
    
    updateScore(linesCleared) {
        const points = [0, 100, 300, 500, 800];
        this.score += points[linesCleared] * this.level;
        document.getElementById('score').textContent = this.score;
        
        if (this.score >= this.level * 1000) {
            this.level++;
            document.getElementById('level').textContent = this.level;
        }
    }
    
    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getNewPiece();
        
        if (this.checkCollision()) {
            this.gameOver = true;
            alert('游戏结束！最终得分：' + this.score);
        }
    }
    
    reset() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.currentPiece = this.getNewPiece();
        this.nextPiece = this.getNewPiece();
        
        document.getElementById('score').textContent = '0';
        document.getElementById('level').textContent = '1';
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '继续' : '暂停';
    }
    
    start() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        this.gameInterval = setInterval(() => {
            if (!this.isPaused && !this.gameOver) {
                this.moveDown();
            }
        }, 1000 / this.level);
        
        document.getElementById('startBtn').textContent = '重新开始';
    }
}

// 初始化游戏
const game = new Tetris(); 