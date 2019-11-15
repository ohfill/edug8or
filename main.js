console.log('starting edug8or')

// configure the webserver
const cache = require('./cache')
const Event = require('./mongo')
const express = require('express')
const app = express()
const expressWS = require('express-ws')(app)

app.use(express.static("public"))

// have this so we can wake up the dyno if needed
app.get('/wake', (req, res) => {
    res.json({wake: "true"})
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
