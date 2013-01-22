/*global App, _ */

(function() {
"use strict";


App.index_by = function(list, prop) {
    return _.object(_(list).pluck(prop), list);
};


App.round = function(value, precision) {
    var magnitude = Math.floor(Math.log(value) / Math.LN10);
    var decimals = precision - magnitude - 1;
    var power = Math.pow(10, decimals);
    return '' + Math.round(value * power) / power;
};


})();
