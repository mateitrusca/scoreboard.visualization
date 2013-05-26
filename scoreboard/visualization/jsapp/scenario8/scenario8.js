/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario8_filters_schema = {
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
    ]
  },
  "axis-horizontal-rotated": false,
  "axis-horizontal-title": "none",
  "axis-vertical-title": "short",
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
      "type": "select"
    },
    {
      "constraints": {
        "indicator-group": "indicator-group",
        "indicator": "indicator"
      },
      "dimension": "breakdown-group",
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
      "dimension": "breakdown",
      "label": "Breakdown",
      "name": "breakdown",
      "sortBy": "nosort",
      "sortOrder": "asc",
      "type": "all-values"
    },
    {
      "constraints": {
        "indicator-group": "indicator-group",
        "indicator": "indicator",
        "breakdown-group": "breakdown-group"
      },
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
      "dimension": "ref-area",
      "default_value": "EU27",
      "label": "Country",
      "name": "ref-area",
      "sortBy": "label",
      "sortOrder": "asc",
      "type": "select"
    },
    {
      "constraints": {
        "indicator-group": "indicator-group",
        "indicator": "indicator",
        "breakdown-group": "breakdown-group",
        "unit-measure": "unit-measure",
        "ref-area": "ref-area"
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
  "height": 450,
  "labels": {
    "ordinate": {
      "facet": "unit-measure",
      "field": "short_label"
    },
    "title": {
      "facet": "indicator",
      "field": "label"
    },
    "title2": {
      "facet": "breakdown-group",
      "field": "label"
    },
    "unit-measure": {
      "facet": "unit-measure",
      "field": "short_label"
    }
  },
  "multiple_series": "breakdown",
  "series-legend-label": "long",
  "series-ending-label": "none",
  "series-point-label": "none",
  "sort": {
    "by": "category",
    "order": 1,
    "each_series": true
  },
  "tooltips": {
    "flag": true,
    "note": true,
    "unit-measure": true
  }
};


App.scenario8_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario8_filters_schema);
};


})(App.jQuery);
