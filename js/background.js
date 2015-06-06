/***
 *
 * Our GeniueAPI Wrapper
 * 
 * */
function GeniusAPI(){
    this.AccessToken = 'Nu5fq30x1jNmL7acBaakn_5TP-rcgaZBTKLihfJ1T6LhZkEUT5O-I4Xjsyle_I50'; //TODO: get one...

    this._buildApiCall_webpage = function(uri){
        return "https://api.genius.com/web_pages/lookup?access_token="+ this.AccessToken +"&raw_annotatable_url="+ encodeURIComponent(uri) + "&_=" + Date.now();

    };

    // check if a given uri has any referents on Genius
    this.uri_checkHasAnnotation = function(uri){
        var apiCall = this._buildApiCall_webpage(uri);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", apiCall, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var resp = JSON.parse(xhr.responseText);
                // check that there's an annotation or not
                if((resp.meta.status == 200) && (resp.response.web_page != undefined)){
                    if(resp.response.web_page.annotation_count > 0) {
                        // show the annotation ON icon
                        togglePageActionIcon(true);
                        // cache the annotation response in case we might need to use it later on...
                        var data = {};
                        data[STORAGE_KEYS.ACTIVE_ANNOTATION] = resp;
                        var geniusAPI = new GeniusAPI();
                        data[STORAGE_KEYS.ACTIVE_ANNOTATE_CALL] = resp.response.web_page.share_url;
                        chrome.storage.local.set(data);
                    }else{
                        togglePageActionIcon(false);
                        var data = {};
                        data[STORAGE_KEYS.ACTIVE_ANNOTATION] = null;
                        // store api call we can use to initiate annotation of this uri
                        var geniusAPI = new GeniusAPI();
                        data[STORAGE_KEYS.ACTIVE_ANNOTATE_CALL] = resp.response.web_page.share_url;
                        chrome.storage.local.set(data);
                    }
                }else{
                    togglePageActionIcon(false);
                }
            }
        }
        xhr.send();

    };
}


/****** EVENT-HOOKS ******/
var lastTabId = 0;
chrome.tabs.onSelectionChanged.addListener(function(tabId) {
    lastTabId = tabId;
    chrome.pageAction.show(lastTabId);
    chrome.tabs.get(lastTabId, function(tab){
        var url = tab.url;
        if(!url.startsWith("http")) return;

        var geniusAPI = new GeniusAPI();
        geniusAPI.uri_checkHasAnnotation(url);
    });
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if(tabs.length == 0) return;
    lastTabId = tabs[0].id;
    chrome.pageAction.show(lastTabId);
    chrome.tabs.get(lastTabId, function(tab){
        var url = tab.url;
        if(!url.startsWith("http")) return;

        var geniusAPI = new GeniusAPI();
        geniusAPI.uri_checkHasAnnotation(url);
    });

});


// so we can intercept page loads, and determine if page has a corresponding
// annotation on Genius or not
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    lastTabId = tabId;
    chrome.pageAction.show(lastTabId);

    if (changeInfo.status == 'complete') {
        var url = tab.url;
        if(!url.startsWith("http")) return;

        var geniusAPI = new GeniusAPI();
        geniusAPI.uri_checkHasAnnotation(url);

    }
})
/****** end EVENT-HOOKS ******/


/****** GLOBALS ******/

// keys we'll be using to set/get stuff from storage
var STORAGE_KEYS = {
    ACTIVE_ANNOTATION: 'ACTIVE_ANNOTATION',
    ACTIVE_ANNOTATE_CALL: 'ACTIVE_ANNOTATE_CALL',
}

var statusOffIcons = {                    
    "32": "images/genie_32.png",
    "48": "images/genie_48.png"
};
var statusOnIcons = {
    "32": "images/statusOn/genie_32.png",
    "48": "images/statusOn/genie_48.png"
}
/****** end GLOBALS ******/

/****** UTILS ******/
function togglePageActionIcon(isOn){
    if(chrome.pageAction == undefined) return;
    if(isOn){
        chrome.tabs.get(lastTabId, function(tab){
            if(tab == undefined) return;
            chrome.pageAction.setIcon({tabId: tab.id, path: "images/statusOn/genie_32.png"});
        });
    }else{
        chrome.tabs.get(lastTabId, function(tab){
            if(tab == undefined) return;
            chrome.pageAction.setIcon({tabId: tab.id, path: "images/genie_32.png"});
        });
    }
}
/****** end UTILS ******/
