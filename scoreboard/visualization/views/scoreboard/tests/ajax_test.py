from mock import Mock, patch, call
import simplejson as json
import pytest


def ajax(name, form):
    from scoreboard.visualization.views.scoreboard import data
    view = data.CubeView(Mock(), Mock(form=form))
    return json.loads(getattr(view, name)())


@pytest.fixture()
def mock_cube(request):
    p = patch('scoreboard.visualization.views.scoreboard.data.Cube')
    request.addfinalizer(p.stop)
    return p.start().return_value


def test_dimension_all_indicator_values(mock_cube):
    mock_cube.get_dimension_options.return_value = [
        {'label': 'indicator one', 'notation': 'one'},
        {'label': 'indicator two', 'notation': 'two'},
    ]
    res = ajax('dimension_values', {'dimension': 'indicator'})
    assert {'label': 'indicator one', 'notation': 'one'} in res['options']
    assert {'label': 'indicator two', 'notation': 'two'} in res['options']


def test_dimension_single_filter_passed_on_to_query(mock_cube):
    ajax('dimension_values', {
        'dimension': 'ref-area',
        'time-period': '2002',
    })
    cube_call = mock_cube.get_dimension_options.mock_calls[0]
    assert cube_call == call('ref-area', [('time-period', '2002')])


def test_dimension_filters_passed_on_to_query(mock_cube):
    ajax('dimension_values', {
        'dimension': 'ref-area',
        'time-period': '2002',
        'indicator': 'h_iacc',
    })
    cube_call = mock_cube.get_dimension_options.mock_calls[0]
    assert cube_call == call('ref-area', [('indicator', 'h_iacc'),
                                          ('time-period', '2002')])


def test_dimension_xy_filters_passed_on_to_query(mock_cube):
    mock_cube.get_dimension_options_xy.return_value = ['something']
    res = ajax('dimension_values_xy', {
        'dimension': 'ref-area',
        'time-period': '2002',
        'breakdown': 'blahblah',
        'x:indicator': 'i_iuse',
        'y:indicator': 'i_iu3g',
    })
    assert mock_cube.get_dimension_options_xy.mock_calls[0] == call(
        'ref-area',
        [('breakdown', 'blahblah'), ('time-period', '2002')],
        [('indicator', 'i_iuse')],
        [('indicator', 'i_iu3g')])
    assert res == {'options': ['something']}


def test_data_query_sends_filters_and_columns(mock_cube):
    ajax('datapoints', {
        'columns': 'time-period,ref-area,value',
        'indicator': 'i_bfeu',
        'breakdown': 'IND_TOTAL',
        'unit-measure': 'pc_ind',
    })
    cube_call = mock_cube.get_data.mock_calls[0]
    assert cube_call == call(columns=['time-period', 'ref-area', 'value'],
                             filters=[('breakdown', 'IND_TOTAL'),
                                      ('indicator', 'i_bfeu'),
                                      ('unit-measure', 'pc_ind')])


def test_data_query_returns_rows(mock_cube):
    rows = [{'time-period': '2011', 'ref-area': 'IE', 'value': 0.2222},
            {'time-period': '2010', 'ref-area': 'PT', 'value': 0.0609}]
    mock_cube.get_data.return_value = iter(rows)
    res = ajax('datapoints', {
        'columns': 'time-period,ref-area,value',
        'indicator': 'i_bfeu',
        'breakdown': 'IND_TOTAL',
        'unit-measure': 'pc_ind',
    })
    cube_call = mock_cube.get_data.mock_calls[0]
    assert cube_call == call(columns=['time-period', 'ref-area', 'value'],
                             filters=[('breakdown', 'IND_TOTAL'),
                                      ('indicator', 'i_bfeu'),
                                      ('unit-measure', 'pc_ind')])
    assert res == {'datapoints': rows}


def test_data_xy_query_sends_filters_and_columns(mock_cube):
    mock_cube.get_data_xy.return_value = ['something']
    res = ajax('datapoints_xy', {
        'x:indicator': 'i_iuse',
        'y:indicator': 'i_iu3g',
        'unit-measure': 'pc_ind',
        'breakdown': 'IND_TOTAL',
        'columns': 'time-period,ref-area',
        'xy_columns': 'value',
    })
    cube_call = mock_cube.get_data_xy.mock_calls[0]
    assert cube_call == call(columns=['time-period', 'ref-area'],
                             xy_columns=['value'],
                             filters=[('breakdown', 'IND_TOTAL'),
                                      ('unit-measure', 'pc_ind')],
                             x_filters=[('indicator', 'i_iuse')],
                             y_filters=[('indicator', 'i_iu3g')])
    assert res == {'datapoints': ['something']}
