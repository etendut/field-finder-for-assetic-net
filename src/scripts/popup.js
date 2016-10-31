var defaultColor = '#008da8';
var dataDictionary;
var db = new SearchFieldlist();
var dbCat = new Categorylist();

var category;
var fieldItem;
var reloadOnSuccess;
var toastErrorOptions = {
    style: {
        main: {
            background: "pink",
            color: "black"
        }
    }
};

var toastInfoOptions = {
    style: {
        main: {
            background: "#008da8",
            color: "white"
        }
    }
};

function setupHelp() {
    var headerElements = $(".jsgrid-header-row th")
    var filterElements = $(".jsgrid-filter-row input")
    for (i = 0; i < headerElements.length; i++) {
        var filterElement = $(filterElements[i])
        switch ($(headerElements[i]).text().toUpperCase()) {
            case "CONTROL":
                filterElement.attr("data-step", 1);
                filterElement.attr("data-intro", "Start here, by searching for or a field by name");
                break;
            case "CONTROL GROUP":
                filterElement.attr("data-step", 2);
                filterElement.attr("data-intro", "Or here, by searcing for or a field by its group name");
                break;
            case "AVAILABLE?":
                filterElement.attr("data-step", 4);
                filterElement.attr("data-intro", "Available shows you if a field is available in the current Asset category");
                break;

            default:
                break;
        }
    }

    var element = $($(".jsgrid-row")[1]);
    element.attr("data-step", 3)
    element.attr("data-intro", "Found what you want, click on a row to navigate to the field")
    var element = $($(".jsgrid-row")[2]);
    element.attr("data-step", 5)
    element.attr("data-intro", "When you click on an unchecked row")

}
function setupHelp2() {
    
}


function getContext(callback) {
    sendMessage("getContext", {}, function(e) {
        if (e) {
            category = e.Category;
            db.setCategory(category)
            trackEvent('category-change:' + category);
        }!callback || callback();
    }, function() {
        !callback || callback();
    });
}

/* main code */
window.onload = function() {

    getContext(loadSearchGrid);

    $(".reload-app").click(function(e) {
        trackEvent("reload-app");
        location.reload();
    })

    $(".show-help").click(function(e) {
        trackEvent("show_help");
        setupHelp()
        introJs().start().setOption('doneLabel', 'Next page').start().oncomplete()
    })

    $(".backToFields").click(function(e) {
        $("#searchGrid").show();
        $("#categorySelector").hide();
    })

    chrome.tabs.onUpdated.addListener(function(tabId, info) {
        if (info.status == "complete") {
            showField(localStorage["showField"]);
            if (reloadOnSuccess) {
                reloadOnSuccess
                location.reload();
            }
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

function loadfirstCategoryAsset(item) {
    chrome.tabs.getSelected(function(tab) {
        var re = new RegExp('(.*?)(.assetic.net)(.*?)');
        var urlParts = re.exec(tab.url)
        if (urlParts && urlParts.length >= 3) {
            myNewUrl = urlParts[1] + urlParts[2] + '/api/ComplexAssetApi/Category?sort=Label-asc&page=1&pageSize=1&group=&filter=ComplexAssetCategoryLabel~eq~%27' + item.categoryLabel + '%27';
            spinner = new ajaxLoader($("body").parent());
            $.get(myNewUrl, function(data, status) {
                if (data && data.Data && data.Data.length > 0) {

                    myNewUrl = urlParts[1] + urlParts[2] + '/Assets/' + data.Data[0].Id + '/Complex/ComplexAsset/' + data.Data[0].Id + '/' + fieldItem.link
                    localStorage["showField"] = fieldItem.label;
                    reloadOnSuccess = true;
                    chrome.tabs.update(tab.id, { url: myNewUrl });
                    shrinkGrid();

                } else {
                    iqwerty.toast.Toast(item.categoryLabel + ' does not contain any assets, please choose another category!', toastInfoOptions);
                    !spinner || spinner.remove();
                }
            }).fail(function(e) {
                var message = !e || !e.responseText ? "Error encountered, please try refreshing the page." : e.responseText;
                iqwerty.toast.Toast(message, toastErrorOptions);
                !spinner || spinner.remove();
            });
        }
    });
}


function loadSearchLink(item) {

    if (!item || !item.label) {
        return;
    }
    trackEvent("link:" + category + '-' + item.label);

    if (!item.inCurrentCategory) {
        //show category popup
        dbCat.setTemplateIds(item.categoryTemplates)
        loadCategoryGrid();
        fieldItem = item;
        getContext();
        $("#searchGrid").hide();
        $("#categorySelector").show();
        return;
    } else {
        $("#searchGrid").show();
        $("#categorySelector").hide();
    }
    spinner = new ajaxLoader($("body").parent());
    shrinkGrid();
    chrome.tabs.getSelected(function(tab) {

        /*test URL pattern 1*/
        var re = new RegExp('(.*?)(\/Assets\/)(.*?)(\/Complex\/ComplexAsset\/)');
        var urlParts = re.exec(tab.url)
        var myNewUrl = "";
        if (!urlParts || urlParts.length < 4) {
            re = new RegExp('(.*?)(\/Assets\/)(.*?)(\/complex)');
            urlParts = re.exec(tab.url)
        }
        /*test URL pattern 2*/
        if (urlParts && urlParts.length > 4) {
            myNewUrl = urlParts[1] + '/Assets/' + urlParts[3] + "/Complex/ComplexAsset/" + urlParts[3] + item.link;
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
        delay(grid.search(), 500);

    });
    return $result;
}


function loadSearchGrid() {

    var checked = dbCat.templateExists(category);
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
            {
                name: "inCurrentCategory",
                title: "Available?",
                type: "checkbox",
                width: 40,
                sorting: false,
                filterTemplate: function() {
                    var $filterControl = jsGrid.fields.checkbox.prototype.filterTemplate.call(this);
                    return $filterControl.prop({
                        indeterminate: false,
                        readOnly: true,
                        checked: checked
                    });
                }
            }
        ]
    });
}


function loadCategoryGrid() {

    $("#categoryGrid").jsGrid({
        width: "100%",
        height: "400px",

        inserting: false,
        editing: false,
        filtering: true,
        sorting: true,
        paging: true,
        autoload: true,
        controller: dbCat,
        rowClick: function(args) {
            loadfirstCategoryAsset(args.item);
        },
        fields: [
            { name: "categoryLabel", title: "Category", type: "text", width: 150 },
        ]
    });
}