var pageContext;
var pendingContextSendResponse;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var data = request.data || {};
    if (!request || !request.action) {
        sendResponse({ data: data, success: false });
    }

    switch (request.action) {
        case "getContext":
            if (!pageContext) {
                pendingContextSendResponse = sendResponse;
                getContext();
            } else {
                sendResponse({ data: pageContext, success: true });
            }
            break;
        case "showField":
            if (!request.data || !request.data.field) {
                sendResponse({ data: data, success: false });
            }
            var spinner = new ajaxLoader($("body"));
            var element = $("span").filter(function() { return ($(this).text().toUpperCase() === request.data.field.toUpperCase()) });
            if (element && element.length > 0) {
                var widgetElement = element.closest(".widget");
                if (widgetElement.length > 0 && widgetElement[0].id) {

                    //inject a script
                    var script = document.createElement('script');
                    script.textContent = "formLayoutConfiguration.expandCollapse('" + widgetElement[0].id.replace("widget", "") + "', false);";
                    (document.head || document.documentElement).appendChild(script);
                    script.remove();

                }!spinner || spinner.remove();

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

            } else {
                !spinner || spinner.remove();
            }
            break;
        default:
            sendResponse({ data: data, success: false });
            break;
    }

});
var contextScript;

function getContext() {
    contextScript = document.createElement('script');
    contextScript.src = chrome.extension.getURL('scripts/pageScripts/getContext.js');
    (document.head || document.documentElement).appendChild(contextScript);
}
getContext();
// Event listener
document.addEventListener('asseticExtension_context', function(e) {
    if (!e || !e.detail) {
        return;
    }
    pageContext = e.detail;
    !contextScript || contextScript.remove();
    !pendingContextSendResponse || pendingContextSendResponse()
    pendingContextSendResponse = null;
});