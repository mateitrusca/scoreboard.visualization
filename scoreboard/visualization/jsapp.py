def jsapp_html(URL):
    from .old.views import render_template
    return render_template('jsapp.html', URL=URL)
