const maxStories = 100
var storyIds = []

function addStoryToFeed(id, datetime, storySource, url, headline) {
    const feed = document.getElementById('feed');
    const storyTemplate = document.getElementById('story-template');
    const newStory = storyTemplate.cloneNode(true);
    feed.insertBefore(newStory, feed.firstChild);

    const newStoryDiv = feed.firstChild;
    const datetimeDIV = newStoryDiv.getElementsByClassName('datetime')[0];
    const sourceDIV = newStoryDiv.getElementsByClassName('source')[0];
    const hoveroverDIV = newStoryDiv.getElementsByClassName('hoverover')[0];
    const headlineLink = newStoryDiv.getElementsByClassName('headlineLink')[0];

    storyIds.push(id)
    newStoryDiv.id = id;
    newStoryDiv.classList.add('story');
    newStoryDiv.classList.remove('story-template');
    newStoryDiv.classList.remove('hidden');
    datetimeDIV.innerText = datetime;
    sourceDIV.innerText = storySource;
    hoveroverDIV.onmouseover = () => { setPreview(hoveroverDIV, url) };
    headlineLink.innerText = headline;
    headlineLink.href = url;

    pruneStories()
}

// do i need to do locking here to protect storyIds?
function pruneStories() {
    while (storyIds.length > maxStories) {
        let removeId = storyIds.shift()
        let toRemove = document.getElementById(removeId)
        toRemove.parentElement.removeChild(toRemove)
    }
}

function updateConnectionIndicator(isConnected) {
    const status = document.getElementById('status');
    if (isConnected) {
        status.classList.remove('red');
        status.classList.add('green');
    } else {
        status.classList.remove('green');
        status.classList.add('red');
    }
}

function clearStoryFeed() {
    const feed = document.getElementById('feed');
    const loadedStories = feed.getElementsByClassName('story');
    for (const story of loadedStories) {
        feed.removeChild(story);
    }
}
