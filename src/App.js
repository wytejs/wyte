const Server = require('./Server')

class App {
    constructor (config = {}) {
        this.config = config

        if (!this.config.secret) {
            // Log in yellow text: [WARNING] No secret provided, using default secret instead
            console.log('\x1b[33m[WARNING] No secret provided, using default secret instead\x1b[0m')
            this.config.secret = 'wyte-secret'
        }

        this.Server = new Server(config)
    }

    listen (port = 8080, callback = () => { console.log('\u001B[36m[Wyte] Server started\x1b[0m') }) {
        this.Server.listen(port, callback)
    }

    get (path, callback) {
        this.Server.expressApp.get(path, callback)
    }

    post (path, callback) {
        this.Server.expressApp.post(path, callback)
    }

    put (path, callback) {
        this.Server.expressApp.put(path, callback)
    }

    delete (path, callback) {
        this.Server.expressApp.delete(path, callback)
    }

    useMiddleware (middleware) {
        this.Server.expressApp.use(middleware)
    }

    notFound (callback) {
        this.Server.expressApp.get('*', (req, res) => {
            // Set status code to 404
            res.status(404)
            callback(req, res)
        })
    }
}

module.exports = App