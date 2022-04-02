const path = require('path')
const fs = require('fs')
const getAllFiles = require('../utils/getAllFiles')

function renderEngine (data, req, res) {

    const boilerplate = `
        const $_SESSION=${JSON.stringify(req.session)};
        const $_COOKIES=${JSON.stringify(req.cookies)};
    `

    // WYTE_IF
    data = data.replace(/<!--( *?)WYTE_IF\[(.*?)\]( *?)-->(.*?)<!--( *?)WYTE_FI( *?)-->/gms, function (match, ws1, condition, ws2, content, ws3, ws4) {
        const conditionExecuted = eval(boilerplate + condition)

        if (conditionExecuted) {
            return content
        } else {
            return ''
        }
    })

    // WYTE IF=""
    data = data.replace(/<WYTE( *?)IF="(.*?)">(.*?)<\/WYTE>/gms, function (match, ws1, condition, content) {
        const conditionExecuted = eval(boilerplate + condition)

        if (conditionExecuted) {
            return content
        } else {
            return ''
        }
    })

    // WYTE GET=""
    data = data.replace(/<WYTE( *?)GET="(.*?)"( *?)\/>/gms, function (match, ws1, exec_, ws2) {
        return eval(boilerplate + exec_)
    })

    return data
}

const Vanilla = {
    readRoutesDir () {
        return getAllFiles(path.join('frontend', 'routes'))
    },

    readRoutesDirWithFullPath () {
        return getAllFiles(path.join('frontend', 'routes')).map(f => path.join('frontend', 'routes', f))
    },

    readRoutesDirOnlyURIPath () {
        return getAllFiles(path.join('frontend', 'routes')).map(f => f.replace(/index\.html/g, '')).map(f => f.replace('.html', '')).map(r => r.endsWith('/') ? r.substring(0, r.length - 1) : r).map(f => f.trim() === '' ? '/' : f).map(f => f.startsWith('/') ? f : '/' + f)
    },

    render (path, req, res) {
        fs.readFile(path, (err, data) => {
            if (err) {
                res.send(err)
            } else {
                data = data.toString('utf-8')

                // Status Code:
                data = data.replace(/<!--( *?)WYTE_STATUS:(\d*?)( *?)-->/g, function (match, _1, code, _2) {
                    res.status(code)
                    return ''
                })

                data = data.replace(/<WYTE( *?)STATUS="(\d*?)"( *)(\/|)>/g, function (match, ws1, code) {
                    res.status(code)
                    return ''
                })

                // Render
                data = renderEngine(data, req, res)

                res.send(data)
            }
        })
    }
}

module.exports = Vanilla