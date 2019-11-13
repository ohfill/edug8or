console.log("starting edug8or worker")

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

/* load all our modules */
loadSources()

console.log(server)

/* start the polling */
for (const src of server.sources) {
    src.poll()      // this will trigger looping/setInterval as needed in the src class
    src.sync.on('event', (evt) => {
        console.log(`${evt.foundAt.toISOString()} | ${src.name} | ${evt.title} | ${evt.url}`)
    })
}
