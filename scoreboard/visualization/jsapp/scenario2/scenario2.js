/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario2_filters_schema = {
  "animation": false,
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
  "axis-horizontal-rotated": false,
  "axis-horizontal-title": "none",
  "axis-vertical-title": "long",
  "category_facet": "time-period",
  "chart_type": "lines",
  "credits": {
    "text": "European Commission, Digital Agenda Scoreboard",
    "link": "http://ec.europa.eu/digital-agenda/en/graphs/"
  },
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
      "default_value": ["EU27", "#random"],
      "label": "Select the countries",
      "name": "ref-area",
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
      "label": "Time period",
      "name": "time-period",
      "type": "all-values"
    },
    {
      "name": "value",
      "type": "all-values",
      "dimension": "value"
    }
  ],
  "height": 500,
  "labels": {
    "ordinate": {
      "facet": "unit-measure",
      "field": "short_label"
    },
    "title2": {
      "facet": "breakdown",
      "field": "label"
    },
    "title": {
      "facet": "indicator",
      "field": "label"
    },
    "unit-measure": {
      "facet": "unit-measure",
      "field": "short_label"
    }
  },
  "multiple_series": "ref-area",
  "series-legend-label": "long",
  "series-ending-label": "long",
  "series-point-label": "long",
  "sort": {
    "by": "category",
    "order": -1,
    "each_series": true
  },
  "tooltips": {
    "flag": true,
    "note": true,
    "unit-measure": true
  }
};


App.scenario2_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario2_filters_schema);
};


})(App.jQuery);
