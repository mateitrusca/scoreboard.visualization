""" Handle events
"""
import logging
from zope.component import queryAdapter, queryUtility
from eea.app.visualization.interfaces import IVisualizationConfig
from eea.app.visualization.interfaces import IDavizSettings
logger = logging.getLogger('scoreboard')

def create_default_views(obj, evt):
    """ Create default views
    """
    settings = queryUtility(IDavizSettings)
    if settings.disabled('scoreboard.highchart', obj):
        return

    mutator = queryAdapter(obj, IVisualizationConfig)
    if not mutator:
        logger.warn("Couldn't find any IVisualizationConfig adapter for %s",
                    obj.absolute_url(1))
        return

    # Views already configure, do nothing
    if mutator.view('scoreboard.highchart'):
        return

    mutator.add_view('scoreboard.highchart')
