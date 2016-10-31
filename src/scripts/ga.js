var _AnalyticsCode = 'UA-86528300-1';

var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

function trackButtonClick(e) {
    _gaq.push(['_trackEvent', e.target.id, 'clicked']);
}

function trackEvent(id) {
    _gaq.push(['_trackEvent', id, 'clicked']);
}