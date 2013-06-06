(function($) {
"use strict";

App.CUBE_URL = "http://localhost:8448/Plone/datasets/digital-agenda-scoreboard-key-indicators";

var urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results && results[1] || 0;
}

var depth = parseInt(urlParam('depth')) || 0;
/*
  explanation of depth parameter:
  0) will preload all dimension_labels and dimension_value_metadata for each dimension (should be used separately)
  1) will preload the first filter for the predefined charts: 
    * dimension_options?dimension=indicator-group
    * dimension_options_cp?dimension=indicator-group&subtype
  2) in addition to 1), will preload the second filter: 
    * dimension_options?dimension=indicator&indicator-group
    * dimension_options?dimension=indicator
    * dimension_options_cp?dimension=ref-area&indicator-group
  3) in addition to 2), will preload the third filter: 
    * dimension_options?dimension=breakdown-group&indicator&indicator-group
    * dimension_options?dimension=breakdown-group&indicator
    * dimension_options?dimension=breakdown&indicator&indicator-group
    * dimension_options?dimension=breakdown&indicator
    * dimension_options_cp?dimension=time-period&indicator-group&ref-area&subtype
  4) in addition to 3), will preload the fourth filter:
    * indicators for country profile - only the latest year
    * //disabled, crashes the server // datapoints for country profile - only the latest year
  5) in addition to 4), will preload the fourth filter:
    * dimension_options?dimension=breakdown&indicator=&indicator-group=&breakdown-group=
    * dimension_options?dimension=breakdown&indicator=&breakdown-group=
    * dimension_options?dimension=breakdown&indicator=&indicator-group=
    * dimension_options?dimension=breakdown&indicator=
    * dimension_options?dimension=unit-measure&indicator=&indicator-group=&breakdown=
    * dimension_options?dimension=unit-measure&indicator=&breakdown=
    * dimension_options?dimension=unit-measure&indicator=&indicator-group=&breakdown-group=
    * dimension_options?dimension=unit-measure&indicator=&indicator-group=
    * dimension_options?dimension=unit-measure&indicator=&breakdown-group=
    * dimension_options?dimension=unit-measure&indicator=
   6) in addition to 5), will preload the fifth filter
    * dimension_options?dimension=unit-measure&indicator=&indicator-group=&breakdown-group=&breakdown=

*/
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
        if ( depth == 0 ) {
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
        } else {
            // get for regular charts
            //App.dimension_options_indicator_groups();
            // get for country profiles
            App.dimension_options_indicator_groups_cp('bar');
            App.dimension_options_indicator_groups_cp('table');
        }
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
                // get breakdowns without breakdown-group (scatter and bubble)
                App.dimension_options_breakdown(indicator_group, option.notation);
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
            if ( depth > 4 ) {
                App.dimension_options_breakdown(indicator_group, indicator, option.notation);
            }
        });
    });
    // and also simulate 'any' breakdown group
    // already done in depth=3
    // App.dimension_options_breakdown(indicator_group, indicator);
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
            if ( depth > 5 ) {
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
                App.dimension_options_time_period_cp(indicator_group, option.notation, subtype);
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
        if ( depth > 3 ) {
            // only get the latest year
            data.options = _(data.options).sortBy( function(item) {
                return item.notation;
            });
            if ( _.last(data.options) && _.last(data.options).notation ) {
                App.dimension_options_indicator_cp(indicator_group, ref_area, _.last(data.options).notation, subtype);
            } else {
                log('Undefined:' + JSON.stringify(data.options));
            }
            //App.datapoints_cp(indicator_group, ref_area, _.last(data.options).notation, subtype);
        };
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

App.datapoints_cp = function(indicator_group, ref_area, time_period, subtype) {
    var args = {
        'rev': DATA_REVISION,
        'indicator-group': indicator_group,
        'ref-area': ref_area,
        'time-period': time_period,
        'subtype': subtype,
    };
    App.getJSON("datapoints_cp", args);
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