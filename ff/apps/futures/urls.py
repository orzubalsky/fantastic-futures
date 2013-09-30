from django.conf.urls import patterns, url

urlpatterns = patterns(
    'futures.views',
    url(r'ajax-upload$', 'import_uploader', name="ajax-upload"),
    url(r'start$', 'start', name="start"),
    url(r'11/09/12$', 'performance', name="performance"),
    #url(r'^sound/(?P<sound_slug>[-\w]+)$', 'view_sound', name='view-sound'),
    url(r'^sound-layer$', 'sound_layer', name='sound-layer'),
    url(r'^sound-layer/collection/(?P<slug>[0-9A-Za-z\-_]+)$', 'sound_layer', name='sound-collection-layer'),
    url(r'(?P<slug>[0-9A-Za-z\-_]+)$', 'collection_list', name='collection-list'),
    url(r'^$', 'index', name='home'),
)
