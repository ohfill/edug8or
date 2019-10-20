console.log('starting edug8or')

// this will likely become more complex in the future
// and have references to caching etc, for now we will do it all within the server object
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
            console.log(`CACHE | ${evt.title} | ${evt.url}`)
        }
    })
    cache.dumpCache()
}

/* start the app */
loadSources()
loadCache()

console.log(server)

/* start the polling */
for (const src of server.sources) {
    src.poll()      // this will trigger looping/setInterval as needed in the src class
    src.sync.on('event', (evt) => {
        console.log(`${src.name} | ${evt.title} | ${evt.url}`)
    })
}
