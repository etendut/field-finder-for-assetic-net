var pageContext;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var data = request.data || {};
    if (!request || !request.action) {
        sendResponse({ data: data, success: false });
    }

    switch (request.action) {
        case "getContext":
            sendResponse({ data: pageContext, success: true });
            break;
        case "showField":
            if (!request.data || !request.data.field) {
                sendResponse({ data: data, success: false });
            }
            var spinner = new ajaxLoader($("body"));
            var element = $("span:contains('" + request.data.field + "')")
            if (element && element.length > 0) {
                var widgetElement = element.closest(".widget");
                if (widgetElement.length > 0 && widgetElement[0].id) {

                    //inject a script
                    var script = document.createElement('script');
                    script.textContent = "formLayoutConfiguration.expandCollapse('" + widgetElement[0].id.replace("widget", "") + "', false);";
                    (document.head || document.documentElement).appendChild(script);
                    script.remove();

                }
                if (spinner) {
                    spinner.remove();
                }
                element.fadeOut(300)
                    .fadeIn(300)

                    .fadeOut(300)
                    .fadeIn(300)
                    .fadeOut(300)
                    .fadeIn(300)
                    .fadeOut(300)
                    .fadeIn(300)
                    .fadeOut(300)
                    .fadeIn(300);

            }
            if (spinner) {
                spinner.remove();
            }
            break;
        default:
            sendResponse({ data: data, success: false });
            break;
    }

});

var s = document.createElement('script');
s.src = chrome.extension.getURL('scripts/pageScript.js');
(document.head || document.documentElement).appendChild(s);
s.onload = function() {
    s.remove();
};

// Event listener
document.addEventListener('asseticExtension_context', function(e) {
    if (!e || !e.detail) {
        return;
    }
    pageContext = e.detail;

});

            }
        });
    });
}