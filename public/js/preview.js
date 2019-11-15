function setPreview(storyDiv, url) {
    console.log(`setting preview for ${url}`);
    const preview = document.getElementById('preview');
    const previewContainer = document.getElementById('previewContainer');
    preview.src = url;
    previewContainer.classList.remove('hidden');
    previewContainer.style.top = `${storyDiv.offsetTop+storyDiv.offsetHeight}px`; // add ~0.5em so we can still click the link
    previewContainer.style.left = `${storyDiv.offsetLeft+storyDiv.offsetWidth}px`;
}

function unsetPreview() {
    const preview = document.getElementById('preview');
    const previewContainer = document.getElementById('previewContainer');
    preview.src = '';
    previewContainer.classList.add('hidden');
}
