""" Views exhibit tile interfaces
"""
from zope import schema
from zope.interface import Interface
from eea.app.visualization.views.interfaces import IVisualizationView
from scoreboard.visualization.config import _

class IScoreboardView(IVisualizationView):
    """ Scoreboard View
    """

class IScoreboardEdit(Interface):
    """ Edit Scoreboard
    """
    title = schema.TextLine(
        title=_(u"Title"),
        description=_(u"Friendly name for this visualization"),
        default=u"Scoreboard",
        required=True,
    )
    configuration = schema.Text(
        title=_(u"Configuration"),
        description=_(u"JSON that configures this visualization"),
        default=u"{}",
        required=True,
    )
