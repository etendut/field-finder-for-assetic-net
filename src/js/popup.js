$(function() {
    $(".mdl-navigation__link.applink").click(function(e) {
        if (!e) {
            return;
        }
        e.preventDefault();
        $(".mdl-layout__drawer.is-visible").removeClass("is-visible")
        $(".mdl-layout__obfuscator.is-visible").removeClass("is-visible")
        var t = $(e.currentTarget).text();
        if (t && t.indexOf("help_outline") > -1) {
            showHelp(helpstage);
            helpstage = helpstage >= 2 ? 1 : helpstage += 1;
            return;
        } else if (t && t.indexOf("cloud_download") > -1) {
            var data = $('#searchGrid').jsGrid('option', 'data');

            if (data == '')
                return;

            var fields = $('#searchGrid').jsGrid('option', 'fields');
            //extract labels and names
            var columnLabels = [];
            var columns = [];

            $.each(fields, function(i, obj) {
                columnLabels.push([obj.title]);
                columns.push([obj.name]);
            });



            JSONToCSVConvertor(data, "Field Finder Grid Export", columns, columnLabels);
        } else {
            location.reload();
        }


    });
})

var defaultColor = '#03A9F4';
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
            background: "#03A9F4",
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
                filterElement.addClass("help1step1")
                break;
            case "CONTROL GROUP":
                filterElement.addClass("help1step2")
                break;
            case "AVAILABLE?":
                filterElement.addClass("help2step1");
                break;

            default:
                break;
        }
    }

    var element = $($("#searchGrid .jsgrid-row")[0]);
    element.addClass("help1step3");

    element = $($("#searchGrid .jsgrid-row")[0]);
    element.addClass("help2step2");

    element = $("#categorySelector");
    element.addClass("help2step3");

    element = $($("#categorySelector .jsgrid-row")[0]);
    element.addClass("help2step4");
}

function getHelpStage(stage) {
    switch (stage) {
        case 2:
            return [{
                    element: '.help2step1',
                    intro: 'Available shows you if a field is available in the current Asset category'
                },
                {
                    element: '.help2step1',
                    intro: 'Unchecking Available, will show all fields available in the Asset Register.'
                },
                {
                    element: '.help2step2',
                    intro: 'When you click on an unchecked row.'
                },
                {
                    element: '.help2step3',
                    intro: 'You will be presented with a list of categories to navigate to',
                    position: 'auto'
                },
                {
                    element: '.help2step4',
                    intro: 'Choose a Category to navigate to the field in that category'
                }
            ];

        default:
            return [{
                    intro: "This extension will help you find fields in the Asset Register.",
                },
                {
                    element: '.help1step1',
                    intro: 'Start here, by searching for a field by name.'
                },
                {
                    element: '.help1step2',
                    intro: 'Or here, by searcing for a field by its group name.'
                },
                {
                    element: '.help1step3',
                    intro: 'Found what you want, click on a row to navigate to the field'
                },
                {
                    element: '.show-help',
                    intro: 'Click <i class="material-icons" role="presentation">help_outline</i> again for more tips'
                }
            ];
    }


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

function showCategoryGrid() {
    $("#searchGrid").hide();
    $("#categorySelector").show();
    $(".mdl-layout-title").text("Navigate to Category..");
    $(".mdl-layout__drawer-button").hide();
    $(".backToFields").show();
    $("#categoryGrid").jsGrid("loadData");
}

function hideCategoryGrid() {
    $("#searchGrid").show();
    $("#categorySelector").hide();
    $(".mdl-layout-title").text("Field Finder");
}
//var helpstage = 1;
function showHelp(stage) {
    trackEvent("show_help_" + stage);
    switch (stage) {
        case 2:
            if ($(".help2step1").length <= 0)
                setupHelp()

            introJs().setOptions({
                    steps: getHelpStage(stage)
                }).onbeforechange(function(e) {
                    if (e && $(e).hasClass("help2step3")) {
                        showCategoryGrid();
                    }
                }).oncomplete(function() {
                    hideCategoryGrid();
                }).onexit(function() {
                    hideCategoryGrid();
                })
                .start();
            break;

        default:
            if ($(".help1step1").length <= 0)
                setupHelp()
            introJs().setOptions({ steps: getHelpStage(1) }).start();
            break;
    }
}
var helpstage = 1;
/* main code */
$(function() {
    getContext(loadSearchGrid);
    loadCategoryGrid();
    $(".reload-app").click(function(e) {
        trackEvent("reload-app");
        location.reload();
    })

    $(".backToFields").click(function(e) {
        $(this).hide()
        $(".mdl-layout__drawer-button").show();
        hideCategoryGrid();
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


});

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
            }, 2000);
        })
    }
}
var windowHeight;

