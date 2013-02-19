from Products.Five.browser import BrowserView


class ChartView(BrowserView):

    def __init__(self, context, request):
        super(ChartView, self).__init__(context, request)
        self.message = "Hello from scoreboard!"
