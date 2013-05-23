"""Common configuration constants
"""
PROJECTNAME = 'scoreboard.visualization'

ADD_PERMISSIONS = {
    'ScoreboardVisualization':
        'scoreboard.visualization: Add ScoreboardVisualization',
}

from zope.i18nmessageid.message import MessageFactory
_ = MessageFactory('scoreboard')

# This list is used by country_profile chart and can be customized within
# ZMI > portal_properties > scoreboard_properties
EU = {
    "BE": "Belgium",
    "BG": "Bulgaria",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "DE": "Germany",
    "EE": "Estonia",
    "IE": "Ireland",
    "EL": "Greece",
    "ES": "Spain",
    "FR": "France",
    "IT": "Italy",
    "CY": "Cyprus",
    "LV": "Latvia",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "HU": "Hungary",
    "MT": "Malta",
    "NL": "Netherlands",
    "AT": "Austria",
    "PL": "Poland",
    "PT": "Portugal",
    "RO": "Romania",
    "SI": "Slovenia",
    "SK": "Slovakia",
    "FI": "Finland",
    "SE": "Sweden",
    "UK": "United Kingdom"
}

# This list is used by country_profile chart and can be customized within
# ZMI > portal_properties > scoreboard_properties
WHITELIST = [
    {
        'unit-measure': 'pc_hh',
    },
    {
        'unit-measure': 'pc_ent',
    },
    {
        'unit-measure': 'pc_lines',
    },
    {
        'unit-measure': 'pc_rural_pop',
    },
    {
        'unit-measure': 'pc_pop',
    },
]
