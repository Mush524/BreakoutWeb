const canvas = document.getElementById("layer1");
const layer2 = document.getElementById("layer2");
const ctx = canvas.getContext("2d");
const ctxTrail = layer2.getContext("2d");

let score = 0;
let lives = 5;
let speed = 0;

let x = canvas.width / 2;
let y = canvas.height - 100;

let dx = 4;
let dy = -4;

let tx = 0;
let ty = 0;

const ballRadius = 6;
const paddleHeight = 15;
const paddleWidth = 150;
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = 0;
let paddleLeft = false;
let paddleRight = false;
let paddleChange = 0;

let downPressed = false;
let rightPressed = false;
let leftPressed = false;

const grd = ctx.createLinearGradient(0, 0, 1800, 0);
grd.addColorStop(0, "blue");
grd.addColorStop(1, "cyan");

const brickRowCount = 3;
const brickColumnCount = 12;
const brickWidth = 110;
const brickHeight = 20;
const brickPadding = 30;
const brickOffsetTop = 70;
const brickOffsetLeft = 70;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) 
{
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) 
    {
        bricks[c][r] = { x: 0, y: 0, status: 1};
    }
}

function playSound(e)
{
    if (e == "hit")
    {
        var metal = new Audio('sounds/metal.ogg');
        metal.play();
    }
    else if (e == "break")
    {
        var hit = new Audio('sounds/break.ogg');
        hit.play();
    }
    else if (e == "death")
    {
        var death = new Audio('sounds/death.ogg');
        death.play();
    }
}

function checkdy(distanceY)
{
    if (distanceY > 0)
    {
        dy = -4;
    }
    else
    {
        dy = 4;
    }
}

function drawTrail()
{
    ctxTrail.fillStyle = 'rgba(240, 240, 240, 0.18)';
    ctxTrail.fillRect(0, 0, layer2.width, layer2.height);
    ctxTrail.beginPath();
    ctxTrail.fillStyle = '#ff0000';
    ctxTrail.arc(x, y, 6, 0, Math.PI*2);
    ctxTrail.fill();
}

function drawBall()
{
    ctx.beginPath();
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;
    ctx.shadowBlur = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() 
{
    ctx.beginPath();
    //change -80 to change paddleY
    paddleY = canvas.height - paddleHeight - 80;
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);

    const grdPaddle = ctx.createLinearGradient(paddleX-paddleWidth, paddleY-paddleHeight, paddleX+paddleWidth, paddleY+paddleHeight);
    grdPaddle.addColorStop(0, "red");
    grdPaddle.addColorStop(1, "orange");
    ctx.fillStyle = grdPaddle;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() 
{
    for (let c = 0; c < brickColumnCount; c++) 
    {
        for (let r = 0; r < brickRowCount; r++) 
        {
            if (bricks[c][r].status === 1)
            {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);

                ctx.fillStyle = grd;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}


ctxTrail.canvas.width  = window.innerWidth;
ctxTrail.canvas.height = window.innerHeight;

function draw()
{   
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    drawBall();
    drawTrail();
    drawPaddle();
    drawBricks();
    collisionDetection();
    drawScore();
    drawLives();
    drawChange();
    x += dx;
    y += dy;
    
    //Collision Detection
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) 
    {
        if (dx > 0)
        {
            dx = -4;
        }
        else
        {
            dx = 4;
        }
        if (dy > 0)
        {
            dy = 4;
        }
        else
        {
            dy = -4;
        }
        playSound("hit");
    }

    if (y + dy < ballRadius) 
    {
        checkdy(dy);
        playSound("hit");
    } 
    //the last value should be paddleHeight + paddleY
    else if (y + dy > canvas.height - ballRadius - 95) 
    {
        if (x > paddleX && x < paddleX + paddleWidth && y < paddleY) 
        {
            //Determines what angle for the ball to bounce at depending on the paddles speed
            speed = (paddleX/paddleChange)*2;
            if (paddleRight && dx > 0)
            {
                dy = -dy+speed;
            }
            else if (paddleRight && dx < 0)
            {
                dy = -dy-speed;
            }

            if (paddleLeft && dx < 0)
            {
                dy = -dy+speed;
            }
            else if (paddleLeft && dx > 0)
            {
                dy = -dy-speed;
            }

            if(!paddleLeft && !paddleRight)
            {
                dy = -dy;
            }

            playSound("hit");
        } 
    }

    //+300 to make it wait a bit before making a new ball
    if (y + dy > canvas.height - ballRadius + 200)
    {

        lives--;
        playSound("death");

        if (!lives) 
        {
            alert("GAME OVER");
            document.location.reload();
            clearInterval(interval); // Needed for Chrome to end game
        } 
        else 
        {
            x = canvas.width / 2;
            y = canvas.height - 100;
            dy = -dy;
        }

    }
    
    
    //Collision detection of the paddle
    if (downPressed)
    {
        if (rightPressed) 
        {
            paddleX = Math.min(paddleX + 15, canvas.width - paddleWidth);
        } 
        else if (leftPressed) 
        {
            paddleX = Math.max(paddleX - 15, 0);
        }
    }
    else
    {
        if (rightPressed) 
        {
            paddleX = Math.min(paddleX + 30, canvas.width - paddleWidth);
        } 
        else if (leftPressed) 
        {
            paddleX = Math.max(paddleX - 30, 0);
        }
    }
    
    requestAnimationFrame(draw);
}
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

//Event handler for the paddle
function keyDownHandler(e) 
{
    if (e.key === "Right" || e.key === "ArrowRight") 
    {
        rightPressed = true;
    } 
    else if (e.key === "Left" || e.key === "ArrowLeft") 
    {
        leftPressed = true;
    }
    else if (e.key === "Down" || e.key === "ArrowDown")
    {
        downPressed = true;
    }
}

function keyUpHandler(e) 
{
    if (e.key === "Right" || e.key === "ArrowRight") 
    {
        rightPressed = false;
    } 
    else if (e.key === "Left" || e.key === "ArrowLeft") 
    {
        leftPressed = false;
    }
    else if (e.key === "Down" || e.key === "ArrowDown")
    {
        downPressed = false;   
    }
}

function mouseMoveHandler(e) 
{
    paddleChange = paddleX;
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) 
    {
        paddleX = relativeX - paddleWidth / 2;
        if (paddleChange < paddleX)
        {
            paddleRight = true;
        }
        else
        {
            paddleRight = false;
        }

        if (paddleChange > paddleX)
        {
            paddleLeft = true;
        }
        else
        {
            paddleLeft = false;
        }
    }
}

function collisionDetection() 
{
    for (let c = 0; c < brickColumnCount; c++) 
    {
        for (let r = 0; r < brickRowCount; r++) 
        {
            const b = bricks[c][r];
            if (b.status === 1)
            {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) 
                {
                    checkdy(dy);
                    b.status = 0;
                    score++;
                    playSound("break");
                    if (score === brickRowCount * brickColumnCount) 
                    {
                        alert("YOU WIN, CONGRATULATIONS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawScore() 
{
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(`Score: ${score}`, 8, 35);
}

function drawLives() 
{
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(`Lives: ${lives}`, 120, 35);
}

function drawChange() 
{
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(`PaddleX: ${paddleX}    Paddle Change: ${paddleChange}    Paddle Left: ${paddleLeft}    Paddle Right: ${paddleRight}    dx: ${dx}    dy: ${dy}`, 600, 35);
}

draw();
