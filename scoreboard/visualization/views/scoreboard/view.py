""" Tiles view module
"""
import json
from zope.interface import implements
from eea.app.visualization.views.view import ViewForm
from .interfaces import IScoreboardView
from scoreboard.visualization.jsapp import jsapp_html


class View(ViewForm):
    """ Tile view
    """
    _label = 'Scoreboard View'
    implements(IScoreboardView)

    @property
    def label(self):
        """ View title
        """
        return self.data.get('title', '') or self._label

    @property
    def entry_point(self):
        configuration = json.loads(self.data.get('configuration', '{}'))
        return configuration.get('chart_entry_point',
                                 'App.scenario1_initialize')

    def get_source(self):
        from edw.datacube.interfaces import IDataCube
        for source in self.context.getRelatedItems():
            if IDataCube.providedBy(source):
                return source

    def jsapp_html(self):
        source = self.get_source()
        if source is None:
            return "No data source available"
        cube = source.get_cube()
        return jsapp_html(DATASOURCE_URL=source.absolute_url(),
                          SCENARIO_URL = self.context.absolute_url(),
                          DATA_REVISION=cube.get_revision())
