function SearchFieldlist() {

    var fields = [];
    var categories = [];
    var categoryTemplateID;
    this.setCategory = function(template) {
        if (categories.length === 0) {
            initdb_();
        }


        var templates = !template ? null : $.grep(categories, function(category) {
            return (category.templateName.toUpperCase().indexOf(template.toUpperCase()) > -1);
        });
        if (templates && templates.length > 0) {
            categoryTemplateID = templates[0].templateID;
        }

    }

    this.loadData = function(filter) {

        if (fields.length === 0) {
            initdb_();
        }


        data = $.grep(fields, function(field) {
            field.categoryTemplates = $.grep(field.categoryTemplates, function(field2) {
                return (!categoryTemplateID || field2 == categoryTemplateID);
            });
            return (
                (!categoryTemplateID || field.categoryTemplates.length > 0) &&
                // (!filter.mdpLabel || field.label.toUpperCase().indexOf(filter.label.toUpperCase()) > -1) &&
                (!filter.group || field.group.toUpperCase().indexOf(filter.group.toUpperCase()) > -1) &&
                (!filter.label || field.label.toUpperCase().indexOf(filter.label.toUpperCase()) > -1) &&
                (!filter.help || field.help.toUpperCase().indexOf(filter.help.toUpperCase()) > -1) &&
                (!filter.type || field.type.toUpperCase().indexOf(filter.type.toUpperCase()) > -1)
            );
        });

        return data;

    };

    this.insertItem = function(insertingField) {
        fields.push(insertingField);
    };

    this.updateItem = function(updatingField) {};

    this.deleteItem = function(deletingField) {
        var fieldIndex = $.inArray(deletingField, this.fields);
        fields.splice(fieldIndex, 1);
    };

    function initdb_() {
        $.ajax({
            url: 'data/fieldFinder2.json',
            dataType: 'json',
            async: false,
            success: function(data) {
                fields = data.DataDictionary;
            }
        });
        $.ajax({
            url: 'data/categories.json',
            dataType: 'json',
            async: false,
            success: function(data) {
                categories = data.categories;
            }
        });
    }



}