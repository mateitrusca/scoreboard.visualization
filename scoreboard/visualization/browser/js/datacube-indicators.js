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
        var tbody = self.renderDatasetTable(data);
        self.renderDatasetToC(tbody);
    },
    renderDatasetTable: function(data){
        var self = this;
        var table = jQuery('table.list_indicators');
        var tbody = jQuery('tbody', table);
        jQuery.each(data, function(idx, indicator){
            var groupId = self.escapeString(indicator.groupName);
            var caption = jQuery('tr#' + groupId, table);
            if(!caption.length){
                self.addTableCaption(groupId, indicator, tbody);
            }
            self.addTableRow(indicator, groupId);
        });
        return tbody;
    },
    renderDatasetToC: function(tbody){
        var self = this;
        var captions = jQuery('tr[id]', tbody);
        var toc = jQuery('#indicators-toc');
        var toc_ul = jQuery('<ul>');
        toc.append(toc_ul);
        jQuery.each(captions, function(i, o){
            var tr = jQuery(o);
            var li = jQuery('<li>');
            var a = jQuery('<a>');
            a.attr('href', 'indicators#' + tr.attr('id'));
            a.text(tr.text());
            li.append(a);
            toc_ul.append(li);
        });
    },
    addTableCaption: function(groupId, indicator, tbody){
        var tr = jQuery('<tr class="groupName">');
        tr.attr('id', groupId);
        var td = jQuery('<td>').text(indicator.groupName);
        td.attr('colspan', '4');
        tr.append(td);
        tbody.append(tr);
    },
    addTableRow: function(indicator, groupId){
        var tr = jQuery('<tr>');
        tr.append('<td class="even">' + indicator.altlabel + '</td>');
        tr.append('<td class="odd">' + indicator.longlabel + '</td>');
        tr.append('<td class="even">' +
                    '<strong class="definition">Definition: </strong>' + indicator.definition +
                    '<br />' +
                    '<strong class="notes">Notes: </strong>' + indicator.notes +
                '</td>');
        var source = jQuery('<td class="odd">');
        if(indicator.sourcelink){
          source.append('<a href="' + indicator.sourcelink + '">' + indicator.sourcelabel + '</a>');
        }
        else if(indicator.sourcelabel){
          source.text(indicator.sourcelabel);
        }
        tr.append(source);
        jQuery('tr#' + groupId).after(tr);
    },
    addNavigation: function(){
      var locationPath = window.location.href.split('/');
      var location = locationPath.slice(0, locationPath.length - 1).join('/');
      var navigation = new Scoreboard.Views.DatasetNavigationView({
          el: jQuery('#dataset-navigation'),
          cube_url: location,
          selected_url: location,
          url_extension: '/indicators'
      });
    }
};

jQuery(document).ready(function(){
    scoreboard.visualization.datacube.indicators.getDatasetMetadata();
    scoreboard.visualization.datacube.indicators.getDatasetDetails();
    scoreboard.visualization.datacube.indicators.addNavigation();
});

