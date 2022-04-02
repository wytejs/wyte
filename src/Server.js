const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')

class Server {
    constructor (config) {
        this.config = config
        this.expressApp = express()
        this.httpApp = require('http').Server(this.expressApp)
        this.port = 8080
        this.initializeApp()
    }

    initializeApp () {
        this.initSession()
    }

    initSession () {
        this.expressApp.use(session({
            secret: this.config.secret,
            resave: false,
            saveUninitialized: true
        }))

        this.expressApp.use(cookieParser())
    }

    listen (port, callback = () => {}) {
        this.port = port
        this.httpApp.listen(port, callback)
    }
}

module.exports = Server