
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 4;
const MAX_BALL_SPEED = 7;

// Objects in game, with ball speed and score detection 
const game = {
    playerScore: 0,
    computerScore: 0,
    gameRunning: true,
    ballSpeed: INITIAL_BALL_SPEED
};
// Left paddle dimensions and area
const leftPaddle = {
    x: 10,
    y: (GAME_HEIGHT - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};
// right paddle dimensions and area
const rightPaddle = {
    x: GAME_WIDTH - PADDLE_WIDTH - 10,
    y: (GAME_HEIGHT - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const ball = {
    x: (GAME_WIDTH - BALL_SIZE) / 2,
    y: (GAME_HEIGHT - BALL_SIZE) / 2,
    size: BALL_SIZE,
    dx: game.ballSpeed,
    dy: game.ballSpeed,
    speed: game.ballSpeed
};

// Tracking for keyboard input (up arrow and down arrow keys)
const keys = {
    arrowUp: false,
    arrowDown: false
};

// Tracking user cursor
let mouseY = GAME_HEIGHT / 2;

// Doc obj model elements 
const gameBoard = document.getElementById('gameBoard');
const leftPaddleEl = document.getElementById('leftPaddle');
const rightPaddleEl = document.getElementById('rightPaddle');
const ballEl = document.getElementById('ball');
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const resetBtn = document.getElementById('resetBtn');

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.arrowUp = true;
    if (e.key === 'ArrowDown') keys.arrowDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.arrowUp = false;
    if (e.key === 'ArrowDown') keys.arrowDown = false;
});

gameBoard.addEventListener('mousemove', (e) => {
    const rect = gameBoard.getBoundingClientRect();
    mouseY = e.clientY - rect.top - PADDLE_HEIGHT / 2;
});

resetBtn.addEventListener('click', resetGame);

// Update left paddle of player
function updateLeftPaddle() {
// Allow arrow keys as an alternative to playing with just the cursor
    let targetY = mouseY;
    
    if (keys.arrowUp) {
        targetY = leftPaddle.y - PADDLE_SPEED;
    } else if (keys.arrowDown) {
        targetY = leftPaddle.y + PADDLE_SPEED;
    }
    
    // Add movement towards th target
    if (targetY !== undefined) {
        const diff = targetY - leftPaddle.y;
        leftPaddle.y += diff * 0.15; // Smooth movement
    }
    
    // add the boundary collision mechanic so it doesn't just go off the screen
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + PADDLE_HEIGHT > GAME_HEIGHT) {
        leftPaddle.y = GAME_HEIGHT - PADDLE_HEIGHT;
    }
    
    leftPaddleEl.style.top = leftPaddle.y + 'px';
}

// Update the right paddle of the computer AI
function updateRightPaddle() {
    const paddleCenter = rightPaddle.y + PADDLE_HEIGHT / 2;
    const ballCenter = ball.y + BALL_SIZE / 2;
    
    // Simple AI: follow the ball with a bit of lag/delay
    const difficulty = 0.04; // AI aggressiveness (0-1)
    
    if (ballCenter < paddleCenter - 35) {
        rightPaddle.y -= PADDLE_SPEED * 0.8;
    } else if (ballCenter > paddleCenter + 35) {
        rightPaddle.y += PADDLE_SPEED * 0.8;
    }
    
    // Boundary collision restraint
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + PADDLE_HEIGHT > GAME_HEIGHT) {
        rightPaddle.y = GAME_HEIGHT - PADDLE_HEIGHT;
    }
    
    rightPaddleEl.style.top = rightPaddle.y + 'px';
}

// Update the ball positioning
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top + bottom wall collision so it doesn't float off the screen again
        
    if (ball.y <= 0 || ball.y + BALL_SIZE >= GAME_HEIGHT) {
        ball.dy = -ball.dy;
        ball.y = Math.max(0, Math.min(ball.y, GAME_HEIGHT - BALL_SIZE));
    }
    
    // Left paddle collision
    if (
        ball.x <= leftPaddle.x + leftPaddle.width &&
        ball.y + BALL_SIZE >= leftPaddle.y &&
        ball.y <= leftPaddle.y + leftPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = leftPaddle.x + leftPaddle.width;
        
        // Add spin effect based on where the ball hits the paddle
        const hitPos = (ball.y + BALL_SIZE / 2 - (leftPaddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.dy += hitPos * 2;
        
        // Increase the ball speed gradually as it moves
        ball.speed = Math.min(ball.speed + 0.3, MAX_BALL_SPEED);
        ball.dx = Math.sign(ball.dx) * ball.speed;
        ball.dy = Math.sign(ball.dy) * Math.sqrt(ball.speed * ball.speed - ball.dx * ball.dx);
    }
    
    // Right paddle collision
    if (
        ball.x + BALL_SIZE >= rightPaddle.x &&
        ball.y + BALL_SIZE >= rightPaddle.y &&
        ball.y <= rightPaddle.y + rightPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = rightPaddle.x - BALL_SIZE;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y + BALL_SIZE / 2 - (rightPaddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.dy += hitPos * 2;
        
        // Increase ball speed gradually
        ball.speed = Math.min(ball.speed + 0.3, MAX_BALL_SPEED);
        ball.dx = Math.sign(ball.dx) * ball.speed;
        ball.dy = Math.sign(ball.dy) * Math.sqrt(ball.speed * ball.speed - ball.dx * ball.dx);
    }
    
    // Left wall hit impact means computer scores ,player loses point
    if (ball.x < 0) {
        game.computerScore++;
        computerScoreEl.textContent = game.computerScore;
        resetBall();
    }
    
        // Right wall means the player scores)l  
    if (ball.x > GAME_WIDTH) {
        game.playerScore++;
        playerScoreEl.textContent = game.playerScore;
        resetBall();
    }
    
    ballEl.style.left = ball.x + 'px';
    ballEl.style.top = ball.y + 'px';
}

// Reset ball to center
function resetBall() {
    ball.x = (GAME_WIDTH - BALL_SIZE) / 2;
    ball.y = (GAME_HEIGHT - BALL_SIZE) / 2;
    ball.speed = INITIAL_BALL_SPEED;
    
    // Random direction
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * 2 * ball.speed;
    
    ballEl.style.left = ball.x + 'px';
    ballEl.style.top = ball.y + 'px';
}

// Reset the whole game
function resetGame() {
    game.playerScore = 0;
    game.computerScore = 0;
    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    
    leftPaddle.y = (GAME_HEIGHT - PADDLE_HEIGHT) / 2;
    rightPaddle.y = (GAME_HEIGHT - PADDLE_HEIGHT) / 2;
    
    leftPaddleEl.style.top = leftPaddle.y + 'px';
    rightPaddleEl.style.top = rightPaddle.y + 'px';
    
    resetBall();
}

// Game loop
function gameLoop() {
    if (game.gameRunning) {
        updateLeftPaddle();
        updateRightPaddle();
        updateBall();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start  game
gameLoop();
