var defaultColor = '#008da8';
var dataDictionary;
var db = new SearchFieldlist();
var category;
/* main code */
window.onload = function() {

    sendMessage("getContext", {}, function(e) {
        if (e) {
            category = e.Category;
            db.setCategory(category)
            trackEvent('category-change:' + category);
            $("#searchGrid").jsGrid("reset");
        }
        loadSearchGrid();
    }, function() {
        loadSearchGrid();
    });

    $(".reload-app").click(function(e) {
        trackEvent("reload-app");
        location.reload();
    })

    chrome.tabs.onUpdated.addListener(function(tabId, info) {
        if (info.status == "complete") {
            showField(localStorage["showField"]);
        }
    });


};

var delay = (function() {
    var timer = 0;
    return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

function showField(field) {

    if (field) {
        sendMessage("showField", { field: field }, function() {
            localStorage.removeItem("showField");
            unShrinkGrid();
        }, function() {
            delay(function() {
                unShrinkGrid();
            }, 1000);
        })
    }
}

function shrinkGrid() {
    $("#searchGrid").addClass("maxheight10");
}

function unShrinkGrid() {
    $("#searchGrid").removeClass("maxheight10");
    !spinner || spinner.remove();
}

function sendMessage(action, data, successFunction, failFunction) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: action, data: data }, function(response) {
            if (response && response.success && successFunction) {
                successFunction(response.data);
            } else if (failFunction) {
                failFunction(response)
            } else {
                console.log('message received ' + response)
            }

        });
    });
}

var spinner;

function loadSearchLink(item) {

    if (!item || !item.label) {
        return;
    }
    if (!item.inCurrentCategory) {
        //show category popup
    }
    trackEvent("link:" + category + '-' + item.label);
    spinner = new ajaxLoader($("body").parent());
    shrinkGrid();
    chrome.tabs.getSelected(function(tab) {

        /*test URL pattern 1*/
        var re = new RegExp('(.*?)(\/Assets\/)(.*?)(\/Complex\/ComplexAsset\/)');
        var urlParts = re.exec(tab.url)
        var myNewUrl = "";
        if (urlParts && urlParts.length >= 4) {
            myNewUrl = urlParts[1] + urlParts[2] + urlParts[3] + urlParts[4] + urlParts[3] + item.link;
        }
        /*test URL pattern 2*/
        re = new RegExp('(.*?)(\/Assets\/)(.*?)(\/complex)');
        urlParts = re.exec(tab.url)
        if (urlParts && urlParts.length > 4) {
            myNewUrl = urlParts[1] + urlParts[2] + urlParts[3] + "/Complex/ComplexAsset/" + urlParts[3] + item.link;
        }
        if (myNewUrl != "") {
            /*Reload tab*/

            if (tab.url.toUpperCase() != myNewUrl.toUpperCase()) {
                localStorage["showField"] = item.label;
                chrome.tabs.update(tab.id, { url: myNewUrl });
                return;
            }
            /*highlight on same tab*/
            showField(item.label)
            return;
        } else {
            /*reset grid*/
            unShrinkGrid();
            !spinner || spinner.remove();
        }
    });
}


/* Search on keypress*/
var originalFilterTemplate = jsGrid.fields.text.prototype.filterTemplate;
jsGrid.fields.text.prototype.filterTemplate = function() {
    var grid = this._grid;
    var $result = originalFilterTemplate.call(this);
    $result.on("keyup", function(e) {
        // TODO: add proper condition and optionally throttling to avoid too much requests  
        grid.search();
    });
    return $result;
}


function loadSearchGrid() {

    $("#searchGrid").jsGrid({
        width: "100%",
        height: "400px",

        inserting: false,
        editing: false,
        filtering: true,
        sorting: true,
        paging: true,
        autoload: true,
        //data: dataDictionary,
        controller: db,
        rowClick: function(args) {
            loadSearchLink(args.item);
        },
        fields: [
            // { name: "mdpLabel", title: "myData Label", type: "text", width: 150 },
            { name: "label", title: "Control", type: "text", width: 150 },
            { name: "help", title: "Control Help", type: "text", width: 200 },
            { name: "type", title: "Control Type", type: "text", width: 80, sorting: false },
            { name: "group", title: "Control Group", type: "text", width: 100 },
            { name: "inCurrentCategory", title: "Available?", type: "checkbox", width: 40, sorting: false, visible: false }

        ]
    });
}