if(window.scoreboard === undefined){
    var scoreboard = {
        version: '1.0'
    };
};

if(scoreboard.visualization === undefined){
    scoreboard.visualization = {};
};

if(scoreboard.visualization.datacube === undefined){
    scoreboard.visualization.datacube = {};
};

scoreboard.visualization.datacube.indicators = {
    escapeString: function(str){
        return str.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
    },
    getDatasetMetadata: function(){
        var self = this;
        jQuery.ajax({
            'url': '@@dataset_metadata',
            'data': {'dataset': jQuery('#dataset-value').val()},
            'success': function(data){
                self.renderDatasetMetadata(data);
            }
        });
    },
    getDatasetDetails: function(){
        var self = this;
        jQuery.ajax({
            'url': '@@dataset_details',
            'success': function(data){
                self.renderDatasetDetails(data);
            }
        });
    },
    renderDatasetMetadata: function(data){
        jQuery('#dataset-title').text(data.title);
        jQuery('#dataset-description').text(data.description);
    },
    renderDatasetDetails: function(data){
        var self = this;
        var table = jQuery('table.list_indicators');
        var tbody = jQuery('tbody', table);
        jQuery.each(data, function(idx, indicator){
            var groupId = self.escapeString(indicator.groupName);
            var caption = jQuery('tr#' + groupId, table);
            if(!caption.length){
                var tr = jQuery('<tr id="' + groupId + '" colspan="4">');
                tr.text(indicator.groupName);
                tbody.append(tr);
            }
            var tr = jQuery('<tr>');
            tr.append('<td>' + indicator.altlabel + '</td>');
            tr.append('<td>' + indicator.longlabel + '</td>');
            tr.append('<td>' + indicator.definition + '</td>');
            tr.append('<td><a href="' + indicator.sourcelink + '">' + indicator.sourcelabel + '</a></td>');
            jQuery('tr#' + groupId).after(tr);
        });
        var captions = jQuery('tr[id]', tbody);
        var toc = jQuery('#indicators-toc');
        console.log(toc);
        jQuery.each(captions, function(i, o){
            var tr = jQuery(o);
            var a = jQuery('<a>');
            a.attr('href', 'indicators#' + tr.attr('id'));
            a.text(tr.text());
            toc.append(a);
            toc.append('<br />');
        });
    }
};

jQuery(document).ready(function(){
    scoreboard.visualization.datacube.indicators.getDatasetMetadata();
    scoreboard.visualization.datacube.indicators.getDatasetDetails();
});

