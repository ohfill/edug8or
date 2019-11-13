console.log('starting edug8or')

// configure the webserver
const cache = require('./cache')
const Event = require('./mongo')
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
        (async () => {
            (await Event.since(msg)).forEach(c => {
                ws.send(JSON.stringify(c))
            })
        })()
    })
})

function broadcastEvent(changeEvt) {
    if (changeEvt.operationType === "insert") {
        let event = changeEvt.fullDocument
        for (ws of expressWS.getWss("/events").clients) {
            ws.send(JSON.stringify(event))
        }
    }
}

// finally start the webserver
app.listen(process.env.PORT || 5000)
