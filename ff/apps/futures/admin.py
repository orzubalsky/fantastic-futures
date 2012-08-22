from futures.models import *
from django.contrib.gis import admin

class GeoAdmin(admin.OSMGeoAdmin):
    default_lon = -8232697.21600
    default_lat = 4976132.48641
    default_zoom = 10

class SoundAdmin(GeoAdmin):
    list_display        = ( 'title', 'created_by', 'location', 'story', 'get_tags', 'is_active')
    fields              = ( 'title', 'slug', 'created_by', 'location', 'story', 'tags', 'point', 'is_active' )
    prepopulated_fields = {'slug': ('title',)}    

class AuthorAdmin(admin.ModelAdmin):
    list_display        = ( 'username', 'display_name', 'email', 'city','state', 'country')
    fields              = ( 'username', 'display_name', 'slug', 'email', 'city','state', 'country', 'country_code', 'number')
    prepopulated_fields = {'slug': ('display_name',)}
    
admin.site.register(Sound, SoundAdmin)
admin.site.register(Author, AuthorAdmin)

