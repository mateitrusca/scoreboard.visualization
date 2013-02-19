""" Handle events
"""
import logging
from zope.component import queryAdapter
from eea.app.visualization.interfaces import IVisualizationConfig
logger = logging.getLogger('scoreboard')

def create_default_views(obj, evt):
    """ Create default views
    """
    mutator = queryAdapter(obj, IVisualizationConfig)
    if not mutator:
        logger.warn("Couldn't find any IVisualizationConfig adapter for %s",
                    obj.absolute_url(1))
        return

    # Views already configure, do nothing
    if mutator.views:
        return

    mutator.add_view('scoreboard.highchart')
