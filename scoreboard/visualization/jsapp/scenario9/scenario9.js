/*global App */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario9_filters_schema = {
  chart_type: "country_profile",
  chart_subtype: 'bar',
  'series-legend-label': 'long',
  'series-point-label': 'long',
  category_facet: "indicator",
  multiple_series: null,
  facets: [
    {
      type: "select",
      name: "indicator-group",
      label: "Indicator group",
      dimension: "indicator-group",
      sortBy: "nosort",
      sortOrder: "asc",
      "default_value": "#random",
      constraints: {}
     },
    {
      type: "select",
      name: "ref-area",
      label: "Country",
      dimension: "ref-area",
      "default_value": "#random",
      constraints: {
        "indicator-group": "indicator-group"
      }
    },
    {
      type: "select",
      name: "time-period",
      label: "Period",
      dimension: "time-period",
      sortBy: 'label',
      sortOrder: 'reverse',
      constraints: {
        "indicator-group": "indicator-group",
        "ref-area": "ref-area"
      }
    },
    {
      constraints: {
        "indicator-group": "indicator-group",
        "ref-area": "ref-area",
        "time-period": "time-period"
      },
      dimension: "indicator",
      name: "indicator",
      type: "all-values",
      label: "Indicator"
    },
    {
      type: "all-values",
      dimension: "value"
    }
  ],
  labels: {
    title: {facet: 'ref-area', field: 'label'},
    subtitle: {facet: 'time-period', field: 'short_label'},
    'indicator-group': {facet: 'indicator-group', field: 'label'},
    'ref-area': {facet: 'ref-area', field: 'label'},
    'time-period': {facet: 'time-period', field: 'short_label'}
  },
  text: [
    {"value": "The bars present the relative position of a country on all the key indicators of a thematic group, compared on a common scale with the lowest, average and highest European countries values.",
     "position": "upper-right"
    }
  ]
};


App.scenario9_initialize = function() {
    App.create_visualization($("#scenario-box")[0],
                             App.scenario9_filters_schema);
};


})(App.jQuery);
