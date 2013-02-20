import simplejson as json
from path import path
from sparql import unpack_row


queries = {q['id']: q for q in json.loads(
    (path(__file__).parent / 'fixtures.json').bytes())}


def run_query(method_name, **kwargs):
    from Products.ZSPARQLMethod.Method import ZSPARQLMethod
    q = queries[method_name]
    method_ob = ZSPARQLMethod(q['id'], q['title'], q['endpoint_url'])
    method_ob.arg_spec = q['arg_spec']
    method_ob.query = q['query']
    result = method_ob(**kwargs)
    return [dict(zip(result.var_names, unpack_row(row)))
           for row in result.rdfterm_rows]
