(function(document, window){

{
    var showOnScroll = document.querySelectorAll(".show-on-scroll");
    var hideOnScroll = document.querySelectorAll(".hide-on-scroll");
    var titleEl = document.querySelector(".entry-title");
    if (IntersectionObserver) {
        var watcher = new IntersectionObserver(function(entries){
            for (let entry of entries) {
                console.log(entry.target);
                if (entry.intersectionRatio <= 0) {
                    showOnScroll.forEach(function(el) { el.style.opacity = 1; });
                    hideOnScroll.forEach(function(el) { el.style.opacity = 0; });
                } else {
                    showOnScroll.forEach(function(el) { el.style.opacity = 0; });
                    hideOnScroll.forEach(function(el) { el.style.opacity = 1; });
                }
            }
        });
        watcher.observe(titleEl);
    } else {
        window.onscroll = function(){
            var bottom = titleEl.offsetTop + titleEl.offsetHeight;
            console.log(bottom, window.pageYOffset);
            if (bottom < window.pageYOffset) {
                showOnScroll.forEach(function(el) { el.style.opacity = 1; });
                hideOnScroll.forEach(function(el) { el.style.opacity = 0; });
            } else {
                showOnScroll.forEach(function(el) { el.style.opacity = 0; });
                hideOnScroll.forEach(function(el) { el.style.opacity = 1; });
            }
        };
    }
}

const LOGGED_IN = true;
if (LOGGED_IN) {
}
})(document, window);
