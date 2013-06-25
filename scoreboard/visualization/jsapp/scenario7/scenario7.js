/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario7_filters_schema = {
    "annotations": {
        "filters": [
        {
            "name": "indicator"
        },
        {
            "name": "breakdown"
        },
        {
            "name": "unit-measure"
        }
        ],
        "title": "Definitions and scopes"
    },
    "category_facet": "ref-area",
    "chart_type": "columns",
    "facets": [
    {
        "constraints": {},
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
        "default_value": "#random",
        "dimension": "indicator",
        "label": "Indicator",
        "name": "indicator",
        "sortBy": "inner_order",
        "sortOrder": "asc",
        "type": "select"
    },
    {
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator"
        },
        "default_value": "#random",
        "dimension": "breakdown-group",
        "include_wildcard": false,
        "label": "Breakdown group",
        "name": "breakdown-group",
        "sortBy": "nosort",
        "sortOrder": "asc",
        "type": "select"
    },
    {
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator",
            "breakdown-group": "breakdown-group"
        },
        "default_value": "#random",
        "dimension": "unit-measure",
        "label": "Unit of measure",
        "name": "unit-measure",
        "type": "select"
    },
    {
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator",
            "breakdown-group": "breakdown-group",
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
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator",
            "breakdown-group": "breakdown-group",
            "unit-measure": "unit-measure",
            "time-period": "time-period"
        },
        "default_value": ["EU27", "#random"],
        "dimension": "ref-area",
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
            "unit-measure": "unit-measure",
            "time-period": "time-period"
        },
        "dimension": "breakdown",
        "label": "Breakdown",
        "name": "breakdown",
        "type": "all-values"
    },
    {
        "name": "value",
        "type": "all-values",
        "dimension": "value"
    }
    ],
    "labels": {
        "ordinate": {
            "facet": "unit-measure",
            "field": "short_label"
        },
        "subtitle": {
            "facet": "time-period",
            "field": "label"
        },
        "title": {
            "facet": "indicator",
            "field": "short_label"
        },
        "title2": {
            "facet": "breakdown-group",
            "field": "label"
        }
    },
    "multiple_series": "breakdown",
    "series-legend-label": "long",
    "series-point-label": "long",
    "sort": {
        "by": "value",
        "each_series": false,
        "order": -1
    },
    "tooltips": {
        "flag": true,
        "note": true,
        "unit-measure": true
    }
};


App.scenario7_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario7_filters_schema);
};


})(App.jQuery);
