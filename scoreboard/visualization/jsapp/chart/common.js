/*global App, _ */
/*jshint sub:true */

(function() {
"use strict";


App.format_series = function (data){

    var extract_data = function(series_item){
        return _.object([['name', series_item['ref-area-label']],
                         ['y', series_item['value']]]);
    };

    var labels_collection = []
    var series = _.chain(data).map(function(item){
        var data = _(item['data']).map(extract_data);
        labels_collection = _.chain(item['data']).
                                pluck('ref-area-label').
                                union(labels_collection).
                                value();
        return _.object(
                ['name', 'data'],
                [item['label'], data]);
    }).map(function(item){
        var serie = item['data'];
        _.chain(labels_collection).
            difference(_(serie).pluck('name')).
            each(function(diff_label){
                _(serie).push(
                    _.object(
                        [['name', diff_label],
                         ['y', 'n/a']])
                );
            });
        return _.object(
                ['name', 'data'],
                [item['name'], _(serie).sortBy(function(item){
                    if (isNaN(item['y'])){
                        return 0
                    }
                    return -item['y']
                })]);
    }).value();
    return series;

}

})();

