from django.conf.urls import patterns, include, url

urlpatterns = patterns('futures.views',
    url(r'ajax-upload$', 'import_uploader', name="ajax-upload"),    
    url(r'start$', 'start', name="start"),
    url(r'new-museum$', 'performance', name="performance"),
    url(r'^sound/(?P<sound_slug>[-\w]+)$', 'view_sound', name='view-sound'),
    url(r'^sound-layer$', 'sound_layer', name='sound-layer'),    
    url(r'^$', 'index', name='home'),    
)
