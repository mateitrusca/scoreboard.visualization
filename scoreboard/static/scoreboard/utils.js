(function() {
"use strict";


App.render = function(name, vars) {
    return App.get_template(name)(vars);
};


App.index_by = function(list, prop) {
    return _.object(_(list).pluck(prop), list);
};


})();
