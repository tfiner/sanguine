const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
    fallbackHandler,
    notFoundHandler,
    genericErrorHandler,
    poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)


// Handle POST request to '/start'
app.post('/start', (request, response) => {
    // NOTE: Do something here to start the game

    // Response data
    const data = {
        color: '#a13d2d',
    }

    return response.json(data)
})

// MATH
// ----
// Fundamental math and functions, this makes code 
// easier to reason about.
function make_point(x, y) { return {x, y}; }
function make_vector(x, y) { return {x, y}; }
function make_direction(x, y) { return make_vector(x,y); }

// Translates a point along a vector.
function translate(pt, vec) { 
    return make_point(pt['x']+vec['x'], pt['y']+vec['y']); 
}

// Given two points a,b return the vector v that
// points to b, so that:
//  a + v = b
function point_to_vector(a, b){
    return make_vector(b['x']-a['x'], b['y']-a['y']);
}

// Given two vectors v0, v1, return their dot product.
function dot(v0, v1) {
    return v0['x'] * v1['x'] + v0['y'] * v1['y'];
}

// The 4 cardinal directions:
// right, up, left, down
Cardinals = [
      make_direction(1,0)
    , make_direction(0,1)
    , make_direction(-1,0)
    , make_direction(0,-1)
];


// Battlesnake helpers
// -------------------
function get_snake_dir(snake_body) {
    head = snake_body[0];
    neck = snake_body[1];
    return point_to_vector(neck, head);
}

function inside_walls(pt, gameState) {
    return  pt.x >=0 && pt.x < gameState.width &&
            pt.y >=0 && pt.y < gameState.height;
}

// Convert math direction into move strings.
function direction_to_move(dir) {
    if (dir['x'] < 0)
        return 'left';
    if (dir['x'] > 0)
        return 'right';
    if (dir['y'] > 0)
        return 'down';
    return 'up';
}

function print_game_state(gameState) {

    var board = new Array(gameState.height);
    for (var i = 0; i < board.length; i++) {
        board[i] = new Array(gameState.width);
        for (var c = 0; c < board[i].length; c++)
            board[i][c] = "__";
    }

    for (const pt of gameState.food) {
        board[pt.y][pt.x] = ' f';
    }

    for (const snake of gameState.snakes) {
        for (const pt of snake.body)
            board[pt.y][pt.x] = ' *';
    }

    for (const pt of gameState.you.body)
        board[pt.y][pt.x] = ' X';

    process.stdout.write(`board ${board.length}x${board[0].length}:\n`);
    for (var y = 0; y < board.length; y++) {
        // process.stdout.write(`${y}: `);
        for (var x = 0; x < board[0].length; x++) {
            process.stdout.write(board[y][x]);
        }
        process.stdout.write("\n");
    }
    var dir = get_snake_dir(gameState.you.body);
    console.log(`You are pointing (${dir.x}, ${dir.y}), which is ${direction_to_move(dir)}`);
    // console.log(board);
}

// Battlesnake entry point

// Handle POST request to '/move'
app.post('/move', (request, response) => {

    // console.log(request.body.board.food);

    var gameState = {
        width: request.body.board.width
        , height: request.body.board.height
        , food: request.body.board.food
        , snakes: request.body.board.snakes
        , you: request.body.you
    };
    // console.log(gameState);

    print_game_state(gameState);

    // Response data
    const data = {
        move: 'up', // one of: ['up','down','left','right']
    }

    //   console.log(request.body.board);
    //   console.log(request.body.you);

    return response.json(data)
})

app.post('/end', (request, response) => {
    // NOTE: Any cleanup when a game is complete.
    return response.json({})
})

app.post('/ping', (request, response) => {
    // Used for checking if this snake is still alive.
    return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
    console.log('Server listening on port %s', app.get('port'))
})

