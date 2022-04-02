const { EventEmitter } = require('events')

class Stack {
    /**
     * @description Initializes a new Wyte Stack
     * @param {App} app 
     */
    constructor (app) {
        this.WyteApp = app
        this.middleWares = []
        this.mwReadyEmitter = new EventEmitter()
    }

    /**
     * @description Fires Ready Event for a middleware using the middleware index
     * @warning This method should not be called manually
     */
    _fireReadyEvent (mwIndex, ...args) {
        this.mwReadyEmitter.emit(`${mwIndex}`, ...args)
    }

    /**
     * @description Retrieves the ready event of a middleware
     * @warning This method should not be called manually
     */
    _readyEvent (mwIndex) {
        return {
            ready: (callback) => {
                this.mwReadyEmitter.on(`${mwIndex}`, callback)
            }
        }
    }

    /**
     * @description Adds a Wyte middleware to the stack
     * @param {Function} mw The Wyte middleware to be added to the stack
     * @returns {Object} An object containing a ready property which is a function that takes a callback as an argument and is called when the middleware is ready
     * @example
     * app.Stack.use(require('@wyte/socket.io')).ready((io) => console.log(io))
    */
    use (mw) {
        if (typeof mw === 'function') {
            // Do nothing, a function is just fine
        } else {
            throw new Error('Invalid middleware', mw)
        }

        // Use the middleware
        const mwIndex = this.middleWares.push(mw) - 1

        return this._readyEvent(mwIndex)
    }

    /**
     * @description Initializes the stack
     * @warning This method should not be called manually
     */
    initialize () {
        const self = this

        let i = 0
        for (const mw of this.middleWares) {
            mw(this.WyteApp, (...args) => {
                self._fireReadyEvent(i, ...args)
            }) // The middleware function receives the arguments: app : App, fireReadyEvent : Function

            i++
        }
    }
}

module.exports = Stack