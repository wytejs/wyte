const Server = require('./Server')
const Stack = require('./Stack')
const path = require('path')
const fs = require('fs')
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

    /**
     * @description Adds a Wyte middleware to the stack
     * @param {Function} mw The Wyte middleware to be added to the stack
     * @returns {Object} An object containing a ready property which is a function that takes a callback as an argument and is called when the middleware is ready
     * @example
     * app.use(require('@wyte/socket.io')).ready((io) => console.log(io))
    */
    use (middleware) {
        this.Stack.use(middleware)
    }

    /**
     * @discussion Servers files from the specified path
     * @param {String} path Path to directory with static files
     */
    static (path) {
        this.useMiddleware(require('express').static(path))
    }

    /**
     * Automatically serves files from the ./frontend directory
     * @param {Object} templateEngine Template engine to use (e.g. Wyte.Vanilla)
     */
    serve (templateEngine) {
        // Serve files from the frontend/static directory
        this.static(path.join('frontend', 'static'))

        // Serve & Render files from the frontend/routes directory
        // List every file in the directory
        const routes = templateEngine.readRoutesDir()
        const routesPath = templateEngine.readRoutesDirWithFullPath()
        const routesName = templateEngine.readRoutesDirOnlyURIPath()

        for (const route of routes) {
            const index = routes.indexOf(route)
            const routePath = routesPath[index]
            const routeName = routesName[index]

            this.get(routeName, (req, res) => {
                templateEngine.render(routePath, req, res)
            })
        }
    }
}

module.exports = App