(function() {
"use strict";


App.render = function(name, vars) {
    var template_src = $('script[id="' + name + '.html"]').text();
    var template = Handlebars.compile(template_src);
    return template(vars);
};

})();
