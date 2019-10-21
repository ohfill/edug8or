console.log('starting edug8or')

// configure the webserver
const express = require('express')
const app = express()
const expressWS = require('express-ws')(app)

app.get('/', (req, res) => {
    // just return the static page, can inline scripts and styles for now
    res.sendFile("./index.html", {root: __dirname})
})

var sender
app.ws('/events', (ws, req) => {
    // this is pretty bad, see comments at function declarations
    sender = sendEvent(ws)
    loadCache()
    // all the client sends are keep-alives
    ws.on('message', (msg) => {
        ws.send('pong')
    })
})

function broadcastEvent(src, event) {
    let v = JSON.stringify({source: src, event: event})
    for (ws of expressWS.getWss("/events").clients) {
        ws.send(v)
    }
}

// configure the actual backend
const server = {
    sources: []
}

function loadSources() {
    const fs = require('fs')
    for (const file of fs.readdirSync('./sources').filter(f => f.endsWith('.js'))) {
        const src = require(`./sources/${file}`)
        server.sources.push(src)
    }
}

function loadCache() {
    let cache = require('./cache')
    cache.history.on('history', (evts) => {
        for (let evt of evts) {
            //ws.send(JSON.stringify({source: "CACHE", event: evt}))    // this did not work, I think the reason
            // is that the single ws instance is assigned to all future 'history' events, so a client refresh crashes it
            sender("CACHE", evt)
        }
    })
    cache.dumpCache()
}

// this is a huge hack until I figure something better out
// as I understand it, this will "work" as long as no two clients connect at the same time
function sendEvent(ws) {
    if (ws !== undefined) {
        return (source, event) => {
            return ws.send(JSON.stringify({source: source, event: event}))
        }
    } else {
        console.log('no ws yet?')
    }
}

/* start the app */
loadSources()

console.log(server)

/* start the polling */
for (const src of server.sources) {
    src.poll()      // this will trigger looping/setInterval as needed in the src class
    src.sync.on('event', (evt) => {
        console.log(`${src.name} | ${evt.title} | ${evt.url}`)
        broadcastEvent(src.name, evt)
    })
}

// finally start the webserver
app.listen(process.env.PORT || 5000)
