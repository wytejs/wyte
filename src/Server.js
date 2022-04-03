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

        this.expressApp.use((req, res, next) => {
            req.remoteAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            next()
        })

        this.expressApp.use(function (req, res, next) {
            req.root = req.protocol + '://' + req.get('host')
            next()
        })
    }

    listen (port, callback = () => {}) {
        this.port = port
        this.httpApp.listen(port, callback)
    }
}

module.exports = Server