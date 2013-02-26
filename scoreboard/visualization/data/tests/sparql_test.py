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


def _data_query(form):
    from scoreboard.visualization.views.scoreboard import data
    view = data.DataView()
    view.request = Mock(form=form)
    return json.loads(view())


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
