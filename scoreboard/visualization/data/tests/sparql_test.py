import pytest


def sparql_test(func):
    return pytest.mark.skipif("os.environ.get('SBTEST_SPARQL') != 'on'")(func)


def _create_cube():
    from scoreboard.visualization.data.cube import Cube
    from scoreboard.visualization.views.scoreboard import data
    dataset = 'http://semantic.digital-agenda-data.eu/dataset/scoreboard'
    return Cube(data.SPARQL_ENDPOINT, dataset)


@sparql_test
def test_dimensions_query():
    cube = _create_cube()
    res = cube.get_dimensions()
    dimensions = {d['notation']: d for d in res}
    assert 'indicator' in dimensions
    assert 'ref-area' in dimensions
    assert dimensions['ref-area']['group_notation'] is None
    assert dimensions['indicator']['group_notation'] == 'indicator-group'


@sparql_test
def test_get_all_year_options():
    cube = _create_cube()
    items = cube.get_dimension_options('ref-area')
    codes = [y['notation'] for y in items]
    assert len(codes) == 34
    assert 'DE' in codes
    assert 'ES' in codes
    assert 'IS' in codes
    assert 'EU27' in codes


@sparql_test
def test_get_available_country_options_for_year():
    cube = _create_cube()
    items = cube.get_dimension_options('ref-area', [
        ('time-period', '2002'),
    ])
    codes = [y['notation'] for y in items]
    assert len(codes) == 17
    assert 'DE' in codes
    assert 'ES' in codes
    assert 'IS' not in codes
    assert 'EU27' not in codes


@sparql_test
def test_get_available_country_options_for_year_and_indicator():
    cube = _create_cube()
    items = cube.get_dimension_options('ref-area', [
        ('time-period', '2002'),
        ('indicator', 'h_iacc'),
    ])
    codes = [y['notation'] for y in items]
    assert len(codes) == 15
    assert 'DE' in codes
    assert 'ES' not in codes
    assert 'IS' not in codes
    assert 'EU27' not in codes


@sparql_test
def test_get_data_by_ref_area_with_dimension_filters():
    columns = ('ref-area', 'value')
    filters = [
        ('indicator', 'i_bfeu'),
        ('time-period', '2011'),
        ('breakdown', 'IND_TOTAL'),
        ('unit-measure', 'pc_ind'),
    ]
    cube = _create_cube()
    points = list(cube.get_data(columns, filters))
    assert len(points) == 31
    assert {'ref-area': 'IE', 'value': 0.2222} in points


@sparql_test
def test_get_data_by_time_period_with_dimension_filters():
    columns = ('time-period', 'value')
    filters = [
        ('indicator', 'i_bfeu'),
        ('breakdown', 'IND_TOTAL'),
        ('unit-measure', 'pc_ind'),
        ('ref-area', 'IE'),
    ]
    cube = _create_cube()
    points = list(cube.get_data(columns, filters))
    assert {'time-period': '2011', 'value': 0.2222} in points
    assert len(points) == 5


@sparql_test
def test_get_data_by_time_period_and_ref_area_with_dimension_filters():
    columns = ('time-period', 'ref-area', 'value')
    filters = [
        ('indicator', 'i_bfeu'),
        ('breakdown', 'IND_TOTAL'),
        ('unit-measure', 'pc_ind'),
    ]
    cube = _create_cube()
    points = list(cube.get_data(columns, filters))
    assert {'time-period': '2011', 'ref-area': 'IE', 'value': 0.2222} in points
    assert {'time-period': '2010', 'ref-area': 'PT', 'value': 0.0609} in points
    assert len(points) == 161
