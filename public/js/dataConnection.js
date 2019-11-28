const socketAddr = `ws://${document.location.host}/events`;
let socket;

function openConnection() {
    let lastDate = new Date();
    socket = new WebSocket(socketAddr);

    socket.onopen = (e) => {
        updateConnectionIndicator(true);

        // clear the feed on refresh because we will send whole cache
        clearStoryFeed();

        let ka = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(lastDate);
            } else if (socket.readyState === WebSocket.CLOSED) {
                clearInterval(ka);
            }
        }, 1000*25);    // heroku needs a keep alive at least once in 55 seconds, we do 25 just to be safe
        console.log('ws connected, it should only log errors');
    };

    socket.onclose = (e) => {
        updateConnectionIndicator(false);
        console.log('ws closed');
        return restoreConnection();
    };

    socket.onerror = (e) => {
        console.error("websocket error", e);
        socket.close();
    };

    socket.onmessage = (e) => {
        let recv = e.data;
        // shouldn't neet keep alive ping/pong with worker model
        let event = JSON.parse(recv);
        lastDate = event.foundAt;
        processEvent(event);
    };
}

async function restoreConnection() {
    let connectionRetries = 0;
    const maxConnectionRetries = 10;

    while (connectionRetries < maxConnectionRetries) {
        ++connectionRetries;
        console.log(`retrying...${connectionRetries}/${maxConnectionRetries}`);
        if (await tryWakeup()) {
            return openConnection();
        } else {
            await new Promise(r=>setTimeout(r,1000));
        }
    }
}

async function tryWakeup() {
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", "/wake");

        xhr.onload = () => resolve(true);
        xhr.onerror = () => resolve(false);

        xhr.send()
    });
}

function processEvent(event) {
    const datetime = new Date(event.foundAt).toLocaleString();
    const storySource = event.source;
    const url = event.url;
    const headline = event.title;

    addStoryToFeed(datetime, storySource, url, headline);
}
