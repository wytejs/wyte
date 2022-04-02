const Wyte = require('../main')

const app = new Wyte.App({
    secret: 'SOME RANDOM LETTERS'
})

// Add socket.io to the Stack
/*app.Stack.use('$socket.io').ready((io) => {
    io.on('connection', (socket) => {
        console.log('\u001B[36m[Socket] Socket.io connection established\x1b[0m')
    })
})*/

app.Stack.use(function (app, fireReadyEvent) {
    app.get('/hi', (req, res) => {
        res.send('Hello World!')
    })
})

app.passive('/', (req) => {
    console.log('\u001B[36m[Wyte] Route accessed\x1b[0m')
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.notFound((req, res) => {
    res.send('404 Not Found!')
})

app.listen(8080)