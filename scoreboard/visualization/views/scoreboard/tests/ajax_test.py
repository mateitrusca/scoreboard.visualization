from mock import Mock, patch, call
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


def test_single_filter_passed_on_to_query():
    with patch('scoreboard.visualization.views.scoreboard.data.Cube') as Cube:
        _filter_options_query({
            'dimension': 'ref-area',
            'time-period': '2002',
        })
    cube_call = Cube.return_value.get_dimension_options.mock_calls[0]
    assert cube_call == call('ref-area', [('time-period', '2002')])


def test_filters_passed_on_to_query():
    with patch('scoreboard.visualization.views.scoreboard.data.Cube') as Cube:
        _filter_options_query({
            'dimension': 'ref-area',
            'time-period': '2002',
            'indicator': 'h_iacc',
        })
    cube_call = Cube.return_value.get_dimension_options.mock_calls[0]
    assert cube_call == call('ref-area', [('indicator', 'h_iacc'),
                                          ('time-period', '2002')])
