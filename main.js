console.log('starting edug8or')

// configure the webserver
const cache = require('./cache')
const express = require('express')
const app = express()
const expressWS = require('express-ws')(app)

app.get('/', (req, res) => {
    // just return the static page, can inline scripts and styles for now
    res.sendFile("./index.html", {root: __dirname})
})

app.ws('/events', (ws, req) => {
    (async () => {
        (await cache.dumpCache()).forEach(c => {
            ws.send(JSON.stringify(c))
        });
    })()
    // all the client sends are keep-alives
    ws.on('message', (msg) => {
        ws.send('pong')
    })
})

function broadcastEvent(event) {
    for (ws of expressWS.getWss("/events").clients) {
        ws.send(JSON.stringify(event))
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

/* start the app */
loadSources()

console.log(server)

/* start the polling */
for (const src of server.sources) {
    src.poll()      // this will trigger looping/setInterval as needed in the src class
    src.sync.on('event', (evt) => {
        console.log(`${src.name} | ${evt.title} | ${evt.url}`)
        broadcastEvent(evt)
    })
}

// finally start the webserver
app.listen(process.env.PORT || 5000)
