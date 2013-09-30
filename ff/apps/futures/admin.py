from futures.models import *
from futures.forms import *
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
    list_display = (
        'title',
        'sound',
        'created_by',
        'user',
        'location',
        'default_volume',
        'z',
        'story',
        'get_tags',
        'is_active'
    )
    list_editable = (
        'created_by',
        'location',
        'default_volume',
        'z',
        'is_active'
    )

    fields = (
        'title',
        'sound',
        'slug',
        'collections',
        'created_by',
        'user',
        'location',
        'story',
        'tags',
        'point',
        'is_active'
    )
    prepopulated_fields = {
        'slug': ('title',)
    }
    actions = [
        randomize_z,
        randomize_volume
    ]


class ConnectionAdmin(admin.ModelAdmin):
    list_display = (
        'sound_1',
        'sound_1_volume',
        'sound_2',
        'sound_2_volume'
    )
    fields = (
        'sound_1',
        'sound_1_volume',
        'sound_2',
        'sound_2_volume'
    )


class ConstellationAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'created_by',
        'location',
        'rotation_x',
        'rotation_y',
        'rotation_z',
        'zoom'
    )
    list_editable = (
        'created_by',
        'location',
        'rotation_x',
        'rotation_y',
        'rotation_z',
        'zoom'
    )
    fields = (
        'title',
        'slug',
        'created_by',
        'user',
        'location',
        'connections',
        'rotation_x',
        'rotation_y',
        'rotation_z',
        'zoom',
    )
    prepopulated_fields = {
        'slug': ('title',)
    }


class MapSettingAdmin(GeoAdmin):
    list_display = (
        'title',
        'basemap',
    )
    fields = (
        'title',
        'basemap',
        'initial_bounds',
        'zoom_enabled',
        'mapdisplay_fill_color',
        'mapdisplay_fill_opacity',
        'mapdisplay_stroke_color',
        'mapdisplay_stroke_opacity',
        'mapdisplay_point_radius',
        'mapdisplay_size',
    )


class UserProfileAdmin(admin.ModelAdmin):
    list_display = (
        'display_name',
        'city',
        'state',
        'country'
    )
    fields = (
        'display_name',
        'slug',
        'city',
        'state',
        'country',
        'country_code',
        'number'
    )
    prepopulated_fields = {
        'slug': ('display_name',)
    }


admin.site.register(GeoSound, GeoSoundAdmin)
admin.site.register(Constellation, ConstellationAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Connection, ConnectionAdmin)
admin.site.register(MapSetting, MapSettingAdmin)
admin.site.register(Collection)
