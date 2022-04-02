const { EventEmitter } = require('events')

class Stack {
    constructor (app) {
        this.WyteApp = app
        this.middleWares = []
        this.mwReadyEmitter = new EventEmitter()
    }

    _fireReadyEvent (mwIndex, ...args) {
        this.mwReadyEmitter.emit(`${mwIndex}`, ...args)
    }

    _readyEvent (mwIndex) {
        return {
            ready: (callback) => {
                this.mwReadyEmitter.on(`${mwIndex}`, callback)
            }
        }
    }

    use (mw) {
        if (typeof mw === 'string') {
            if (mw.startsWith('$')) {
                mw = `@wyte/${mw.substring(1)}`
            }

            mw = require(mw)
        } else if (typeof mw === 'function') {
            // Do nothing, a function is just fine
        } else {
            throw new Error('Invalid middleware', mw)
        }

        // Use the middleware
        const mwIndex = this.middleWares.push(mw) - 1

        return this._readyEvent(mwIndex)
    }

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