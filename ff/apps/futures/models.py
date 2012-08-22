from django.conf import settings
from django.contrib.gis.db import models 
from django.utils.timezone import utc
from django_countries import CountryField
from datetime import *
import os, sys, pytz, uuid, random

class Author(models.Model):
    class Meta:
        db_table = u'users'
        
    username            = models.CharField(max_length=60)
    email               = models.EmailField() 
    password            = models.CharField(max_length=255)
    hash32              = models.CharField(db_column="hash", max_length=32, blank=True)
    status              = models.SmallIntegerField()
    created_on          = models.DateTimeField(db_column="created", auto_now_add=True, editable=False)    
    role                = models.SmallIntegerField()
    display_name        = models.CharField(max_length=255, blank=True)
    city                = models.CharField(max_length=255, blank=True)
    state               = models.CharField(max_length=255, blank=True)
    country             = CountryField()
    number              = models.CharField(max_length=30, blank=True)
    country_code        = models.CharField(max_length=10, blank=True)
    slug                = models.SlugField(max_length=255)
    

class Sound(models.Model):
    class Meta:
        db_table = u'sounds'

    def filename (self, filename):
        return 'uploads/%i/%s' % (user.id, filename)        
            
    filename            = models.FileField(db_column="filename", upload_to=filename, max_length=150)
    title               = models.CharField(max_length=150, blank=False, null=True)
    location            = models.CharField(max_length=150, blank=False, null=True)
    story               = models.TextField(blank=True, null=True)
    created_on          = models.DateTimeField(db_column="timestamp", auto_now_add=True, editable=False)    
    status              = models.IntegerField(default=1)
    user_id             = models.IntegerField(blank=True, null=True, db_column="user_id")
    length              = models.IntegerField(blank=True)
    noun_id             = models.IntegerField(blank=True)
    sound_type          = models.IntegerField(db_column="type", blank=True)
    twilio_status       = models.IntegerField(blank=True)
    slug                = models.SlugField(max_length=765)    
    point               = models.PointField(null=True, blank=True)
    created_by          = models.CharField(max_length=60, blank=False, null=True, default="")
    is_active           = models.BooleanField(default=1, verbose_name="Active")
    
    objects = models.GeoManager()
    
    def __unicode__(self):
        return self.title 