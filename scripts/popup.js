var defaultColor = '#008da8';
var dataDictionary;
var db = new SearchFieldlist();

window.onload = function() {

    loadOptions();
    loadSearchGrid();
    $("#colorChooser").change(
        function(e) {
            var newColor = this.jscolor.toHEXString()
            var currentColor = loadCurrentColor()
            sendMessage("changeColor", { oldColor: currentColor, newColor: newColor }, saveCurrentColor(newColor))

        });
    $("#eraseOptions").click(function() {
        eraseOptions();
    })
    $("#reload").click(function() {
        location.reload();
    })

    chrome.tabs.onUpdated.addListener(function(tabId, info) {
        if (info.status == "complete") {

            var field = localStorage["showField"];
            if (field) {
                sendMessage("showField", { field: field }, function() {
                    localStorage.removeItem("showField");
                    unShrinkGrid();

                    if (spinner) {
                        spinner.remove();
                    }
                })

            }
        }
    });


};

function shrinkGrid() {
    $("#searchGrid").addClass("maxheight10");
}

function unShrinkGrid() {
    $("#searchGrid").removeClass("maxheight10");
}

function sendMessage(action, data, successFunction) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: action, data: data }, function(response) {
            console.log(response);
            if (response && response.success) {
                successFunction;
            }
        });
    });
}

var spinner;

function loadSearchLink(item) {
    spinner = new ajaxLoader($("body"));
    shrinkGrid();
    chrome.tabs.getSelected(function(tab) {

        var re = new RegExp('(.*?)(\/Assets\/)(.*?)(\/Complex\/ComplexAsset\/)');
        var urlParts = re.exec(tab.url)
        if (!urlParts || urlParts.length < 4) {
            return;
        }

        var myNewUrl = urlParts[1] + urlParts[2] + urlParts[3] + urlParts[4] + urlParts[3] + item.link;

        localStorage["showField"] = item.label;

        chrome.tabs.update(tab.id, { url: myNewUrl });

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
        filterToolbar: {
            searchOnEnter: false,
            ignoreCase: true
        },
        fields: [
            // { name: "mdpLabel", title: "myData Label", type: "text", width: 150 },
            { name: "label", title: "Control", type: "text", width: 150 },
            { name: "help", title: "Control Help", type: "text", width: 200 },
            { name: "type", title: "Control Type", type: "text", width: 100, sorting: false },
            { name: "group", title: "Control Group", type: "text", width: 100 }

        ]
    });
}

function loadCurrentColor() {
    var currentColor = localStorage["currentColor"];

    // valid colors are red, blue, green and yellow
    if (!currentColor) {
        currentColor = defaultColor;
    }

    return currentColor;
}

function saveCurrentColor(newColor) {
    if (!newColor) {
        return;
    }
    localStorage["currentColor"] = newColor;
}

function loadOptions() {
    $("#colorChooser").val(loadCurrentColor()).addClass("jscolor");
    jscolor.installByClassName("jscolor");
}

function eraseOptions() {
    localStorage.removeItem("currentColor");
    location.reload();
}