import pytest
from mock import Mock, patch
import simplejson as json


def _filter_options_query(form):
    from scoreboard.visualization.views.scoreboard import data
    filters_view = data.FiltersView()
    filters_view.request = Mock(form=form)
    return json.loads(filters_view.filter_options())


def test_all_indicator_values():
    with patch('scoreboard.visualization.views.scoreboard.data.Cube') as Cube:
        Cube.return_value.get_dimension_options.return_value = [
            {'label': 'indicator one', 'notation': 'one'},
            {'label': 'indicator two', 'notation': 'two'},
        ]
        res = _filter_options_query({'dimension': 'indicator'})
    assert {'label': 'indicator one', 'notation': 'one'} in res['options']
    assert {'label': 'indicator two', 'notation': 'two'} in res['options']
