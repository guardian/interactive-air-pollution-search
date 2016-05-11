const interval = 15, total = 300;

export default function scrollTo(start, end, cb) {
    var distance = end - start;
    var elapsed = 0;

    window.requestAnimationFrame(function scrollHandler() {
        var t = elapsed / total;
        cb(Math.floor(start + distance * t * (2 - t)));
        if (elapsed < total) {
            elapsed += interval;
            window.requestAnimationFrame(scrollHandler);
        }
    });

    return end;
};

