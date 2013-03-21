""" Various setups
"""
import logging
from zope.component import queryUtility
from eea.app.visualization.interfaces import IDavizSettings
logger = logging.getLogger('scoreboard.visualization')

def setupVarious(context):
    """ Custom setup """

    if context.readDataFile('scoreboard.visualization.txt') is None:
        return

    ds = queryUtility(IDavizSettings)
    if ds.disabled('daviz.properties', 'ScoreboardVisualization'):
        return

    logger.info('Disabling Daviz Properties for ScoreboardVisualization')
    ds.settings.setdefault('forbidden.daviz.properties', [])
    ds.settings['forbidden.daviz.properties'].append('ScoreboardVisualization')
