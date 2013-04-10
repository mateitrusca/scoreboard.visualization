""" Tiles view module
"""
import json
from zope.interface import implements
from eea.app.visualization.views.view import ViewForm
from edw.datacube.interfaces import IDataCube
from .interfaces import IScoreboardView
from scoreboard.visualization import jsapp


def jsapp_html_for_visualization(visualization):
    for source in visualization.getRelatedItems():
        if IDataCube.providedBy(source):
            break
    else:
        return "No data source available"

    cube = source.get_cube()
    return jsapp.jsapp_html(DATASOURCE_URL=source.absolute_url(),
                            SCENARIO_URL=visualization.absolute_url(),
                            DATA_REVISION=cube.get_revision())


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
    def config(self):
        return self.data.get('configuration', '{}')

    def jsapp_html(self):
        return jsapp_html_for_visualization(self.context)
