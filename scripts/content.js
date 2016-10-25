var expandWidgetId;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("something happening from the extension");
    var data = request.data || {};
    if (!request || !request.action || !request.data) {
        sendResponse({ data: data, success: false });
    }

    switch (request.action) {
        case "changeColor":
            if (!request.data.newColor || !request.data.oldColor) {
                sendResponse({ data: data, success: false });
            }
            colorReplace(request.data.oldColor, request.data.newColor)
            break;

        case "showField":
            if (!request.data.field) {
                sendResponse({ data: data, success: false });
            }
            var element = $("span:contains('" + request.data.field + "')")
            if (element && element.length > 0) {
                var widgetElement = element.closest(".widget");
                if (widgetElement.length > 0 && widgetElement[0].id) {
                    expandWidgetId = widgetElement[0].id.replace("widget", "")
                    injectScript(chrome.extension.getURL('scripts/tab.js'), 'body');
                }
                element.focus();

            }
            break;
        default:
            sendResponse({ data: data, success: false });
            break;
    }

});

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}



function colorReplace(findHexColor, replaceWith) {
    // Convert rgb color strings to hex
    function rgb2hex(rgb) {
        if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    // Select and run a map function on every tag
    $('*').map(function(i, el) {
        // Get the computed styles of each tag
        var styles = window.getComputedStyle(el);

        // Go through each computed style and search for "color"
        Object.keys(styles).reduce(function(acc, k) {
            var name = styles[k];
            var value = styles.getPropertyValue(name);
            if (value !== null && name.indexOf("color") >= 0) {
                // Convert the rgb color to hex and compare with the target color

                if (value.indexOf("rgb(") >= 0) {
                    if (rgb2hex(value).toLowerCase() === findHexColor.toLowerCase()) {
                        // Replace the color on this found color attribute
                        $(el).css(name, replaceWith);
                        //el.style.setProperty(name, replaceWith, 'important');
                        //  console.log(name)
                        //console.log(el.type())
                    }
                }
            }
        });
    });
}