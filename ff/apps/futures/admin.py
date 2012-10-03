from futures.models import *
from django.contrib.gis import admin

def randomize_z(modeladmin, request, queryset):
    for geosound in queryset:
        geosound.z = round(random.uniform(-20.0, 20.0), 2)
        geosound.save()
    randomize_z.short_description = "randomize z value"
    
def randomize_volume(modeladmin, request, queryset):
    for geosound in queryset:
        geosound.default_volume = round(random.uniform(0.2, 0.8), 2)
        geosound.save()
    randomize_volume.short_description = "randomize default volume value"

class GeoAdmin(admin.OSMGeoAdmin):
    default_lon = -8232697.21600
    default_lat = 4976132.48641
    default_zoom = 10

class GeoSoundAdmin(GeoAdmin):
    list_display        = ( 'title', 'sound', 'created_by', 'user', 'location', 'default_volume', 'z', 'story', 'get_tags', 'is_active')
    fields              = ( 'title', 'sound', 'slug', 'collections', 'created_by', 'user', 'location', 'story', 'tags', 'point', 'is_active')
    prepopulated_fields = {'slug': ('title',)}    
    actions = [randomize_z, randomize_volume]    

class ConstellationAdmin(admin.ModelAdmin):
    list_display        = ( 'title', 'created_by','location', 'rotation_x', 'rotation_y', 'rotation_z')
    fields              = ( 'title', 'slug', 'created_by', 'user', 'location', 'connections', 'rotation_x', 'rotation_y', 'rotation_z')
    prepopulated_fields = {'slug': ('title',)}

class UserProfileAdmin(admin.ModelAdmin):
    list_display        = ( 'display_name', 'city','state', 'country')
    fields              = ( 'display_name', 'slug', 'city','state', 'country', 'country_code', 'number')
    prepopulated_fields = {'slug': ('display_name',)}
    
admin.site.register(GeoSound, GeoSoundAdmin)
admin.site.register(Constellation, ConstellationAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Connection)


