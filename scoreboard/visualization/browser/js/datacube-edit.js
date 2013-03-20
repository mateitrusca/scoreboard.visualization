if(window.scoreboard === undefined){
    var scoreboard = {
        version: '1.0'
    };
};

if(scoreboard.datacube === undefined){
    scoreboard.datacube = {};
};

scoreboard.datacube.edit = {
    renderDatasetsBox: function(){
        var fieldset = jQuery('fieldset#fieldset-default');
        var datasetsBox = jQuery('<div id="datasets-box">');
        fieldset.append(datasetsBox);
        return datasetsBox;
    },
    renderDatasetsBoxLoadButton: function(endpoint, datasetsBox){
        var self = this;
        var fetchDatasetsButton = jQuery('<button>');
        fetchDatasetsButton.text('Fetch datasets');
        fetchDatasetsButton.bind('click', function(evt){
            evt.preventDefault();
            if(!endpoint.val()){
                alert('No endpoint defined!');
            }else{
                self.renderDatasets(endpoint, datasetsBox);
            }
            return false;
        });
        datasetsBox.empty().append(fetchDatasetsButton);
    },
    fetchDatasets: function(endpoint){
        var data = [
            {'id': 'some-dataset-id-1'},
            {'id': 'some-dataset-id-2'},
            {'id': 'some-dataset-id-3'},
            {'id': 'some-dataset-id-4'},
            {'id': 'some-dataset-id-5'},
        ];
        return data
    },
    renderDatasets: function(endpoint, datasetsBox){
        var self = this;
        var datasetsJSON = self.fetchDatasets(endpoint);
        datasetsBox.empty();
        jQuery.each(datasetsJSON, function(i, o){
            var label = jQuery('<label>');
            label.text(o['id']);
            var field = jQuery('<input type="radio" name="dataset-entry">');
            field.val(o['id']);
            if(o['id'] == self.dataset.val()){
                field.attr({'checked': 'checked'});
            }
            label.prepend(field);
            datasetsBox.append(label);
            field.bind('click', function(){
                self.dataset.val(jQuery(this).val());
            });
        })

    },
    registerTriggers: function(){
        var self = this;
        var datasetsBox = self.renderDatasetsBox();
        self.endpoint.bind('keydown', function(){
            if(self.endpoint.val()){
                self.renderDatasetsBoxLoadButton(self.endpoint, datasetsBox);
            }
        });
        self.renderDatasets(self.endpoint, datasetsBox);
    }
};

jQuery(document).ready(function(){
    scoreboard.datacube.edit['endpoint'] = jQuery('textarea[name="endpoint"]');
    scoreboard.datacube.edit['dataset'] = jQuery('input[name="dataset"]');
    scoreboard.datacube.edit.registerTriggers();
});
