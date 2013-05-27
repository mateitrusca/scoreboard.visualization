(function($) {
"use strict";

App.CUBE_URL = "http://localhost:8448/Plone/datasets/digital-agenda-scoreboard-key-indicators";

var urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results && results[1] || 0;
}

var depth = parseInt(urlParam('depth')) || 2;
var DATA_REVISION;

App.start = function() {
    var tokens = window.location.href.split("/");
    App.CUBE_URL = tokens.slice(0, tokens.length-1).join("/");
    var message = "/revision";
    log(message);
    $.getJSON(App.CUBE_URL + "/revision", function(result){
        DATA_REVISION = result;
        App.dimension_options_indicator_groups();
        // get indicators (simulate 'any' indicator group)
        App.dimension_options_indicators();
        // get all breakdowns - for dimension_value_metadata
        App.dimension_options_breakdown();
        log_done(message);
    });
};

App.dimension_value_method = function(method, dimension, value) {
    var args = {
        'dimension': dimension,
        'value': value,
        'rev': DATA_REVISION
    }; 
    var message = "/" + method + "?" + serialize(args);
    log(message);
    $.getJSON(App.CUBE_URL + "/" + method, args, function(data){
        log_done(message);
    });
};


App.dimension_options_indicator_groups = function() {
    var args = {
        'dimension': 'indicator-group',
        'rev': DATA_REVISION
    }; 
    var message = "/dimension_options?" + serialize(args);
    log(message);
    $.getJSON(App.CUBE_URL + "/dimension_options", args, function(data){
        _.each(data.options, function(option) {
            if ( depth > 1 ) {
                App.dimension_options_indicators(option.notation);
            }
        });
        log_done(message);
    });
}

App.dimension_options_indicators = function(indicator_group) {
    var args = {
        'dimension': 'indicator',
        'indicator-group': indicator_group,
        'rev': DATA_REVISION
    }; 
    var message = "/dimension_options?" + serialize(args);
    log(message);
    $.getJSON(App.CUBE_URL + "/dimension_options", args, function(data){
        _.each(data.options, function(option) {
            if (!indicator_group) {
                // list with all indicators here
                App.dimension_value_method('dimension_value_metadata', 'indicator', option.notation);
                App.dimension_value_method('dimension_labels', 'indicator', option.notation);
            }
            if ( depth > 2 ) {
                App.dimension_options_breakdown_group(indicator_group, option.notation);
            }
        });
        log_done(message);
    });
}

App.dimension_options_breakdown_group = function(indicator_group, indicator) {
    var args = {
        'dimension': 'breakdown-group',
        'indicator-group': indicator_group,
        'indicator': indicator,
        'rev': DATA_REVISION
    }; 
    var message = "/dimension_options?" + serialize(args);
    log(message);
    $.getJSON(App.CUBE_URL + "/dimension_options", args, function(data){
        _.each(data.options, function(option) {
            if ( depth > 3 ) {
                App.dimension_options_breakdown(indicator_group, indicator, option.notation);
            }
        });
        log_done(message);
    });
    // and also simulate 'any' breakdown group
    App.dimension_options_breakdown(indicator_group, indicator);
}

App.dimension_options_breakdown = function(indicator_group, indicator, breakdown_group) {
    var args = {
        'dimension': 'breakdown',
        'indicator-group': indicator_group,
        'indicator': indicator,
        'breakdown-group': breakdown_group,
        'rev': DATA_REVISION
    }; 
    var message = "/dimension_options?" + serialize(args);
    log(message);
    $.getJSON(App.CUBE_URL + "/dimension_options", args, function(data){
        _.each(data.options, function(option) {
            if (!indicator_group && !indicator && !breakdown_group) {
                // list with all breakdowns here
                App.dimension_value_method('dimension_value_metadata', 'breakdown', option.notation);
                App.dimension_value_method('dimension_labels', 'breakdown', option.notation);
            }

            if ( depth > 4 ) {
                App.dimension_options_unit_measure(indicator_group, indicator, breakdown_group, option.notation);
            }
        });
        log_done(message);
    });
}

App.dimension_options_unit_measure = function(indicator_group, indicator, breakdown_group, breakdown) {
    var args = {
        'dimension': 'unit-measure',
        'indicator-group': indicator_group,
        'indicator': indicator,
        'breakdown-group': breakdown_group,
        'breakdown': breakdown,
        'rev': DATA_REVISION
    }; 
    var message = "/dimension_options?" + serialize(args);
    log(message);
    $.getJSON(App.CUBE_URL + "/dimension_options", args, function(data){
        _.each(data.options, function(option) {
            if (!indicator_group && !indicator && !breakdown_group && !breakdown) {
                // list with all units here
                App.dimension_value_method('dimension_value_metadata', 'unit-measure', option.notation);
                App.dimension_value_method('dimension_labels', 'unit-measure', option.notation);
            }
        });
        log_done(message);
    });
}

var serialize = function(obj) {
  var str = [];
  for(var p in obj) {
    if ( obj[p] ) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  }
  return str.join("&");
}

var log = function(message) {
    $('.message_log ul').append("<li>" + message + "</li>");
}

var log_done = function(message) {
    $('li:contains("'+message+'")').filter(function() {
      return $(this).text() == message;
    }).css("text-decoration", "line-through");
}

})(App.jQuery); 

App.start();