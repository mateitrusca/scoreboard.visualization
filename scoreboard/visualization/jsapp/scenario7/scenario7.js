/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario7_filters_schema = {
    "facets": [{
        "type": "select",
        "name": "indicator-group",
        "label": "Indicator group",
        "dimension": "indicator-group",
        "include_wildcard": true,
        "sortBy": "nosort",
        "sortOrder": "asc",
        "constraints": {
            
        }
    },
    {
        "type": "select",
        "name": "indicator",
        "label": "Indicator",
        "dimension": "indicator",
        "sortBy": "nosort",
        "sortOrder": "asc",
        "constraints": {
            "indicator-group": "indicator-group"
        }
    },
    {
        "type": "select",
        "name": "breakdown-group",
        "label": "Breakdown group",
        "include_wildcard": false,
        "dimension": "breakdown-group",
        "sortBy": "nosort",
        "sortOrder": "asc",
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator"
        }
    },
    {
        "type": "select",
        "name": "unit-measure",
        "label": "Unit of measure",
        "dimension": "unit-measure",
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator",
            "breakdown-group": "breakdown-group"
        }
    },
    {
        "type": "select",
        "name": "time-period",
        "label": "Period",
        "sortBy": "label",
        "sortOrder": "reverse",
        "dimension": "time-period",
        "constraints": {
            "indicator-group": "indicator-group",
            "indicator": "indicator",
            "breakdown-group": "breakdown-group",
            "unit-measure": "unit-measure"
        }
    },
    {
        "type": "multiple_select",
        "name": "ref-area",
        "label": "Select the countries",
        "dimension": "ref-area",
        "default_value": ["EU27"],
        "constraints": {
            "unit-measure": "unit-measure",
            "breakdown-group": "breakdown-group",
            "time-period": "time-period",
            "indicator-group": "indicator-group",
            "indicator": "indicator"
        }
    },
    {
        "type": "all-values",
        "dimension": "breakdown",
        "label": "Breakdown",
        "name": "breakdown",
        "constraints": {
            "unit-measure": "unit-measure",
            "breakdown-group": "breakdown-group",
            "time-period": "time-period",
            "indicator-group": "indicator-group",
            "indicator": "indicator"
        }
    },
    {
        "type": "all-values",
        "dimension": "value"
    }],
    "category_facet": "ref-area",
    "multiple_series": "breakdown",
    "annotations": {
        "filters": [{
            "name": "indicator"
        },
        {
            "name": "breakdown"
        },
        {
            "name": "unit-measure"
        }],
                "title": "Definitions and scopes"
    },
    "chart_type": "columns",
    "tooltips": {
        "unit-measure": true,
        "flag": true,
        "note": true
    },
    "labels": {
        "title": {
            "facet": "indicator",
            "field": "short_label"
        },
        "ordinate": {
            "facet": "unit-measure",
            "field": "short_label"
        },
        "subtitle": {
            "facet": "time-period",
            "field": "label"
        },
        "title2": {
            "facet": "breakdown-group",
            "field": "label"
        }
    },
    "series-legend-label": "long",
    "series-point-label": "long",
    "sort": {
        "by": "value",
        "order": -1,
        "each_series": false
    }
};


App.scenario7_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario7_filters_schema);
};


})(App.jQuery);
