""" Tiles view module
"""
import json
from zope.interface import implements
from eea.app.visualization.views.view import ViewForm
from scoreboard.visualization.views.scoreboard.interfaces import IScoreboardView
from scoreboard.visualization.old.views import render_template

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

    def get_chart(self):
        data = {
            'URL': self.context.absolute_url(),
            'entry_point': 'App.scenario1_initialize',
        }
        data.update(json.loads(self.data['configuration'])['chart-options'])
        return render_template('scenario.html', **data)
