from django.conf import settings
from django.contrib.gis.db.models import *
from django.utils.timezone import utc
from django.contrib.auth.models import User
from django_countries import CountryField
from taggit.managers import TaggableManager
from datetime import *
import os, sys, pytz, uuid, random

class Base(Model):
    """
    Base model for all of the models in ts.  
    """
    class Meta:
            abstract = True
                    
    created     = DateTimeField(auto_now_add=True, editable=False)
    updated     = DateTimeField(auto_now=True, editable=False)
    is_active   = BooleanField(default=1)        
        
    def __unicode__ (self):
        if hasattr(self, "title") and self.title:
            return self.title
        else:
            return "%s" % (type(self))
            
class UserProfile(Base):
    user                = OneToOneField(User)
    display_name        = CharField(max_length=50)
    city                = CharField(max_length=100, blank=True, null=True)
    state               = CharField(max_length=255, blank=True, null=True)
    country             = CountryField(blank=True, null=True)
    number              = CharField(max_length=30, blank=True, null=True)
    country_code        = CharField(max_length=10, blank=True, null=True)
    slug                = SlugField()    

class GeoSound(Base):
                  
    sound               = FileField(db_column="filename", upload_to="uploads", max_length=150)
    title               = CharField(max_length=100, blank=True, null=True)
    location            = CharField(max_length=150, blank=False, null=True)
    story               = TextField(blank=True, null=True)
    created_by          = CharField(max_length=100, blank=False, null=True)    
    user                = ForeignKey(User, blank=True, null=True)
    slug                = SlugField(max_length=100)    
    point               = PointField()
    tags                = TaggableManager()    
    
    objects = GeoManager()
    
    def save_upload(self, filename, *args, **kwargs):
        from django.core.files.base import ContentFile        	
        from django.conf import settings
        from django.core.files import File
        from django.core.files.storage import default_storage as storage
        

        path = settings.MEDIA_ROOT + '/uploads/' + filename
        f = open(path, 'w')
        myfile = File(f)
                
        #file_content = ContentFile(myfile.read())
        self.filename.save(filename, myfile)
        
        if storage.exists(filename):
            storage.delete(filename)
        
        super(Sound, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.title
        
    def get_tags(self):
        return ",".join([tag.name for tag in self.tags.all()])        