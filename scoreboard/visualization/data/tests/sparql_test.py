import pytest


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
