from zope.interface import Interface


class IDemo(Interface):
    """ Marker interface for demo page """


class DemoView(object):

    def __call__(self):
        return "hello world!\n"
