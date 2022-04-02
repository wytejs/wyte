const Server = require('./Server')
const Stack = require('./Stack')
const { EventEmitter } = require('events')

class App {
    /**
     * @description Initializes new Wyte App
     * @param {Object} config 
     */
    constructor (config = {}) {
        this.config = config
        this.events = new EventEmitter()
        this._dnfHandler = (req, res) => {
            res.send('404')
        }

        if (!this.config.secret) {
            // Log in yellow text: [WARNING] No secret provided, using default secret instead
            console.log('\x1b[33m[WARNING] No secret provided, using default secret instead\x1b[0m')
            this.config.secret = 'wyte-secret'
        }

        this.Server = new Server(config)
        this.Stack = new Stack(this)
    }

    /**
     * Listens on specified port
     * @param {Number} port 
     * @param {Function} callback 
     */
    listen (port = 8080, callback = () => { console.log('\u001B[36m[Wyte] Server started\x1b[0m') }) {
        // Initialize the stack
        this.Stack.initialize()

        // 404 Not Found
        this.events.emit('initialize404Route')

        // Listen on the port
        this.Server.listen(port, callback)
    }

    /**
     * @description Is called when route is accessed by client using GET
     * @param {String} path 
     * @param {Function} callback 
     */
    get (path, callback) {
        this.Server.expressApp.get(path, callback)
    }

    /**
     * @description Is called when route is accessed by client using POST
     * @param {String} path 
     * @param {Function} callback 
     */
    post (path, callback) {
        this.Server.expressApp.post(path, callback)
    }

    /**
     * @description Is called when route is accessed by client using PUT
     * @param {String} path 
     * @param {Function} callback 
     */
    put (path, callback) {
        this.Server.expressApp.put(path, callback)
    }

    /**
     * @description Is called when route is accessed by client using DELETE
     * @param {String} path 
     * @param {Function} callback 
     */
    delete (path, callback) {
        this.Server.expressApp.delete(path, callback)
    }

    /**
     * @description Adds an EXPRESS middleware to the stack
     * @param {Function} middleware Express middleware
     */
    useMiddleware (middleware) {
        this.Server.expressApp.use(middleware)
    }

    /**
     * @description Is called when route is accessed by client. IMPORTANT: .passive() won't give you the ability to use res
     * @param {String} path Route path
     * @param {Function} callback Callback when route is called
     */
    passive (path, callback) {
        this.useMiddleware((req, res, next) => {
            const parsedPath = req.path.replace(/:(.*?)($|\/)/g, function (match, paramId) {
                return req.params[paramId]
            })

            if (parsedPath === path) {
                callback(req)
                next()
            } else {
                next()
            }
        })
    }

    /**
     * @description Is called when a undefined route is accessed by the client
     * @param {Function} callback 
     */
    notFound (callback) {
        this.events.on('initialize404Route', () => {
            this._dnfHandler = (req, res) => {
                // Set status code to 404
                res.status(404)
                callback(req, res)
            }

            this.Server.expressApp.get('*', (req, res) => {
                // Set status code to 404
                res.status(404)
                callback(req, res)
            })
        })
    }
}

module.exports = App