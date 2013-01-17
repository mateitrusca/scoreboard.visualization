/*global App, $script, $ */
/*jshint sub:true */

(function() {
"use strict";


App.scenario5_initialize = function() {
    var deps = [
        App.STATIC + '/lib/qtip-2.0.1/jquery.qtip.min.js',
        App.STATIC + '/lib/raphael-2.1.0/raphael-min.js',
        App.STATIC + '/lib/chroma/chroma.min.js',
        App.STATIC + '/lib/kartograph-20130111/kartograph.min.js',
        App.STATIC + '/scoreboard/scenario5/map.js'
    ];

    var qtip_css = App.STATIC + '/lib/qtip-2.0.1/jquery.qtip.css';
    $('<link rel="stylesheet">').attr('href', qtip_css).appendTo($('head'));

    $script(deps, function() {
        var container = $('<div>').appendTo($('#scenario-box'))[0];
        App.scenario5_map(container, {data: demo_data});
    });
};


var demo_data = [
    {"cname": "Belgium", "value": 8656.0},
    {"cname": "Bulgaria", "value": 1607.0},
    {"cname": "Czech Republic", "value": 5099.0},
    {"cname": "Denmark", "value": 5446.0},
    {"cname": "Germany", "value": 59200.0},
    {"cname": "Estonia", "value": 697.0},
    {"cname": "Greece", "value": 6556.0},
    {"cname": "Spain", "value": 37273.0},
    {"cname": "France", "value": 53677.0},
    {"cname": "Ireland", "value": 4430.0},
    {"cname": "Italy", "value": 42298.0},
    {"cname": "Cyprus", "value": 580.0},
    {"cname": "Latvia", "value": 592.0},
    {"cname": "Lithuania", "value": 745.0},
    {"cname": "Luxembourg", "value": 509.0},
    {"cname": "Hungary", "value": 3228.0},
    {"cname": "Malta", "value": 223.0},
    {"cname": "Netherlands", "value": 11410.0},
    {"cname": "Austria", "value": 4906.0},
    {"cname": "Poland", "value": 10900.0},
    {"cname": "Portugal", "value": 5940.0},
    {"cname": "Romania", "value": 3633.0},
    {"cname": "Slovenia", "value": 1049.0},
    {"cname": "Slovak Republic", "value": 2206.0},
    {"cname": "Finland", "value": 4820.0},
    {"cname": "Sweden", "value": 8122.0},
    {"cname": "United Kingdom", "value": 43311.0}
];


})();
