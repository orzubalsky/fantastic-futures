from django.contrib.gis.db.models import *
from django.utils.timezone import utc
from django.contrib.auth.models import User
from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from django.core.cache import cache
from django_countries import CountryField
from taggit.managers import TaggableManager
from paintstore.fields import ColorPickerField
from datetime import *
from futures.validators import *
import random


class Base(Model):
    """
    Base model for all of the models in ff.
    """
    class Meta:
            abstract = True

    created = DateTimeField(auto_now_add=True, editable=False)
    updated = DateTimeField(auto_now=True, editable=False)
    is_active = BooleanField(default=1)

    def __unicode__(self):
        if hasattr(self, "title") and self.title:
            return self.title
        else:
            return "%s" % (type(self))


class UserProfile(Base):
    user = OneToOneField(User)
    display_name = CharField(max_length=50)
    city = CharField(max_length=100, blank=True, null=True)
    state = CharField(max_length=255, blank=True, null=True)
    country = CountryField(blank=True, null=True)
    number = CharField(max_length=30, blank=True, null=True)
    country_code = CharField(max_length=10, blank=True, null=True)
    slug = SlugField()


class MapSetting(Base):

    BASEMAP_CHOICES = (
        ('dymaxion', 'Dymaxion'),
        ('openstreetmap', 'OpenStreetMap'),
        ('googlemaps', 'GoogleMaps'),
    )

    title = CharField(
        max_length=100,
        blank=True,
        null=True
    )
    basemap = CharField(
        max_length=20,
        choices=BASEMAP_CHOICES,
        default='dymaxion',
        blank=False,
        null=False,
    )
    initial_bounds = PolygonField(
        'Map Region',
        blank=True,
        null=True,
        help_text='The region specified here will be '
        'the default view for this project.'
    )
    zoom_enabled = BooleanField(
        default=True
    )
    mapdisplay_fill_color = ColorPickerField(
        'Map Graphic Fill Color',
        default='#000000',
        blank=True,
        help_text='The hex value (eg #00FF00 for green)'
    )
    mapdisplay_fill_opacity = FloatField(
        'Map Graphic Fill Opacity',
        default=1.0,
        blank=True,
        help_text='Numeric value between 0 and 1'
    )
    mapdisplay_stroke_color = ColorPickerField(
        'Map Graphic Stroke Color',
        default='#000000',
        blank=True,
        help_text='The hex value (eg #00FF00 for green)'
    )
    mapdisplay_stroke_opacity = FloatField(
        'Map Graphic Stroke Opacity',
        default=1.0,
        blank=True,
        help_text='Numeric value between 0 and 1'
    )
    mapdisplay_point_radius = IntegerField(
        'Map Point Radius',
        max_length=3,
        default=2,
        blank=True,
        help_text='The radius of a point on the map'
    )
    mapdisplay_size = IntegerField(
        'Map Graphic Size',
        default=8,
        blank=True,
        null=True,
        help_text='In pixels'
    )


class Collection(Base):
    title = CharField(max_length=100, blank=False, null=True)
    slug = SlugField(max_length=120, blank=False, null=False)
    description = TextField(blank=True, null=True)
    map_setting = ForeignKey(MapSetting, blank=True, null=True)


class GeoSound(Base):
    class Meta:
        verbose_name_plural = "geosounds"

    def random_z():
        return round(random.uniform(-12.0, 12.0), 2)

    def random_default_volume():
        return round(random.uniform(0.2, 0.8), 2)

    sound = FileField(upload_to="uploads", max_length=150)
    title = CharField(max_length=100, blank=True, null=True)
    location = CharField(max_length=150, blank=True, null=True)
    story = TextField(blank=True, null=True)
    created_by = CharField(max_length=100, blank=False, null=True)
    user = ForeignKey(User, blank=True, null=True)
    slug = SlugField(max_length=100)
    point = PointField()
    z = FloatField(default=random_z)
    default_volume = FloatField(default=random_default_volume)
    collections = ManyToManyField(Collection, related_name="collections")
    tags = TaggableManager()

    objects = GeoManager()

    def is_recent():
        def fget(self):
            now = datetime.utcnow().replace(tzinfo=utc)
            week_ago = now - timedelta(days=7)
            return self.created > week_ago
        return locals()

    def just_added():
        def fget(self):
            now = datetime.utcnow().replace(tzinfo=utc)
            minute_ago = now - timedelta(seconds=60)
            return self.created > minute_ago
        return locals()

    is_recent = property(**is_recent())
    just_added = property(**just_added())

    def save_upload(self, filename, lat, lon, tags, *args, **kwargs):
        from django.contrib.gis.geos import Point

        "save geosound after ajax uploading an mp3 file"

        # store point from coordinates
        self.point = Point(lon, lat, srid=4326)

        # try finding an existing user by the "created_by" field
        try:
            self.user = User.objects.get(username=self.created_by)
        except User.DoesNotExist:
            pass

        # create a title for the sound
        self.title = "recorded in %s by %s" % (self.location, self.created_by)

        # save sound
        self.sound = filename

        # save model
        super(GeoSound, self).save(*args, **kwargs)

        # save tags to sound
        for t in tags:
            self.tags.add(t)

        # connect the sound to the v3 collection
        v3_collection, created = Collection.objects.get_or_create(
            title='fantastic futures v3',
            defaults={'title': 'fantastic futures v3'}
        )
        self.collections.add(v3_collection)

        # return the newly created model
        return self

    def __unicode__(self):
        return self.title

    def get_tags(self):
        return ",".join([tag.name for tag in self.tags.all()])


@receiver(pre_delete, sender=GeoSound)
@receiver(post_save, sender=GeoSound)
def invalidate_json_sounds(sender, **kwargs):
    cache.delete('json_sounds')


class Connection(Base):

    sound_1 = ForeignKey(GeoSound, related_name="sound_1")
    sound_1_volume = FloatField(default=0.8)
    sound_2 = ForeignKey(GeoSound, related_name="sound_2")
    sound_2_volume = FloatField(default=0.8)

    def __unicode__(self):
        return "%s - %s" % (self.sound_1.title, self.sound_2.title)


class Constellation(Base):
    class Meta:
        verbose_name_plural = "constellations"

    title = CharField(max_length=100, blank=False, null=False)
    created_by = CharField(max_length=100, blank=False, null=True)
    location = CharField(max_length=150, blank=True, null=True)
    user = ForeignKey(User, blank=True, null=True)
    slug = SlugField()
    connections = ManyToManyField(Connection, related_name="connections")
    rotation_x = FloatField(default=0)
    rotation_y = FloatField(default=0)
    rotation_z = FloatField(default=0)
    zoom = FloatField(default=1.0)

    def __unicode__(self):
        return self.title

    def save_ajax(self, rotation, *args, **kwargs):

        # try finding an existing user by the "created_by" field
        try:
            self.user = User.objects.get(username=self.created_by)
        except User.DoesNotExist:
            pass

        # rotation
        self.rotation_x = rotation['x']
        self.rotation_y = rotation['y']
        self.rotation_z = rotation['z']

        # save model
        super(Constellation, self).save(*args, **kwargs)

        # return the newly created model
        return self


@receiver(pre_delete, sender=Constellation)
@receiver(post_save, sender=Constellation)
def invalidate_json_constellations(sender, **kwargs):
    cache.delete('json_constellations')
