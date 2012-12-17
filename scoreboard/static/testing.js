(function() {
"use strict";

App.testing = {};


App.testing.choose_option = function(select, value) {
    var options = $('option', select).filter('[value=' + value + ']');
    options.attr('selected', 'selected').change();
};


App.testing.choose_radio = function(inputs, value) {
    inputs.attr('checked', null);
    inputs.filter('[value=' + value + ']').attr('checked', 'checked').change();
};

})();
