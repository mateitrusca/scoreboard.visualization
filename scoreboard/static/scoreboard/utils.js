(function() {
"use strict";


App.render = function(name, vars) {
    var template_src = $('script[id="' + name + '"]').text();
    var template = Handlebars.compile(template_src);
    return template(vars);
};


App.index_by = function(list, prop) {
    return _.object(_(list).pluck(prop), list);
};


})();
