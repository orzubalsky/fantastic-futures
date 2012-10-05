from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.core import serializers
from django.core.cache import cache
from django.forms.formsets import formset_factory
from django.conf import settings
from futures.models import *
from futures.forms import *
from django.template.defaultfilters import slugify
from django.utils import simplejson as json
from django.utils.safestring import mark_safe
from futures.ajax_uploader import AjaxFileUploader
from datetime import *


def index(request):
    layers = {}
    layers["sounds"] = { 'title': "sounds", 'url': reverse('sound-layer'),}
    layer_json = json.dumps(layers)
    
    constellations      = Constellation.objects.all()
    constellations_json = constellations_to_json(constellations)
    feedback_form       = FeedbackForm()
    add_sound_form      = GeoSoundForm()
    constellation_form  = ConstellationForm()
    search_form         = GeoSearchForm()

    return render_to_response(
        'index.html', { 
            'layers'                : layer_json,
            'feedback_form'         : feedback_form,
            'add_sound_form'        : add_sound_form,
            'constellation_form'    : constellation_form,
            'search_form'           : search_form,
            'google_api_key'        : settings.GOOGLE_API_KEY,
            'constellations'        : constellations,
            'constellations_json'   : constellations_json,
        }, context_instance=RequestContext(request))

def view_sound(request, sound_slug):
    pass

def sound_layer(request):
    
    # count just added sounds, in order to determine how long to cache for later
    sounds = GeoSound.objects.all()
    just_added = 0
    for s in sounds:
        if s.just_added:
            just_added += 1
    
    # if the cache is cleared, or if a sound was just added, clear the cache
    if cache.get('json_sounds') == None: 
        geo_json = serialize_sound_layer()
        if just_added > 0:
            # only cache for 60 seconds, so the just_added property isn't stuck
            cache.set('json_sounds', geo_json, 60)
        else:
            cache.set('json_sounds', geo_json, 60*60*24*7)
    else:
        geo_json = cache.get('json_sounds')
    return HttpResponse(geo_json, content_type='application/json', status=200)
    
def serialize_sound_layer():
    sounds = GeoSound.objects.all().order_by('created')

    results = []
    for sound in list(sounds):
        data = sound_to_json(sound)
        results.append(data)
              
    result_data = {
        'type':'FeatureCollection',
        'features': results,
    }
    geo_json = mark_safe(json.dumps(result_data))    
    
    return geo_json

def sound_to_json(sound_object):
    data = {
        "type"              : "Feature", 
        "geometry"          : json.loads(sound_object.point.json),
        "properties"        : { 
            "id"        : sound_object.id,
            "title"     : sound_object.title,
            "created_by": sound_object.created_by,
            "location"  : sound_object.location,
            "story"     : sound_object.story,
            "filename"  : sound_object.sound.name,
            "volume"    : sound_object.default_volume,
            "z"         : sound_object.z,
            "is_recent" : sound_object.is_recent,
            "just_added": sound_object.just_added
        }
    }
    
    return data
    
def constellations_to_json(constellation_queryset):
    if cache.get('json_constellations') == None:
        constellations_json = serializers.serialize('json', constellation_queryset, indent=4, 
            excludes=('updated', 'created', 'is_active', 'user'), 
            relations= {
                'connections': 
                    {'fields': ('sound_1','sound_2','sound_1_volume','sound_2_volume') }
                }
        )
        cache.set('json_constellations', constellations_json, 60*60*24*7)
    else:
        constellations_json = cache.get('json_constellations')

    return constellations_json  

def start(request):
    csrf_token = get_token(request)
    return render_to_response('import.html', {'csrf_token': csrf_token}, context_instance = RequestContext(request))

import_uploader = AjaxFileUploader()