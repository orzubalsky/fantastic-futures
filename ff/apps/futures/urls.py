from django.conf.urls import patterns, include, url

urlpatterns = patterns('futures.views',
    url(r'^add$', 'add_sound', name='add-sound'),
    url(r'^sound/(?P<sound_slug>[-\w]+)$', 'view_sound', name='view-sound'),
    url(r'^sound-layer$', 'sound_layer', name='sound-layer'),    
    url(r'^$', 'index', name='index'),    
)
