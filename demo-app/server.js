const Wyte = require('../main')

const app = new Wyte.App({
    secret: 'SOME RANDOM LETTERS'
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.notFound((req, res) => {
    res.send('404 Not Found!')
})

app.listen(8080)