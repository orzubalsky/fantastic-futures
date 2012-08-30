from futures.models import *
from django.contrib.gis import admin

class GeoAdmin(admin.OSMGeoAdmin):
    default_lon = -8232697.21600
    default_lat = 4976132.48641
    default_zoom = 10

class GeoSoundAdmin(GeoAdmin):
    list_display        = ( 'title', 'sound', 'created_by', 'user', 'location', 'point', 'story', 'get_tags', 'is_active')
    fields              = ( 'title', 'sound', 'slug', 'created_by', 'user', 'location', 'story', 'tags', 'point', 'is_active')
    prepopulated_fields = {'slug': ('title',)}    

class UserProfileAdmin(admin.ModelAdmin):
    list_display        = ( 'display_name', 'city','state', 'country')
    fields              = ( 'display_name', 'slug', 'city','state', 'country', 'country_code', 'number')
    prepopulated_fields = {'slug': ('display_name',)}
    
admin.site.register(GeoSound, GeoSoundAdmin)
admin.site.register(UserProfile, UserProfileAdmin)

