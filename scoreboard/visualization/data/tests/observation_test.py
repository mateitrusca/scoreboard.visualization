from .base import sparql_test, _create_cube


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


@sparql_test
def test_get_data_by_time_period_and_ref_area_with_dimension_group_filters():
    columns = ('time-period', 'ref-area', 'value')
    filters = [
        ('indicator-group', 'ecommerce'),
        ('indicator', 'i_bfeu'),
        ('breakdown-group', 'total'),
        ('breakdown', 'IND_TOTAL'),
        ('unit-measure', 'pc_ind'),
    ]
    cube = _create_cube()
    points = list(cube.get_data(columns, filters))
    assert {'time-period': '2011', 'ref-area': 'IE', 'value': 0.2222} in points
    assert {'time-period': '2010', 'ref-area': 'PT', 'value': 0.0609} in points
    assert len(points) == 161
