Scoreboard
==========
This is an implementation of Scoreboard scenarios based on Zope2/Plone
and backbone_.

.. _backbone: http://backbonejs.org/


Development
-----------
To load SPARQL queries into the database, visit the URL
``fixtures-load``. After making changes, save them back into the
repository using the ``fixtures-dump`` view; make sure to set the
``SCOREBOARD_FIXTURES_DUMP`` environment variable to ``on``.
