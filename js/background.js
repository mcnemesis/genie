/***
 *
 * Our GeniueAPI Wrapper
 * 
 * */
function GeniusAPI(){
    this.AccessToken = 'Nu5fq30x1jNmL7acBaakn_5TP-rcgaZBTKLihfJ1T6LhZkEUT5O-I4Xjsyle_I50'; //TODO: get one...
    this.geniusExtVersion = "0.0.13";


    this._buildApiCall_webpage = function(uri){
        return "https://api.genius.com/web_pages/lookup?access_token="+ this.AccessToken +"&raw_annotatable_url="+ encodeURIComponent(uri) + "&_=" + Date.now();

    };

    this.inject = function(tabId){
        /* implementation stolen from official beta ext ;-) -- we are merely improving the craft... don't cross the same river twice! */
        var injection_host = 'https://genius.com/';
        var injection_url = injection_host + 'bookmarklets/injection.js?s=extension&v=' + this.geniusExtVersion;
        var request = new XMLHttpRequest();
        request.onload = function () {
            var code = 'Object.defineProperty(document, "currentScript", {get: function () { return {src:"' + injection_url + '"}; }});' + this.responseText;
            chrome.tabs.executeScript(tabId, {code: code});
        };
        request.open('get', injection_url);
        request.send();
    };

    // check if a given uri has any referents on Genius
    this.uri_checkHasAnnotation = function(uri){
        var parsedUri = parseUri(uri);
        if(parsedUri.host.match(REGEX_GENIUS_HOSTS) != null){ // we are on a Genius site -- annotations implied or, should we support infinite recursion?! 
            // show that we are on Genius!
            togglePageActionIcon(ANNOTATATION_STATUS.GENIUS);
            var data = {};
            data[STORAGE_KEYS.ACTIVE_ANNOTATION] = null; // wish: there oughta be a means to get annotation info for content on Genius, by its uri as well, right?
            data[STORAGE_KEYS.ACTIVE_ANNOTATE_CALL] = '#'; // just keep us on same page
            data[STORAGE_KEYS.ON_GENIUS] = true; // we might just give em nice things...
            chrome.storage.local.set(data);
            return;
        }else{
            var data = {};
            data[STORAGE_KEYS.ON_GENIUS] = false; // so we clear any cached affirmations
            chrome.storage.local.set(data);
        }

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
                        togglePageActionIcon(ANNOTATATION_STATUS.ON);
                        // cache the annotation response in case we might need to use it later on...
                        var data = {};
                        data[STORAGE_KEYS.ACTIVE_ANNOTATION] = resp;
                        data[STORAGE_KEYS.ACTIVE_ANNOTATE_CALL] = resp.response.web_page.share_url;
                        chrome.storage.local.set(data);
                    }else{
                        togglePageActionIcon(ANNOTATATION_STATUS.OFF);
                        var data = {};
                        data[STORAGE_KEYS.ACTIVE_ANNOTATION] = null;
                        // store api call we can use to initiate annotation of this uri
                        data[STORAGE_KEYS.ACTIVE_ANNOTATE_CALL] = resp.response.web_page.share_url;
                        chrome.storage.local.set(data);
                    }
                }else{
                    togglePageActionIcon(ANNOTATATION_STATUS.OFF);
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
        if((url == undefined) || (!url.startsWith("http"))) return;

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
        if((url == undefined) || (!url.startsWith("http"))) return;

        var geniusAPI = new GeniusAPI();
        geniusAPI.uri_checkHasAnnotation(url);
    }
})
/****** end EVENT-HOOKS ******/


/****** GLOBALS ******/

var REGEX_GENIUS_HOSTS = /genius\.(com|it)$/i;

// keys we'll be using to set/get stuff from storage
var STORAGE_KEYS = {
    ACTIVE_ANNOTATION: 'ACTIVE_ANNOTATION',
    ACTIVE_ANNOTATE_CALL: 'ACTIVE_ANNOTATE_CALL',
    ON_GENIUS: 'ON_GENIUS'
}

var statusOffIcons = {                    
    "32": "images/genie_32.png",
    "48": "images/genie_48.png"
};

var statusOnIcons = {
    "32": "images/statusOn/genie_32.png",
    "48": "images/statusOn/genie_48.png"
}

var statusOnGeniusIcons = {
    "85": "images/special/genius.png",
    "48": "images/special/genius_48.png",
    "32": "images/special/genius_32.png"
}

var defaultStatusIconSize = '32';
var ANNOTATATION_STATUS = {
    ON: 'on',
    OFF: 'off',
    GENIUS: 'genius'
}
var tabInlineAnnotationStatus = {}

/****** end GLOBALS ******/

/****** UTILS ******/
function toggleInlineAnnotation(){
    var geniusAPI = new GeniusAPI();
    geniusAPI.inject(lastTabId);
}

function togglePageActionIcon(state){
    if(chrome.pageAction == undefined) return;
    chrome.tabs.get(lastTabId, function(tab){
        if(tab == undefined) return;
        if(state == ANNOTATATION_STATUS.ON){
            // docs indicate 'path' can be a dictionary, but that failed on me
            // (see: https://developer.chrome.com/extensions/pageAction#method-setIcon)
            chrome.pageAction.setIcon({tabId: tab.id, path: statusOnIcons[defaultStatusIconSize]}); 
        }else if(state == ANNOTATATION_STATUS.OFF){
            chrome.pageAction.setIcon({tabId: tab.id, path: statusOffIcons[defaultStatusIconSize]});
        }else if(state == ANNOTATATION_STATUS.GENIUS){
            chrome.pageAction.setIcon({tabId: tab.id, path: statusOnGeniusIcons[defaultStatusIconSize]});
        }
    });
}

// ------ ParseUri (c/o: http://blog.stevenlevithan.com/archives/parseuri )
function parseUri (str) {
    var o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};
// ------ end ParseUri 
/****** end UTILS ******/
