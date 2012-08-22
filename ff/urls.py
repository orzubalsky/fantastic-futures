from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings

admin.autodiscover()

# direct browser requests to the different apps
urlpatterns = patterns('',

    url(r'^', include('futures.urls')),
    url(r'^admin/', include(admin.site.urls)),

)

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', { 'document_root': settings.MEDIA_ROOT, }),
   )
