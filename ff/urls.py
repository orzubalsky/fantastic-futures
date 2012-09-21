from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings
from dajaxice.core import dajaxice_autodiscover, dajaxice_config
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from haystack.views import SearchView, search_view_factory
from futures.forms import GeoSearchForm


admin.autodiscover()
dajaxice_autodiscover()

# direct browser requests to the different apps
urlpatterns = patterns('',

    url(dajaxice_config.dajaxice_url, include('dajaxice.urls')),    
    url(r'^', include('futures.urls')),
    url(r'^admin/', include(admin.site.urls)),   
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
