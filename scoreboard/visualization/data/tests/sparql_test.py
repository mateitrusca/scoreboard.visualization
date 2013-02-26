import pytest
from mock import Mock
import simplejson as json


def sparql_test(func):
    return pytest.mark.skipif("os.environ.get('SBTEST_SPARQL') != 'on'")(func)


INDICATORS = 'http://data.lod2.eu/scoreboard/indicators/'


@sparql_test
def test_map_indicators_years():
    from scoreboard.visualization.views.scoreboard import data
    res = set((r['indicator'], r['year_label'])
              for r in data.run_query('map_indicators_years'))
    for ind in ['bb_fcov_TOTAL_POP__pop',
                'bb_fcov_RURAL_POP__pop',
                'bb_lines_TOTAL_FBB_nbr_lines']:
        assert (INDICATORS + ind, '2008') in res


def _data_query(form, view_cls_name='DataView'):
    from scoreboard.visualization.views.scoreboard import data
    view = getattr(data, view_cls_name)()
    view.request = Mock(form=form)
    return json.loads(view())


@sparql_test
def test_filters_view():
    from scoreboard.visualization.views.scoreboard import data
    res = _data_query({}, 'FiltersView')
    assert {'uri': 'http://data.lod2.eu/scoreboard/country/Finland',
            'label': 'Finland'} in res['countries']
    assert {'uri': 'http://data.lod2.eu/scoreboard/country/Italy',
            'label': 'Italy'} in res['countries']

    indicators = [(i['uri'], i['unit'], sorted(i['years']))
                  for i in res['indicators']]
    assert (INDICATORS + 'tel_inv_TOTAL_TELECOM_million_euro',
            'million_euro', ['2009', '2010']) in indicators
    assert (INDICATORS + 'bb_speed30_TOTAL_FBB__lines',
            '%_lines', ['2010', '2011']) in indicators


@sparql_test
def test_data_get_series_for_one_indicator_one_year():
    res = _data_query({
        'method': 'series_indicator_year',
        'indicator': ('http://data.lod2.eu/scoreboard/'
                      'indicators/tel_rev_TOTAL_TELECOM_million_euro'),
        'year': 'http://data.lod2.eu/scoreboard/year/2009',
    })
    assert {"country_name": "Estonia", "value": 716.0} in res
    assert {"country_name": "Finland", "value": 4730.0} in res


@sparql_test
def test_data_get_series_for_one_indicator_one_country():
    res = _data_query({
        'method': 'series_indicator_country',
        'indicator': ('http://data.lod2.eu/scoreboard/'
                      'indicators/h_iacc_HH_TOTAL__hh'),
        'country': ('http://data.lod2.eu/scoreboard/'
                    'country/European+Union+-+27+countries'),
    })
    assert {'value': 0.4918411076068878, 'year': 2006} in res
    assert {'value': 0.6038933396339417, 'year': 2008} in res


@sparql_test
def test_data_get_series_for_two_indicators_one_year():
    res = _data_query({
        'method': 'series_2indicator_year',
        'indicator_x': ('http://data.lod2.eu/scoreboard/'
                        'indicators/tel_rev_TOTAL_TELECOM_million_euro'),
        'indicator_y': ('http://data.lod2.eu/scoreboard/'
                        'indicators/bb_dsl_TOTAL_FBB__lines'),
        'year': 'http://data.lod2.eu/scoreboard/year/2009',
    })
    assert {'country_name': 'Czech Republic',
            'value_y': 0.4065999984741211,
            'value_x': 5491.0} in res
    assert {'country_name': 'Italy',
            'value_y': 0.9761999845504761,
            'value_x': 43096.0} in res


@sparql_test
def test_dimensions_query():
    from scoreboard.visualization.data.cube import Cube
    from scoreboard.visualization.views.scoreboard import data
    dataset = 'http://semantic.digital-agenda-data.eu/dataset/scoreboard'
    cube = Cube(data.SPARQL_ENDPOINT, dataset)
    dimensions = cube.get_dimensions()
    DAD_SCHEMA = 'http://semantic.digital-agenda-data.eu/def/'
    assert (DAD_SCHEMA + 'property/indicator') in dimensions
    assert (DAD_SCHEMA + 'property/ref-area') in dimensions
