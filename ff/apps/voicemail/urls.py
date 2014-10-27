from django.conf.urls import patterns, url

urlpatterns = patterns(
    'voicemail.views',
    url(r'^answer/(?P<slug>[0-9A-Za-z\-_]+)/in/(?P<location>[0-9A-Za-z\-_]+)$', 'answer', name='answer'),
    url(r'^save/(?P<slug>[0-9A-Za-z\-_]+)/in/(?P<location>[0-9A-Za-z\-_]+)$', 'handle_recording', name='handle-recording'),

)
