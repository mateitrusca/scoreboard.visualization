(function($) {
"use strict";

App.CUBE_URL = "http://localhost:8448/Plone/datasets/digital-agenda-scoreboard-key-indicators";

var urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results && results[1] || 0;
}

var depth = parseInt(urlParam('depth')) || 1;
var DATA_REVISION;

App.start = function() {
    var tokens = window.location.href.split("/");
    App.CUBE_URL = tokens.slice(0, tokens.length-1).join("/");
    var args = {
        'random': Math.random()
    };
    App.getJSON('revision', args, function(result){
        DATA_REVISION = result;
        // get dimension_labels and dimension_value_metadata
        App.dimension_value_method('dimension_labels', 'indicator-group');
        App.dimension_value_method('dimension_value_metadata', 'indicator');
        App.dimension_value_method('dimension_labels', 'indicator');
        App.dimension_value_method('dimension_labels', 'breakdown-group');
        App.dimension_value_method('dimension_value_metadata', 'breakdown');
        App.dimension_value_method('dimension_labels', 'breakdown');
        App.dimension_value_method('dimension_value_metadata', 'unit-measure');
        App.dimension_value_method('dimension_labels', 'unit-measure');
        App.dimension_value_method('dimension_labels', 'ref-area');
        App.dimension_value_method('dimension_labels', 'time-period');
        App.dimension_options_indicator_groups();
    });
};


App.getJSON = function(method, args, callback) {
    var message = "/" + method + "?" + serialize(args);
    log(message);
    $.getJSON(App.CUBE_URL + "/" + method, args, function(data) {
        log_done(message);
        if ( callback ) callback(data);
    });
};

App.dimension_options_indicator_groups = function() {
    var args = {
        'dimension': 'indicator-group',
        'rev': DATA_REVISION
    };
    App.getJSON("dimension_options", args, function(data){
        _.each(data.options, function(option) {
            if ( depth > 1 ) {
                App.dimension_options_indicators(option.notation);
            }
        });
    });
    // get for 'Any'
    if ( depth > 1 ) {
        App.dimension_options_indicators();
    }
    // get for country profile
    App.dimension_options_indicator_groups_cp('bar');
    App.dimension_options_indicator_groups_cp('table');
};

App.dimension_options_indicator_groups_cp = function(subtype) {
    var args = {
        'dimension': 'indicator-group',
        'subtype': subtype,
        'rev': DATA_REVISION
    };
    App.getJSON("dimension_options_cp", args, function(data){
        _.each(data.options, function(option) {
            if ( depth > 1 ) {
                App.dimension_options_ref_area_cp(option.notation, subtype);
            }
        });
    });
}

App.dimension_options_indicators = function(indicator_group) {
    var args = {
        'dimension': 'indicator',
        'indicator-group': indicator_group,
        'rev': DATA_REVISION
    };
    App.getJSON("dimension_options", args, function(data){
        _.each(data.options, function(option) {
            if ( depth > 2 ) {
                App.dimension_options_breakdown_group(indicator_group, option.notation);
            }
        });
    });
}

App.dimension_options_breakdown_group = function(indicator_group, indicator) {
    var args = {
        'dimension': 'breakdown-group',
        'indicator-group': indicator_group,
        'indicator': indicator,
        'rev': DATA_REVISION
    };
    App.getJSON("dimension_options", args, function(data){
        _.each(data.options, function(option) {
            if ( depth > 3 ) {
                App.dimension_options_breakdown(indicator_group, indicator, option.notation);
            }
        });
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
    App.getJSON("dimension_options", args, function(data){
        _.each(data.options, function(option) {
            if ( depth > 4 ) {
                App.dimension_options_unit_measure(indicator_group, indicator, breakdown_group, option.notation);
            }
        });
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
    App.getJSON("dimension_options", args);
}

App.dimension_value_method = function(method, dimension) {
    var args = {
        'dimension': dimension,
        'rev': DATA_REVISION
    };
    App.getJSON("dimension_options", args, function(data){
        _.each(data.options, function(option) {
            var args2 = {
                'dimension': dimension,
                'value': option.notation,
                'rev': DATA_REVISION
            };
            App.getJSON(method, args2);
        });
    });
}

App.dimension_options_ref_area_cp = function(indicator_group, subtype) {
    var args = {
        'dimension': 'ref-area',
        'indicator-group': indicator_group,
        'subtype': subtype,
        'rev': DATA_REVISION
    };
    App.getJSON("dimension_options_cp", args, function(data){
        _.each(data.options, function(option) {
            if ( depth > 2 ) {
                App.dimension_options_time_period_cp(option.notation, subtype);
            }
        });
    });
}

App.dimension_options_time_period_cp = function(indicator_group, ref_area, subtype) {
    var args = {
        'dimension': 'time-period',
        'indicator-group': indicator_group,
        'ref-area': ref_area,
        'subtype': subtype,
        'rev': DATA_REVISION
    };
    App.getJSON("dimension_options_cp", args, function(data){
        _.each(data.options, function(option) {
            if ( depth > 3 ) {
                App.dimension_options_indicator_cp(option.notation, subtype);
            }
        });
    });
}

App.dimension_options_indicator_cp = function(indicator_group, ref_area, time_period, subtype) {
    var args = {
        'dimension': 'indicator',
        'indicator-group': indicator_group,
        'ref-area': ref_area,
        'time-period': time_period,
        'subtype': subtype,
        'rev': DATA_REVISION
    };
    App.getJSON("dimension_options_cp", args);
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