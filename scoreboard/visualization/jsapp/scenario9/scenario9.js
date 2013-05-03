/*global App */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario9_filters_schema = {
  chart_type: "country_profile",
  category_facet: "indicator",
  multiple_series: null,
  legend: true,
  facets: [
    {
      type: "select",
      name: "indicator-group",
      label: "Indicator group",
      dimension: "indicator-group",
      constraints: {}
     },
    {
      type: "select",
      name: "ref-area",
      label: "Country",
      dimension: "ref-area",
      constraints: {
        "indicator-group": "indicator-group"
      }
    },
    {
      type: "select",
      name: "time-period",
      label: "Year",
      dimension: "time-period",
      constraints: {
        "indicator-group": "indicator-group",
        "ref-area": "ref-area"
      }
    },
    {
      "constraints": {
        "indicator-group": "indicator-group",
        "ref-area": "ref-area",
        "time-period": "time-period"
      },
      "dimension": "indicator",
      "name": "indicator",
      "type": "all-values",
      "label": "Indicator"
    },
    {
      type: "all-values",
      dimension: "value"
    }
  ],
  annotations: {
    filters: [
      {
        name: "ref-area",
        part: "label"
      }
    ],
    source: "/dimension_value_metadata"
  },
  chart_meta_labels: [
    {
      targets: ['x_title'],
      filter_name: 'indicator-group',
      type: 'label'
    },
    {
      targets: ['x_title'],
      filter_name: 'ref-area',
      type: 'label'
    },
    {
      targets: ['year_text'],
      filter_name: 'time-period',
      type: 'short_label'
    }
  ]
};


App.scenario9_initialize = function() {
    App.create_visualization($("#scenario-box")[0],
                             App.scenario9_filters_schema);
};


})(App.jQuery);
