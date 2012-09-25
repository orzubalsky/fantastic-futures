# Django settings for ts project.
import os, sys

ADMINS = (
    # ('The Youngest', 'youngestforever@gmail.com'),
)

MANAGERS = ADMINS

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

PROJECT_DIR = os.path.dirname(__file__)

sys.path.append(os.path.dirname(PROJECT_DIR))    
sys.path.append(PROJECT_DIR)
sys.path.append(os.path.join(PROJECT_DIR, 'apps'))                      
sys.path.append(os.path.join(PROJECT_DIR, 'libs'))


# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_DIR, 'static/'),    
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'django.contrib.staticfiles.finders.DefaultStorageFinder',
    'dajaxice.finders.DajaxiceFinder',    
)

LOCALE_PATHS = (
    os.path.join(PROJECT_DIR, 'locale/'),
)

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    'django.template.loaders.eggs.Loader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    'django.core.context_processors.static',
    "django.core.context_processors.request",
    'django.contrib.messages.context_processors.messages',    
)

MIDDLEWARE_CLASSES = (
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.contrib.redirects.middleware.RedirectFallbackMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'ff_cache',
    }
}

CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 300
CACHE_MIDDLEWARE_KEY_PREFIX = ''
CACHE_MIDDLEWARE_ANONYMOUS_ONLY = True

ROOT_URLCONF = 'ff.urls'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    PROJECT_DIR + '/apps/ff/templates',
    PROJECT_DIR + '/templates',
)

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = os.path.join(PROJECT_DIR, 'media')

ADMIN_MEDIA_PREFIX = '/admin/media/'

AUTH_PROFILE_MODULE = 'futures.UserProfile'

SERIALIZATION_MODULES = {
    'json': 'wadofstuff.django.serializers.json'
}

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.admindocs',
    'django.contrib.humanize',
    'django.contrib.redirects',
    'django.contrib.gis',    
    'south',                        # intelligent schema and data migrations
    'pytz',                         # python timezone library
    'dajaxice',                     # django ajax app
    'ajaxuploader',                 # ajax file uploader
    'taggit',                       # tagging app
    'chronograph',                  # admin based cron job management
    'haystack',                     # search framework    
    'tastypie',                     # REST API
    'classic',                      # ff v2 datamodels, used here mostly for migrating data
    'futures',                      # fantastic futures!
)



# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'console':{
            'level':'DEBUG',
            'class':'logging.StreamHandler'
        },        
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'dajaxice': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

EMAIL_SUBJECT_PREFIX = 'FF | '
SERVER_EMAIL = 'django@fantasticfutures.fm'

try:
    LOCAL_SETTINGS
except NameError:
    from local_settings import *
    
HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.elasticsearch_backend.ElasticsearchSearchEngine',
        'URL': 'http://127.0.0.1:9200/',
        'INDEX_NAME': 'haystack',
    },
}
    