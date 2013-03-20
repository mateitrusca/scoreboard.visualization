"""Common configuration constants
"""
PROJECTNAME = 'scoreboard.visualization'

ADD_PERMISSIONS = {
    'ScoreboardVisualization':
        'scoreboard.visualization: Add ScoreboardVisualization',
    'DataCube':
        'scoreboard.visualization: Add DataCube',
}

from zope.i18nmessageid.message import MessageFactory
_ = MessageFactory('scoreboard')
