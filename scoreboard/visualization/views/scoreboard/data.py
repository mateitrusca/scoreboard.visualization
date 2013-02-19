import simplejson as json
from collections import defaultdict
from scoreboard.visualization.old.views import run_query


class FiltersView(object):

    def __call__(self):
        years = defaultdict(list)
        for row in run_query('map_indicators_years'):
            years[row['indicator']].append(row['year_label'])

        indicators = []
        for row in run_query('all_indicators'):
            indicators.append({
                'uri': row['indicator'],
                'label': row['label'],
                'years': sorted(years[row['indicator']], reverse=True),
                'comment': row['comment'],
                'publisher': row['publisher'],
                'unit': row['unit'],
            })

        countries = []
        for row in run_query('all_countries'):
            countries.append({
                'uri': row['country'],
                'label': row['label'],
            })

        out = {
            'indicators': indicators,
            'countries': countries,
        }
        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(out, indent=2, sort_keys=True)


class DataView(object):

    def __call__(self):
        args = dict(self.request.form)
        method_name = args.pop('method')
        out = run_query(method_name, **args)

        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(out, indent=2, sort_keys=True)
