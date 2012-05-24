/* global window, jQuery */

var sgudjonsson = sgudjonsson || {};
sgudjonsson.builder = sgudjonsson.builder || {};

sgudjonsson.builder.toolbar = (function (window, $) {

    "use strict";

    var _minSpanIndex = 6,
        _maxSpanIndex = 12,
        _toolbarPosition = "top-right";

    var methods = {
        getClassByRegex: function(elm, pattern) {
            var classes = $(elm).attr("class").split(" ");
            var regex = new RegExp(pattern);
            for(var i = 0; i < classes.length; i++) {
                if(classes[i].match(regex)) {
                    return classes[i];
                }
            }
        },
        getSpanIndex: function(elm) {
            if(!elm)
                return;
            var span = methods.getClassByRegex($(elm), "span\\d+");
            return (span) ? Number(span.replace("span","")) : _maxSpanIndex;
        },
        setElementWidth: function(elm, to) {
            if(to >= _minSpanIndex && to <= _maxSpanIndex) {
                var cls = methods.getClassByRegex($(elm), "span\\d+");
                if(cls)
                    $(elm).removeClass(cls);

                $(elm).addClass("span"+ to);
            }
            methods.resize();
        },
        smaller: function(elm) {
            var index = methods.getSpanIndex(elm);
            methods.setElementWidth(elm, --index);
        },
        wider: function(elm) {
            var index = methods.getSpanIndex(elm);
            methods.setElementWidth(elm, ++index);
        },
        resize: function() {
            $("#sgudjonsson-builder").each(function() {
                // get all .control-group as array
                var groups = $(".control-group", this).get();
                for(var i = 0; i < groups.length; i++) {
                    $(".control-group:nth("+i+")", this).height("");
                    var currentPosition = i;
                    var spanTotal = methods.getSpanIndex($(".control-group", this).get(i));
                    if(spanTotal < _maxSpanIndex) {
                        for(var j = i+1; j < groups.length; j++) {
                            $(".control-group:nth("+j+")", this).height("");
                            var nextSpan = methods.getSpanIndex($(".control-group", this).get(j));
                            if(spanTotal + nextSpan > _maxSpanIndex)
                                break;
                            spanTotal += nextSpan;
                            currentPosition = j;
                        }
                        if(i != currentPosition) {
                            var maxHeight = 0;
                            for(var k = i; k <= currentPosition; k++) {
                                var elm = $(".control-group:nth("+ k +")", this);
                                var height = elm.height();
                                
                                if(height > maxHeight)
                                    maxHeight = height;
                            }

                            for(var k = i; k <= currentPosition; k++) {
                                $(".control-group:nth("+ k +")", this).height(maxHeight);
                            }

                            i = currentPosition;
                        }
                    }
                }  
            });
        },
        isToolbarVisible: function(elm) {
            var toolbarCssClass = "control-group-toolbar";
            return $("."+ toolbarCssClass, elm).size() == 1;  
        },
        hideToolbar: function(elm) {
            var toolbarCssClass = "control-group-toolbar";
            $("."+ toolbarCssClass).remove();
        },
        showToolbar: function(elm) {
            var toolbarCssClass = "control-group-toolbar";

            var toolbar = undefined;
            if(methods.isToolbarVisible(elm)) {
                toolbar = $("."+ toolbarCssClass, elm);
            } else {
                toolbar = $("#template-toolbar").tmpl({})
                $(elm).prepend(toolbar);
            }

            var pos = $(elm).offset();
            pos.right = pos.left + $(elm).width();
            pos.bottom = pos.top + $(elm).height();

            var dim = $("."+ toolbarCssClass, elm).getHiddenDimensions();

            switch(_toolbarPosition) {
                case "top-left":
                    toolbar.css({top: pos.top, left: pos.left});
                    break;
                case "top-right":
                    toolbar.css({top: pos.top, left: pos.right - dim.outerWidth});
                    break;
                case "bottom-left":
                    toolbar.css({top: pos.bottom - dim.outerHeight, left: pos.left});
                    break;
                case "bottom-right":
                    toolbar.css({top: pos.bottom - dim.outerHeight, left: pos.right - dim.outerWidth});
                    break;
            }
        },
        init: function() {
        	$(function() {
        		$(".action-smaller").live("click", function(e) {
                    e.preventDefault();
                    var elm = $(this).closest(".control-group");
                    methods.smaller(elm);
                    methods.showToolbar(elm);
                });

                $(".action-wider").live("click", function(e) {
                    e.preventDefault();
                    var elm = $(this).closest(".control-group");
                    methods.wider(elm);
                    methods.showToolbar(elm);
                });

                $(".action-smallest").live("click", function(e) {
                    e.preventDefault();
                    var elm = $(this).closest(".control-group");
                    methods.setElementWidth(elm, _minSpanIndex);
                    methods.showToolbar(elm);
                });

                $(".action-widest").live("click", function(e) {
                    e.preventDefault();
                    var elm = $(this).closest(".control-group");
                    methods.setElementWidth(elm, _maxSpanIndex);
                    methods.showToolbar(elm);
                });

                $(window)
                    .bind("sgudjonsson.builder.field.mouseentered sgudjonsson.builder.field.sort-stopped", function(e,data) {
                        methods.showToolbar(data.element);
                    })
                    .bind("sgudjonsson.builder.field.mouseleaving sgudjonsson.builder.field.sort-starting", function(e,data) {
                        methods.hideToolbar(data.element);
                    });
        	});
        }
    };

    methods.init();

    return {
        
    };
	
})(window, jQuery);