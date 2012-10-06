from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings
from dajaxice.core import dajaxice_autodiscover, dajaxice_config
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from haystack.views import SearchView, search_view_factory
from futures.forms import GeoSearchForm
from tastypie.api import Api
from futures.api import *


admin.autodiscover()
dajaxice_autodiscover()


v1_api = Api(api_name='v1')
v1_api.register(UserResource())
v1_api.register(GeoSoundResource())
v1_api.register(ConnectionResource())
v1_api.register(ConstellationResource())


# direct browser requests to the different apps
urlpatterns = patterns('',

    url(r'^admin/', include(admin.site.urls)),
    url(dajaxice_config.dajaxice_url, include('dajaxice.urls')),    
    url(r'^', include('futures.urls')),
    (r'^api/', include(v1_api.urls)),
)

# search url pattern
urlpatterns += patterns('haystack.views',
    url(r'^search/', search_view_factory(
        view_class    = SearchView,
        template      = 'search.html',
        form_class    = GeoSearchForm
    ), name='haystack_search'),
)

# static files url patterns
urlpatterns += staticfiles_urlpatterns()

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', { 'document_root': settings.MEDIA_ROOT, }),
   )
