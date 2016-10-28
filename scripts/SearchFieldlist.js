function SearchFieldlist() {

    var fields = [];
    var categoryTemplate;
    this.setCategory = function(template) {
        categoryTemplate = template;
    }

    this.loadData = function(filter) {

        if (fields.length === 0) {
            initdb_();
        }


        data = $.grep(fields, function(field) {
            field.categoryTemplates = $.grep(field.categoryTemplates, function(d2) {
                return (!categoryTemplate || d2.toUpperCase().indexOf(categoryTemplate.toUpperCase()) > -1);
            });
            return (
                (!categoryTemplate || field.categoryTemplates.length > 0) &&
                (!filter.mdpLabel || field.label.toUpperCase().indexOf(filter.label.toUpperCase()) > -1) &&
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
    }



}