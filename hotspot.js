const canvas = document.getElementById('hit-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const imgs = Array.from(document.querySelectorAll('.hotspot-img'));

// Load each image into an offscreen canvas for pixel-reading
const imgData = imgs.map(img => {
    const c = document.createElement('canvas');
    const x = c.getContext('2d', { willReadFrequently: true });
    img.addEventListener('load', () => drawToCanvas(img, c, x));
    if (img.complete) drawToCanvas(img, c, x);
    return { img, canvas: c, ctx: x };
});

function drawToCanvas(img, c, x) {
    c.width  = img.naturalWidth;
    c.height = img.naturalHeight;
    x.drawImage(img, 0, 0);
}

function getAlphaAt(entry, mouseX, mouseY) {
    const rect = entry.img.getBoundingClientRect();
    // Map mouse position to the image's natural pixel coords
    const scaleX = entry.canvas.width  / rect.width;
    const scaleY = entry.canvas.height / rect.height;
    const px = Math.floor((mouseX - rect.left) * scaleX);
    const py = Math.floor((mouseY - rect.top)  * scaleY);
    if (px < 0 || py < 0 || px >= entry.canvas.width || py >= entry.canvas.height) return 0;
    return entry.ctx.getImageData(px, py, 1, 1).data[3]; // alpha channel
}

document.addEventListener('mousemove', e => {
    imgData.forEach(entry => {
        const alpha = getAlphaAt(entry, e.clientX, e.clientY);
        entry.img.classList.toggle('hovered', alpha > 10);
    });
});

document.addEventListener('click', e => {
    // Click the topmost visible (non-transparent) hotspot
    for (let i = imgData.length - 1; i >= 0; i--) {
        const entry = imgData[i];
        const alpha = getAlphaAt(entry, e.clientX, e.clientY);
        if (alpha > 10) {
            window.location.href = entry.img.dataset.href;
            return;
        }
    }
});
