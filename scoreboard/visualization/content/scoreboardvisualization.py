"""Definition of the ScoreboardVisualization content type
"""

from zope.interface import implements
from zope.event import notify

from Products.Archetypes import atapi
from Products.ATContentTypes.content import folder
from Products.ATContentTypes.content import schemata

# -*- Message Factory Imported Here -*-
from eea.app.visualization.events import VisualizationEnabledEvent
from scoreboard.visualization.interfaces import IScoreboardVisualization
from scoreboard.visualization.config import PROJECTNAME, _


class CustomReferenceField(atapi.ReferenceField):
    """ Notify on set
    """
    def set(self, instance, value, **kwargs):
        """ Notify custom event on set
        """
        old = self.getRaw(instance, aslist=True)
        super(CustomReferenceField, self).set(instance, value, **kwargs)
        if set(old) != set(value):
            notify(VisualizationEnabledEvent(instance, cleanup=False))

ScoreboardVisualizationSchema = folder.ATFolderSchema.copy() + atapi.Schema((
    CustomReferenceField('relatedItems',
        relationship='relatesTo',
        multiValued=True,
        isMetadata=True,
        languageIndependent=False,
        index='KeywordIndex',
        referencesSortable=True,
        #required=True,
        vocabulary_factory=u'scoreboard.visualization.vocabulary.DataCube',
        widget=atapi.SelectionWidget(
            format=u'select',
            label=_(u'Data source'),
            description='',
            visible={'edit': 'visible', 'view': 'invisible'}
            )
        )
))

# Set storage on fields copied from ATFolderSchema, making sure
# they work well with the python bridge properties.

ScoreboardVisualizationSchema['title'].storage = atapi.AnnotationStorage()
ScoreboardVisualizationSchema['description'].storage = atapi.AnnotationStorage()

schemata.finalizeATCTSchema(
    ScoreboardVisualizationSchema,
    folderish=False,
    moveDiscussion=False
)
ScoreboardVisualizationSchema.changeSchemataForField('relatedItems', 'default')

class ScoreboardVisualization(folder.ATFolder):
    """Description of the Example Type"""
    implements(IScoreboardVisualization)

    meta_type = "ScoreboardVisualization"
    schema = ScoreboardVisualizationSchema

    title = atapi.ATFieldProperty('title')
    description = atapi.ATFieldProperty('description')

    # -*- Your ATSchema to Python Property Bridges Here ... -*-

atapi.registerType(ScoreboardVisualization, PROJECTNAME)
