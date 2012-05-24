/* globals window, jQuery */

var sgudjonsson = sgudjonsson || {};

sgudjonsson.builder = (function(window, $) {

	"use strict";

	var fieldIndex = -1,
        state = {
            isDragging: false    
        },
        history = {
            index: 0, // set to 0 (zero) because the first item in the stack should be an empty array (e.g. [])
            stack: [[]]
        };

    var methods = {
        addField: function (fieldType) {

            $(window).trigger("sgudjonsson.builder.field.adding", { type: fieldType });

            var field = {
                type: fieldType,
                id: (++fieldIndex),
                element: undefined
            };

            field.element = methods.getMarkup(field);
            $("#sgudjonsson-builder").append(field.element);
            
            // add mouse enter/leave events for the added element
            $(field.element)
                .mouseenter(function() {
                    $(window).trigger("sgudjonsson.builder.field.mouseentering", { element: $(this)[0] });
                    $(window).trigger("sgudjonsson.builder.field.mouseentered", { element: $(this)[0] });
                })
                .mouseleave(function() {
                    $(window).trigger("sgudjonsson.builder.field.mouseleaving", { element: $(this)[0] });
                    $(window).trigger("sgudjonsson.builder.field.mouseleft", { element: $(this)[0] }); 
                });

            methods.save();

            $(window).trigger("sgudjonsson.builder.field.added", field);
        },
        updateField: function(field) {
            var prefix = "field-";
            var currentField = methods.getField(field.id);

            for(var key in field)
                $("#"+ currentField.id).data(prefix + key, field[key]);

            methods.save();
            methods.redraw(history.stack[history.index]);
        },
        // Returns specific field data from a "field" element
        getFieldData: function (elm) {
            var prefix = "field",
                attributes = $(elm).data(),
                data = {};

            for (var attr in attributes) {
                if (attr.substring(0, prefix.length) == prefix)
                    data[attr.replace(prefix, "").toLowerCase()] = attributes[attr];
            };

            return data;
        },
        getField: function(id) {
            var elm = $("#sgudjonsson-builder #field-markup-container-"+ id);
            if(!elm || elm.size() == 0)
                throw "Field with ID "+ id +" not found!";

            return {
                id: elm[0].id,
                element: elm,
                field: methods.getFieldData(elm)
            };
        },
        // Returns an array of field data objects, that represent the current stack
        getFields: function () {
            var fields = [];
            $("#sgudjonsson-builder .sgudjonsson-builder-field").each(function (index, item) {
                var data = methods.getFieldData(item);
                data.index = index;
                fields.push(data);
            });
            return fields;
        },
        // Returns the markup for a field using templates
        getMarkup: function (field) {
            var exists = $("#sgudjonsson-template-field-" + field.type).size() == 1;
            if (!exists)
                throw "Template for field type '" + field.type + "' doesn't exist";

            return $("#sgudjonsson-template-field-" + field.type).tmpl({
                id: field.id
            })[0];
        },
        // Redraws the view with given field objects
        redraw: function (fields) {
            var cssClassPrefix = "sgudjonsson-builder-field-";

            $(window).trigger("sgudjonsson.builder.redrawing");
            $("#sgudjonsson-builder").empty();

            $(fields).each(function (i, field) {
                field.index = i;
                $(window).trigger("sgudjonsson.builder.field.redrawing", field);            
                field.element = methods.getMarkup(field);
                for(var key in field) {
                    $("."+ cssClassPrefix + key, field.element).text(field[key]);
                }
                $("#sgudjonsson-builder").append(field.element);
                $(window).trigger("sgudjonsson.builder.field.redrawned", field);
            });
            
            $(window).trigger("sgudjonsson.builder.redrawned");
        },
        // Resets the builder
        reset: function() {

            $(window).trigger("sgudjonsson.builder.resetting");
            fieldIndex = -1;
            history = {
                index: 0,
                stack: [[]]
            };
            methods.redraw();
            $(window).trigger("sgudjonsson.builder.reset");
        },
        // Saves the current view to the stack
        save: function () {
            $(window).trigger("sgudjonsson.builder.saving");
            history.stack[++history.index] = methods.getFields();
            history.stack.splice(history.index + 1);
            $(window).trigger("sgudjonsson.builder.saved");
        },
        // Undo, redraws the previous stack index
        undo: function () {
            $(window).trigger("sgudjonsson.builder.undoing");
            if (history.index > 0)
                methods.redraw(history.stack[--history.index]);
            $(window).trigger("sgudjonsson.builder.undone");
        },
        // Redo, redraws the next stack index if available
        redo: function () {
            $(window).trigger("sgudjonsson.builder.redoing");
            if (history.index < history.stack.length - 1)
                methods.redraw(history.stack[++history.index]);
            $(window).trigger("sgudjonsson.builder.redone");
        },
        init: function () {

            $(function () {

                var all_events = " sgudjonsson.builder.field.adding"
                                +" sgudjonsson.builder.field.added"
                                +" sgudjonsson.builder.field.mouseentering"
                                +" sgudjonsson.builder.field.mouseentered"
                                +" sgudjonsson.builder.field.mouseleaving"
                                +" sgudjonsson.builder.field.mouseleft"
                                +" sgudjonsson.builder.field.redrawing"
                                +" sgudjonsson.builder.field.redrawned"
                                +" sgudjonsson.builder.field.sort-starting"
                                +" sgudjonsson.builder.field.sort-started"
                                +" sgudjonsson.builder.field.sort-stopping"
                                +" sgudjonsson.builder.field.sort-stopped"
                                +" sgudjonsson.builder.redrawing"
                                +" sgudjonsson.builder.redrawned"
                                +" sgudjonsson.builder.resetting"
                                +" sgudjonsson.builder.reset"
                                +" sgudjonsson.builder.saving"
                                +" sgudjonsson.builder.saved"
                                +" sgudjonsson.builder.undoing"
                                +" sgudjonsson.builder.undone"
                                +" sgudjonsson.builder.redoing"
                                +" sgudjonsson.builder.redone"
                                +" sgudjonsson.builder.importing"
                                +" sgudjonsson.builder.imported"
                                +" sgudjonsson.builder.initializing"
                                +" sgudjonsson.builder.initialized";

                $(window).bind(all_events, function(e, data) {
                    console.log(e.type +"."+ e.namespace, data);
                })
                
                $(window).trigger("sgudjonsson.builder.initializing");

                if($("#sgudjonsson-builder").size() != 1)
                    throw "No element defined for builder";

                $("#sgudjonsson-builder")
                    .sortable({
                        start: function() {
                            $(window).trigger("sgudjonsson.builder.field.sort-starting", { element: $(this)[0] });
                            state.isDragging = true;
                            $(window).trigger("sgudjonsson.builder.field.sort-started", { element: $(this)[0] });
                        },
                        stop: function(event, ui) {
                            $(window).trigger("sgudjonsson.builder.field.sort-stopping", { element: $(this)[0] });
                            state.isDragging = false;
                            $(window).trigger("sgudjonsson.builder.field.sort-stopped", { element: $(this)[0] });
                        }
                    })
                    .disableSelection();

                $(window).trigger("sgudjonsson.builder.initialized");
            });
        }
    };

    methods.init();

    return {
        export: function () {
            return history.stack[history.index];
        },
        import: function (fields) {
            $(window).trigger("sgudjonsson.builder.importing");
            $(window).trigger("sgudjonsson.builder.imported");
        },
        undo: function () {
            methods.undo();
        },
        redo: function () {
            methods.redo();
        },
        addField: function (fieldType) {
            methods.addField(fieldType);
        },
        updateField: function(field) {
            methods.updateField(field);
        },
        reset: function() {
            methods.reset();
        },
        getState: function() {
            return state;
        }
    };
	
})(window, jQuery);