"""Definition of the ScoreboardVisualization content type
"""

from zope.interface import implements

from Products.Archetypes import atapi
from Products.ATContentTypes.content import folder
from Products.ATContentTypes.content import schemata

# -*- Message Factory Imported Here -*-

from scoreboard.visualization.interfaces import IScoreboardVisualization
from scoreboard.visualization.config import PROJECTNAME

ScoreboardVisualizationSchema = folder.ATFolderSchema.copy() + atapi.Schema((

    # -*- Your Archetypes field definitions here ... -*-

))

# Set storage on fields copied from ATFolderSchema, making sure
# they work well with the python bridge properties.

ScoreboardVisualizationSchema['title'].storage = atapi.AnnotationStorage()
ScoreboardVisualizationSchema['description'].storage = atapi.AnnotationStorage()

schemata.finalizeATCTSchema(
    ScoreboardVisualizationSchema,
    folderish=True,
    moveDiscussion=False
)


class ScoreboardVisualization(folder.ATFolder):
    """Description of the Example Type"""
    implements(IScoreboardVisualization)

    meta_type = "ScoreboardVisualization"
    schema = ScoreboardVisualizationSchema

    title = atapi.ATFieldProperty('title')
    description = atapi.ATFieldProperty('description')

    # -*- Your ATSchema to Python Property Bridges Here ... -*-

atapi.registerType(ScoreboardVisualization, PROJECTNAME)
