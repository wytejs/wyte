const path = require('path')
const fs = require('fs')
const getAllFiles = require('../utils/getAllFiles')

function renderEngine (data, req, res) {

    const boilerplate = `
        const $_SESSION=${JSON.stringify(req.session)};
        const $_COOKIES=${JSON.stringify(req.cookies)};
        const $_PARAMS=${JSON.stringify(req.params)};
        const $_URL=${JSON.stringify(req.url)};
        const $_ROOT=${JSON.stringify(req.root)};
        const $_IP=${JSON.stringify(req.remoteAddress)};
    `

    const WYTE_SESSION_JS_INIT_CODE = `
        const $_SESSION=${JSON.stringify(req.session)};
    `

    const WYTE_JS_INIT_CODE = `
        /* This script is important to bring Wyte Constants into the Client Side JS */
        /* $_SESSION is disabled due to security risks. If you need that functionality, add <WYTE INIT_SESS /> to your file. */
        const $_COOKIES=${JSON.stringify(req.cookies)};
        const $_PARAMS=${JSON.stringify(req.params)};
        const $_URL=${JSON.stringify(req.url)};
        const $_ROOT=${JSON.stringify(req.root)};
        const $_IP=${JSON.stringify(req.remoteAddress)};
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

    // <WYTE INIT_SESS />
    data = data.replace(/<WYTE INIT_SESS( *?)(\/|)>/msig, function () {
        return `<script>${WYTE_SESSION_JS_INIT_CODE}</script>`
    })

    // <WYTE INIT />
    data = data.replace(/<WYTE INIT( *?)(\/|)>/msig, function () {
        return `<script>${WYTE_JS_INIT_CODE}</script>`
    })

    // Server Side JavaScript (SSJS)
    data = data.replace(/<script SSJS>(.*?)<\/script>/gms, function (match, code) {
        const writeFuncs = `
            var __FOUT__ = "";
            function write (data) {
                __FOUT__ += data;
            };
            
            function newLine () {
                __FOUT__ += "<br>";
            };
        `

        const writeToDOM = `;__FOUT__;`

        const executed = eval(`${writeFuncs}${boilerplate}${code}${writeToDOM}`)

        return executed
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