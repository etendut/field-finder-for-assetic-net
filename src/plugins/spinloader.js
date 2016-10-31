ajaxLoader = function(el, options, duration) {
    // Becomes this.options
    var defaults = {
        bgColor: '#ffffff',
        duration: duration === 0 ? 800 : duration,
        opacity: 0.7,
        classOveride: false
    };
    this.options = jQuery.extend(defaults, options);
    this.container = $(el);

    this.init = function() {
        var container = this.container;
        // Delete any other loaders
        this.remove();
        // Create the overlay 
        var overlay = $('<div></div>').css({
            'background-color': this.options.bgColor,
            'opacity': this.options.opacity,
            'width': "99%", // container.width(),
            'height': "99%", // container.height(),
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'z-index': 999999
        }).addClass('ajax_overlay');
        // add an overiding class name to set new loader style 
        if (this.options.classOveride) {
            overlay.addClass(this.options.classOveride);
        }
        // insert overlay and loader into DOM 
        if ($(container).find(".ajax_overlay").length == 0) {
            $(container).append(overlay.append($('<div class="loading-container"><div class="loading"></div></div>')).fadeIn(this.options.duration));
        }
    };

    this.remove = function() {
        var overlay = this.container.find(".ajax_overlay");
        if (overlay.length) {
            overlay.fadeOut(this.options.classOveride, function() {
                overlay.remove();
            });
        }
    };
    this.init();
};