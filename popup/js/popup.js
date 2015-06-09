function updateStatus(){
    chrome.runtime.getBackgroundPage(function (bg) {
        if(bg == undefined) return;

        var STORAGE_KEYS = bg.STORAGE_KEYS;
        chrome.storage.local.get([STORAGE_KEYS.ON_GENIUS, STORAGE_KEYS.ACTIVE_ANNOTATION, STORAGE_KEYS.ACTIVE_ANNOTATE_CALL], function(data){
            var activeAnnotation = data[STORAGE_KEYS.ACTIVE_ANNOTATION];
            var activeAnnotateCall = data[STORAGE_KEYS.ACTIVE_ANNOTATE_CALL];
            var onGenius = data[STORAGE_KEYS.ON_GENIUS];
            var statusEl = document.getElementById('annotation_status');
            chrome.runtime.getBackgroundPage(function (bg) {
                if(bg == undefined) return;
                var useInlineAnnotations = bg.tabInlineAnnotationStatus[bg.lastTabId];
                var useInlineEl = document.getElementById('annotateHere');
                useInlineEl.checked = useInlineAnnotations;
            });

            if(onGenius){
                statusEl.innerHTML = 'You, are ON Genius!<hr/><a href="https://genius.com"><img class="genius_link" src="images/genius_sigil_128.png" class="genius_logo" /></a>';

            }else{
                if(activeAnnotation != null){
                    var count = activeAnnotation.response.web_page.annotation_count;
                    statusEl.innerHTML = "Yo! There's <span class='numberCircle'>"+ count +"</span> annotation" + (count>0?"s":"") +' for this page!<hr/>View or Add more via <a href="'+ activeAnnotateCall +'" id="annotate_uri" class="annotate_link"> <img src="images/genius_logo.png" class="genius_link" /> </a>';
                }else{
                    statusEl.innerHTML = 'Start the first annotation for this page by visiting <a href="'+ activeAnnotateCall +'" id="annotate_uri" class="annotate_link"> <img src="images/genius_logo.png" class="genius_link" /> </a>';
                }
            }
        });
    });
}

function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}


/* register some callbacks */
window.addEventListener("load", updateStatus);
window.addEventListener("load", function(){
    var el = document.getElementById('annotateHere');
    el.addEventListener('change', function(e){
        chrome.runtime.getBackgroundPage(function (bg) {
            if(bg == undefined) return;
            var checked = e.target.checked;
            var data = {};
            // we'll be injecting Genius annotations straight into active page 
            bg.tabInlineAnnotationStatus[bg.lastTabId] = checked;
            if(!checked){ // meaning we could have already injected stuff... reload tab
                chrome.tabs.reload();
            }
            else
                bg.toggleInlineAnnotation();

        });
    });
});
window.addEventListener('click',function(e){
    var href = e.target.parentElement.href;
    if(href != undefined){
        chrome.tabs.create({url:href})
    }
});

