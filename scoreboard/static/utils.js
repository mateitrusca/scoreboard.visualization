(function() {
"use strict";


App.render = function(name, vars) {
    var template_id = name + '-template';
    var template_src = $('script#' + template_id).text();
    var template = Handlebars.compile(template_src);
    return template(vars);
};

})();
