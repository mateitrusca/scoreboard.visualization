(function() {
"use strict";


App.index_by = function(list, prop) {
    return _.object(_(list).pluck(prop), list);
};


})();
