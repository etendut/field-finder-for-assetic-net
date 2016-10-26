function SearchFieldlist() {

    var fields = [];

    this.loadData = function(filter) {

        if (fields.length === 0)
            initdb_();

        return $.grep(fields, function(field) {
            return (
                (!filter.mdpLabel || field.label.toUpperCase().indexOf(filter.label.toUpperCase()) > -1) &&
                (!filter.group || field.group.toUpperCase().indexOf(filter.group.toUpperCase()) > -1) &&
                (!filter.label || field.label.toUpperCase().indexOf(filter.label.toUpperCase()) > -1) &&
                (!filter.help || field.help.toUpperCase().indexOf(filter.help.toUpperCase()) > -1) &&
                (!filter.type || field.type.toUpperCase().indexOf(filter.type.toUpperCase()) > -1)
            );
        });
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
            url: 'data/fieldFinder.json',
            dataType: 'json',
            async: false,
            success: function(data) {
                fields = data.DataDictionary.row;
            }
        });
    }



};