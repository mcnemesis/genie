function updateStatus(){
    chrome.runtime.getBackgroundPage(function (bg) {
        if(bg == undefined) return;

        var STORAGE_KEYS = bg.STORAGE_KEYS;
        chrome.storage.local.get([STORAGE_KEYS.ACTIVE_ANNOTATION, STORAGE_KEYS.ACTIVE_ANNOTATE_CALL], function(data){
            var activeAnnotation = data[STORAGE_KEYS.ACTIVE_ANNOTATION];
            var activeAnnotateCall = data[STORAGE_KEYS.ACTIVE_ANNOTATE_CALL];
            var statusEl = document.getElementById('annotation_status');
            if(activeAnnotation != null){
                var count = activeAnnotation.response.web_page.annotation_count;
                statusEl.innerHTML = "Yo! There's <b>"+ count +"</b> annotation" + (count>0?"s":"") +' for this page!<hr/>View or Add more <a href="'+ activeAnnotateCall +'" id="annotate_uri" class="annotate_link"> <img src="images/genius_logo.png" class="genius_logo" /> </a>';
            }else{
                statusEl.innerHTML = 'Start the first annotation for this page by clicking <a href="'+ activeAnnotateCall +'" id="annotate_uri" class="annotate_link"> <img src="images/genius_logo.png" class="genius_logo" /> </a>';
            }
        });
    });
}

window.addEventListener("load", updateStatus);
window.addEventListener('click',function(e){
  var href = e.target.parentElement.href;
  if(href != undefined){
    chrome.tabs.create({url:href})
  }
})
