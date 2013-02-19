""" Tiles view module
"""
from zope.interface import implements
from eea.app.visualization.views.view import ViewForm
from scoreboard.visualization.views.scoreboard.interfaces import IScoreboardView

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
    def message(self):
        """ Message
        """
        return "Hello from scoreboard!"
