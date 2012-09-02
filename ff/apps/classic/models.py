from django.db.models import *
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.template.defaultfilters import slugify
from django.contrib.auth.models import User as DjangoUser
from django.contrib.auth.hashers import make_password
from futures.models import *

class MigrationBase(Model):
    class Meta:
        abstract = True
    #processed = NullBooleanField(default=0)

class UserManager(Manager):
    def migrate(self, data):
        if not DjangoUser.objects.filter(username=data['username']).exists():
            # create django user from old user
            password = make_password(data['username'] + '123!')
            user = DjangoUser.objects.create_user(data['username'], data['email'], password)        
        
            import pytz
            created = pytz.timezone('America/New_York').localize(data['created'], is_dst=None)                
            user.date_joined = created

            user.is_staff = False
            user.save()
        
            # create v3 user profile from old user 
            slug = slugify(data['display_name'])        
            profile = UserProfile(pk=data['id'], user=user, display_name=data['display_name'], city=data['city'], state=data['state'], country=data['country'], number=data['number'], country_code=data['country_code'], slug=slug)
            profile.save()

class User(MigrationBase):
    username        = CharField(max_length=180)
    email           = EmailField(max_length=300)
    password        = CharField(max_length=765)
    hashcode        = CharField(db_column="hash", max_length=96, blank=True)
    status          = IntegerField()
    created         = DateTimeField()
    role            = IntegerField()
    display_name    = CharField(max_length=765, blank=True)
    city            = CharField(max_length=765, blank=True)
    state           = CharField(max_length=765, blank=True)
    country         = CharField(max_length=765, blank=True)
    number          = CharField(max_length=90, blank=True)
    country_code    = CharField(max_length=30, blank=True)
    slug            = SlugField(max_length=765, blank=True)
    
    objects = UserManager()
    
    class Meta:
        db_table = u'users'


class Comment(MigrationBase):
    author          = ForeignKey(User, db_column="user_id")
    parent_id       = PositiveIntegerField()
    content_object  = generic.GenericForeignKey('parent_type', 'parent_id')    
    content         = TextField()
    created         = DateTimeField()
    parent_type     = ForeignKey(ContentType)
    class Meta:
        db_table = u'comments'

class Loop(MigrationBase):
    title           = CharField(max_length=150)
    author          = ForeignKey(User, db_column="user_id")
    loop_map        = TextField(db_column="map")
    status          = IntegerField()
    created         = DateTimeField(db_column="timestamp")
    length          = IntegerField()
    looping         = IntegerField()
    description     = TextField(blank=True)
    slug            = SlugField(max_length=765, blank=True)
    class Meta:
        db_table = u'loops'

class LoopsXSounds(MigrationBase):
    loop_id         = IntegerField()
    sound_id        = IntegerField()
    class Meta:
        db_table = u'loops_x_sounds'

class Noun(MigrationBase):
    title           = CharField(max_length=765)
    filename        = CharField(max_length=765)
    author          = CharField(max_length=765, blank=True)
    attribution     = IntegerField()
    created         = DateTimeField()
    class Meta:
        db_table = u'nouns'

class SoundManager(Manager):
    def migrate(self, data):
        "create geosound from v2 sound"
        
        # generate slug
        slug = slugify(data['title'])
        
        # get user
        ff_v2_user = User.objects.using('classic').get(pk=int(data['author_id']))
        user = DjangoUser.objects.using('default').get(username=ff_v2_user.username)
        
        # get created date
        import pytz
        created = pytz.timezone('America/New_York').localize(data['created'], is_dst=None)                
        
        # generate point from location
        from django.contrib.gis.geos import Point
        from googlemaps import GoogleMaps
        gmaps = GoogleMaps(settings.GOOGLE_API_KEY)
        try:
            lat, lng = gmaps.address_to_latlng(data['location'])
            point = Point(lng, lat, srid=4326)

            # save geosound
            geosound = GeoSound(sound=data['filename'], title=data['title'], location=data['location'], story=data['story'], created_by=user.username, user=user, slug=slug, point=point, created=created)
            geosound.save()

            # get tags
            tags = []
            if SoundsXTags.objects.using('classic').filter(sound_id=int(data['id'])).exists():
                tag_old_join_rows = SoundsXTags.objects.using('classic').filter(sound_id=int(data['id']))
                for tag_old_join_row in tag_old_join_rows:
                    tag = Tag.objects.using('classic').get(pk=tag_old_join_row.tag_id)
                    geosound.tags.add(tag.title)
        except:
            pass

class Sound(MigrationBase):
    filename        = CharField(max_length=150)
    title           = CharField(max_length=150)
    location        = CharField(max_length=150)
    story           = TextField()
    created         = DateTimeField(db_column="timestamp")
    status          = IntegerField()
    author          = ForeignKey(User, db_column="user_id")
    length          = IntegerField()
    filename_original = CharField(max_length=765)
    noun            = ForeignKey(Noun, db_column="noun_id")
    sound_type      = IntegerField(db_column="type")
    twilio_status   = IntegerField()
    slug            = SlugField(max_length=765, blank=True)
    
    objects = SoundManager()
    
    class Meta:
        db_table = u'sounds'

class SoundsXTags(MigrationBase):
    sound_id        = IntegerField()
    tag_id          = IntegerField()
    class Meta:
        db_table = u'sounds_x_tags'

class Tag(MigrationBase):
    title           = CharField(max_length=150)
    status          = IntegerField()
    slug            = SlugField(max_length=765, blank=True)
    class Meta:
        db_table = u'tags'
