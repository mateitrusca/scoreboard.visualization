/*global App, $script */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario5_filters_schema = {
    "animation": false,
    "annotations": {
        "filters": [{
            "name": "indicator"
        },
        {
            "name": "breakdown"
        },
        {
            "name": "unit-measure"
        }]
    },
    "category_facet": "ref-area",
    "chart_type": "map",
    "credits": {
        "text": "European Commission, Digital Agenda Scoreboard",
        "link": "http://ec.europa.eu/digital-agenda/en/graphs/"
    },
    "facets": [{
        "constraints": {
            
        },
        "dimension": "indicator-group",
        "include_wildcard": true,
        "label": "Indicator group",
        "name": "indicator-group",
        "sortBy": "nosort",
        "sortOrder": "asc",
        "default_value": "#random",
        "type": "select"
    },
    {
        "constraints": {
            "indicator-group": "indicator-group"
        },
        "dimension": "indicator",
        "label": "Indicator",
        "name": "indicator",
        "sortBy": "nosort",
        "sortOrder": "asc",
        "default_value": "#random",
        "type": "select"
    },
    {
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator"
        },
        "dimension": "breakdown-group",
        "include_wildcard": true,
        "label": "Breakdown group",
        "name": "breakdown-group",
        "sortBy": "nosort",
        "sortOrder": "asc",
        "default_value": "#random",
        "type": "select"
    },
    {
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator",
            "breakdown-group": "breakdown-group"
        },
        "dimension": "breakdown",
        "label": "Breakdown",
        "name": "breakdown",
        "sortBy": "nosort",
        "sortOrder": "asc",
        "default_value": "#random",
        "type": "select"
    },
    {
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator",
            "breakdown-group": "breakdown-group",
            "breakdown": "breakdown"
        },
        "dimension": "unit-measure",
        "label": "Unit of measure",
        "name": "unit-measure",
        "default_value": "#random",
        "type": "select"
    },
    {
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator",
            "breakdown-group": "breakdown-group",
            "breakdown": "breakdown",
            "unit-measure": "unit-measure"
        },
        "dimension": "ref-area",
        "ignore_values": ["EU27"],
        "default_value": ["BE", "BG", "CZ", "DK", "DE",
        "EE", "IE", "EL", "ES", "FR",
        "IT", "CY", "LV", "LT", "LU",
        "HU", "MT", "NL", "AT", "PL",
        "PT", "RO", "SI", "SK", "FI",
        "SE", "UK"],
        "label": "Select the countries",
        "name": "ref-area",
        "sortBy": "label",
        "sortOrder": "asc",
        "type": "multiple_select"
    },
    {
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator",
            "breakdown-group": "breakdown-group",
            "breakdown": "breakdown",
            "unit-measure": "unit-measure"
        },
        "dimension": "time-period",
        "label": "Period",
        "name": "time-period",
        "sortBy": "label",
        "sortOrder": "reverse",
        "type": "select"
    },
    {
        "name": "value",
        "type": "all-values",
        "dimension": "value"
    }],
    "height": 500,
    "labels": {
        "title": {
          "facet": "indicator",
          "field": "label"
        },
        "ordinate": {
            "facet": "unit-measure",
            "field": "short_label"
        },
        "unit-measure": {
            "facet": "unit-measure",
            "field": "short_label"
        }
    },
    "multiple_series": null
};


App.scenario5_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario5_filters_schema);
};


})(App.jQuery);
