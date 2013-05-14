""" Various setups
"""
import json
import logging
from zope.component import queryUtility
from eea.app.visualization.zopera import IPropertiesTool
from eea.app.visualization.interfaces import IDavizSettings
from scoreboard.visualization.config import EU, BLACKLIST
logger = logging.getLogger('scoreboard.visualization')

def setupVarious(context):
    """ Custom setup """

    if context.readDataFile('scoreboard.visualization.txt') is None:
        return

    ds = queryUtility(IDavizSettings)
    if not ds.disabled('daviz.properties', 'ScoreboardVisualization'):
        logger.info('Disabling Daviz Properties for ScoreboardVisualization')
        ds.settings.setdefault('forbidden.daviz.properties', [])
        ds.settings['forbidden.daviz.properties'].append(
            'ScoreboardVisualization')

    ptool = queryUtility(IPropertiesTool)
    if not getattr(ptool, 'scoreboard_properties', None):
        ptool.manage_addPropertySheet(
            'scoreboard_properties', 'Scoreboard Properties')

    stool = getattr(ptool, 'scoreboard_properties', None)
    eu = stool.getProperty('EU', None)
    if not eu:
        default = json.dumps(EU, indent=2)
        stool.manage_addProperty('EU', default, 'text')

    blacklist = stool.getProperty('BLACKLIST', None)
    if not blacklist:
        default = json.dumps(BLACKLIST, indent=2)
        stool.manage_addProperty('BLACKLIST', default, 'text')
