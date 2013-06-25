/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario3_filters_schema = {
    "annotations": {
        "filters": [
        {
            "name": "x-indicator"
        },
        {
            "name": "x-breakdown-group"
        },
        {
            "name": "x-breakdown"
        },
        {
            "name": "x-unit-measure"
        },
        {
            "name": "y-indicator"
        },
        {
            "name": "y-breakdown-group"
        },
        {
            "name": "y-breakdown"
        },
        {
            "name": "y-unit-measure"
        }
        ]
    },
    "category_facet": "ref-area",
    "chart_type": "scatter",
    "credits": {
        "text": "European Commission, Digital Agenda Scoreboard",
        "link": "http://ec.europa.eu/digital-agenda/en/graphs/"
    },
    "facets": [
    {
        "name": "x-indicator-group",
        "label": "(X) indicator group",
        "constraints": {},
        "dimension": "indicator-group",
        "include_wildcard": true,
        "sortBy": "nosort",
        "sortOrder": "asc",
        "type": "select"
    },
    {
        "name": "x-indicator",
        "label": "(X) indicator",
        "constraints": {
            "indicator-group": "x-indicator-group"
        },
        "default_value": "#random",
        "dimension": "indicator",
        "sortBy": "inner_order",
        "sortOrder": "asc",
        "type": "select"
    },
    {
        "name": "x-breakdown-group",
        "label": "(X) breakdown group",
        "constraints": {
            "indicator-group": "x-indicator-group",
            "indicator": "x-indicator"
        },
        "dimension": "breakdown-group",
        "sortBy": "nosort",
        "sortOrder": "asc",
        "type": "ignore"
    },
    {
        "name": "x-breakdown",
        "label": "(X) breakdown",
        "constraints": {
            "indicator-group": "x-indicator-group",
            "indicator": "x-indicator"
        },
        "default_value": "#random",
        "dimension": "breakdown",
        "sortBy": "inner_order",
        "sortOrder": "asc",
        "type": "select"
    },
    {
        "name": "x-unit-measure",
        "label": "(X) unit of measure",
        "constraints": {
            "indicator-group": "x-indicator-group",
            "indicator": "x-indicator",
            "breakdown": "x-breakdown"
        },
        "default_value": "#random",
        "dimension": "unit-measure",
        "type": "select"
    },
    {
        "name": "y-indicator-group",
        "label": "(Y) indicator group",
        "constraints": {},
        "default_value": "#random",
        "dimension": "indicator-group",
        "include_wildcard": true,
        "sortBy": "nosort",
        "sortOrder": "asc",
        "position": "upper-right",
        "type": "select"
    },
    {
        "name": "y-indicator",
        "label": "(Y) indicator",
        "constraints": {
            "indicator-group": "y-indicator-group"
        },
        "default_value": "#random",
        "dimension": "indicator",
        "sortBy": "inner_order",
        "sortOrder": "asc",
        "position": "upper-right",
        "type": "select"
    },
    {
        "name": "y-breakdown-group",
        "label": "(Y) breakdown group",
        "constraints": {
            "indicator-group": "y-indicator-group",
            "indicator": "y-indicator"
        },
        "dimension": "breakdown-group",
        "sortBy": "nosort",
        "sortOrder": "asc",
        "position": "upper-right",
        "type": "ignore"
    },
    {
        "name": "y-breakdown",
        "label": "(Y) breakdown",
        "constraints": {
            "indicator-group": "y-indicator-group",
            "indicator": "y-indicator"
        },
        "default_value": "#random",
        "dimension": "breakdown",
        "sortBy": "inner_order",
        "sortOrder": "asc",
        "position": "upper-right",
        "type": "select"
    },
    {
        "name": "y-unit-measure",
        "label": "(Y) unit of measure",
        "constraints": {
            "indicator-group": "y-indicator-group",
            "indicator": "y-indicator",
            "breakdown": "y-breakdown"
        },
        "default_value": "#random",
        "dimension": "unit-measure",
        "position": "upper-right",
        "type": "select"
    },
    {
        "constraints": {
            "x-indicator-group": "x-indicator-group",
            "x-indicator": "x-indicator",
            "x-breakdown": "x-breakdown",
            "x-unit-measure": "x-unit-measure",
            "y-indicator-group": "y-indicator-group",
            "y-indicator": "y-indicator",
            "y-breakdown": "y-breakdown",
            "y-unit-measure": "y-unit-measure"
        },
        "dimension": "time-period",
        "label": "Period",
        "multidim_common": true,
        "name": "time-period",
        "sortBy": "label",
        "sortOrder": "reverse",
        "type": "select"
    },
    {
        "constraints": {
            "x-indicator-group": "x-indicator-group",
            "x-indicator": "x-indicator",
            "x-breakdown": "x-breakdown",
            "x-unit-measure": "x-unit-measure",
            "y-indicator-group": "y-indicator-group",
            "y-indicator": "y-indicator",
            "y-breakdown": "y-breakdown",
            "y-unit-measure": "y-unit-measure",
            "time-period": "time-period"
        },
        "default_value": ["BE", "BG", "CZ", "DK", "DE",
        "EE", "IE", "EL", "ES", "FR",
        "IT", "CY", "LV", "LT", "LU",
        "HU", "MT", "NL", "AT", "PL",
        "PT", "RO", "SI", "SK", "FI",
        "SE", "UK"],
        "dimension": "ref-area",
        "ignore_values": ["EU27"],
        "label": "Country / Countries",
        "multidim_common": true,
        "name": "ref-area",
        "type": "all-values"
    },
    {
        "name": "value",
        "type": "all-values",
        "dimension": "value",
        "multidim_value": true
    }
    ],
    "labels": {
        "breakdown_x": {
            "facet": "x-breakdown",
            "field": "label"
        },
        "breakdown_y": {
            "facet": "y-breakdown",
            "field": "label"
        },
        "period_label": {
            "facet": "time-period",
            "field": "label"
        },
        "title_x": {
            "facet": "x-indicator",
            "field": "short_label"
        },
        "title_y": {
            "facet": "y-indicator",
            "field": "short_label"
        },
        "unit_x": {
            "facet": "x-unit-measure",
            "field": "label"
        },
        "unit_y": {
            "facet": "y-unit-measure",
            "field": "short_label"
        }
    },
    "multidim": 2,
    "multiple_series": null,
    "plotlines": {
        "x": "values",
        "y": "values"
    },
    "series-legend-label": "long",
    "series-point-label": "long",
    "text": [
      {
        "position": "upper-left",
        "value": "Horizontal axis"
      },
      {
        "position": "upper-right",
        "value": "Vertical axis"
      }
    ],
    "tooltips": {
        "flag": true,
        "note": true,
        "unit-measure": true
    },
    "height": "500"
};


App.scenario3_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario3_filters_schema);
};


})(App.jQuery);
