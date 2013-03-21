""" Tiles view module
"""
import json
from zope.interface import implements
from eea.app.visualization.views.view import ViewForm
from scoreboard.visualization.views.scoreboard.interfaces import IScoreboardView
from scoreboard.visualization.jsapp import jsapp_html

DATASOURCE_NAME = 'scoreboard-test-cube'  # TODO should not be hardcoded


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

    def jsapp_html(self):
        source = self.context.aq_parent[DATASOURCE_NAME]
        cube = source.get_cube()
        return jsapp_html(DATASOURCE_URL=source.absolute_url(),
                          DATA_REVISION=cube.get_revision())
