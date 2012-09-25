from django.contrib.auth.models import User
from tastypie import fields as tp_fields
from tastypie.resources import ModelResource
from tastypie.cache import SimpleCache
from tastypie.validation import FormValidation
from futures.models import *
from futures.forms import *


class UserProfileResource(ModelResource):
    class Meta:
        queryset        = UserProfile.objects.all()
        resource_name   = 'userprofile'
        excludes        = ['slug', 'country_code', 'number', 'country', 'state', 'city']
        allowed_methods = ['get']
        


class UserResource(ModelResource):
    class Meta:
        queryset        = User.objects.all()
        resource_name   = 'user'
        excludes        = ['email', 'password', 'is_active', 'is_staff', 'is_superuser']
        allowed_methods = ['get']

    profile = tp_fields.ForeignKey(UserProfileResource, 'profile', full=True)


class GeoSoundResource(ModelResource):
    class Meta:
        queryset        = GeoSound.objects.all()
        resource_name   = 'geosound'
        allowed_methods = ['get']
        form            = FormValidation(form_class=GeoSoundForm)
        


class ConnectionResource(ModelResource):
    class Meta:
        queryset        = Connection.objects.all()
        resource_name   = 'connection'
        allowed_methods = ['get']

    sound_1 = tp_fields.ForeignKey(GeoSoundResource, 'sound_1', full=True)
    sound_2 = tp_fields.ForeignKey(GeoSoundResource, 'sound_2', full=True)


class ConstellationResource(ModelResource):
    class Meta:
        queryset        = Constellation.objects.all()
        resource_name   = 'constellation'
        allowed_methods = ['get']
        form            = FormValidation(form_class=ConstellationForm)
    
    connections = tp_fields.ManyToManyField(ConnectionResource, 'connections', full=True)
