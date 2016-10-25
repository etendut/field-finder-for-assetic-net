(function() {

    var db = {

        loadData: function(filter) {
            if (db.fields.length === 0)
                initdb();

            return $.grep(db.fields, function(field) {
                return (
                    (!filter.mdpLabel || field.mdpLabel.toUpperCase().indexOf(filter.mdpLabel.toUpperCase()) > -1) &&
                    (!filter.group || field.group.toUpperCase().indexOf(filter.group.toUpperCase()) > -1) &&
                    (!filter.label || field.label.toUpperCase().indexOf(filter.label.toUpperCase()) > -1) &&
                    (!filter.help || field.help.toUpperCase().indexOf(filter.help.toUpperCase()) > -1) &&
                    (!filter.type || field.type.toUpperCase().indexOf(filter.type.toUpperCase()) > -1)
                );
            });
        },

        insertItem: function(insertingField) {
            this.fields.push(insertingField);
        },

        updateItem: function(updatingField) {},

        deleteItem: function(deletingField) {
            var fieldIndex = $.inArray(deletingField, this.fields);
            this.fields.splice(fieldIndex, 1);
        }

    };

    function initdb() {
        $.ajax({
            url: 'data/fieldFinder.json',
            dataType: 'json',
            async: false,
            success: function(data) {
                db.fields = data.DataDictionary.row;
            }
        });
    }

    window.db = db;

    db.fields = [];

}());