function shrinkGrid() {
    windowHeight = $("html").height();
    $("html").addClass("shrinkWindow");
}

function unShrinkGrid() {
    $(".shrinkWindow").removeClass("shrinkWindow");
    $("#p2").hide();
    $("html").height(windowHeight ? windowHeight : 400);
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

function loadfirstCategoryAsset(item) {
    chrome.tabs.getSelected(function(tab) {
        var re = new RegExp('(.*?)(.assetic.net)(.*?)');
        var urlParts = re.exec(tab.url)
        if (urlParts && urlParts.length >= 3) {
            myNewUrl = urlParts[1] + urlParts[2] + '/api/ComplexAssetApi/Category?sort=Label-asc&page=1&pageSize=1&group=&filter=ComplexAssetCategoryLabel~eq~%27' + item.categoryLabel + '%27';
            $("#p2").show();
            $.get(myNewUrl, function(data, status) {
                if (data && data.Data && data.Data.length > 0) {

                    myNewUrl = urlParts[1] + urlParts[2] + '/Assets/' + data.Data[0].Id + '/Complex/ComplexAsset/' + data.Data[0].Id + '/' + fieldItem.link
                    localStorage["showField"] = fieldItem.label;
                    reloadOnSuccess = true;
                    chrome.tabs.update(tab.id, { url: myNewUrl });
                    shrinkGrid();

                } else {
                    iqwerty.toast.Toast(item.categoryLabel + ' does not contain any assets, please choose another category!', toastInfoOptions);
                    $("#p2").hide();
                }
            }).fail(function(e) {
                var message = !e || !e.responseText ? "Error encountered, please try refreshing the page." : e.responseText;
                iqwerty.toast.Toast(message, toastErrorOptions);
                $("#p2").hide();
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
        fieldItem = item;
        getContext();
        showCategoryGrid();
        return;
    } else {
        hideCategoryGrid();
    }
    $("#p2").show();
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
            $("#p2").hide();
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
        pageButtonCount: 5,
        autoload: true,
        //data: dataDictionary,
        controller: db,
        rowClick: function(args) {
            loadSearchLink(args.item);
        },
        fields: [
            // { name: "mdpLabel", title: "myData Label", type: "text", width: 150 },
            { name: "label", title: "Control", type: "text", width: 150 },
            { name: "help", title: "Control Help", type: "text", width: 150 },
            { name: "type", title: "Control Type", type: "text", width: 100, sorting: false },
            { name: "fieldLength", title: "Length", type: "text", width: 20, sorting: false },
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
        height: "360px",
        inserting: false,
        editing: false,
        filtering: true,
        sorting: true,
        paging: true,
        heading: false,
        pageButtonCount: 5,
        autoload: true,
        controller: dbCat,
        // autowidth: false,
        rowClick: function(args) {
            loadfirstCategoryAsset(args.item);
        },
        fields: [
            { name: "categoryLabel", title: "Category", type: "text" },
        ]
    });
}

function JSONToCSVConvertor(JSONData, ReportTitle, ColumnNames, ColumnLabels) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    var CSV = '';
    //Set Report title in first row or line

    // CSV += ReportTitle + '\r\n\n';
    debugger;
    //This condition will generate the Label/Header
    if (ColumnLabels) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in ColumnLabels) {

            //Now convert each value to string and comma-seprated
            row += ColumnLabels[index] + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        if (ColumnNames) {
            for (var column in ColumnNames) {
                try {
                    var columnData = arrData[i][ColumnNames[column]];
                    row += '"' + (columnData ? columnData : "") + '",';
                } catch (error) {
                    //do nothing
                }
            }
        } else {
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] + '",';
            }
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    //Generate a file name
    var fileName = "";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g, "_");

    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}