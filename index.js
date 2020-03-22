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

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
    // NOTE: Do something here to start the game

    // Response data
    const data = {
        color: '#FF0000',
    }

    return response.json(data)
})

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
    // console.log(board);
}

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

