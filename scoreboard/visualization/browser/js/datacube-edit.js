if(window.scoreboard === undefined){
    var scoreboard = {
        version: '1.0'
    };
};

if(scoreboard.datacube === undefined){
    scoreboard.datacube = {};
};

scoreboard.datacube.edit = {
    load: function(){
        console.log('DataCube edit.js READY!');
    }
};

jQuery(document).ready(function(){
    scoreboard.datacube.edit.load();
});
