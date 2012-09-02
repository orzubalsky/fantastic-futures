from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.forms.formsets import formset_factory
from django.conf import settings
from futures.models import *
from futures.forms import *
from django.template.defaultfilters import slugify
from django.utils import simplejson as json
from django.utils.safestring import mark_safe
from ajaxuploader.views import AjaxFileUploader



def index(request):
    layers = {}
    layers["sounds"] = {  
           'title': "sounds",
           'url': reverse('sound-layer'),
           # 'style_shape': art.type.mapdisplay_graphic_type,
           # 'style_fill_color': art.type.mapdisplay_fill_color,
           # 'style_fill_opacity': art.type.mapdisplay_fill_opacity, 
           # 'style_stroke_color': art.type.mapdisplay_stroke_color,
           # 'style_stroke_opacity': art.type.mapdisplay_stroke_opacity,
           # 'style_size': art.type.mapdisplay_size 
    }
    layer_json = json.dumps(layers)

    feedback_form   = FeedbackForm()
    add_sound_form  = GeoSoundForm()        

    return render_to_response(
        'index.html', { 
            'layers'        : layer_json,
            'feedback_form' : feedback_form,
            'add_sound_form': add_sound_form,
            'google_api_key': settings.GOOGLE_API_KEY
        }, context_instance=RequestContext(request))

def view_sound(request, sound_slug):
    pass

def sound_layer(request):
    sounds = GeoSound.objects.all().order_by('created')

    results = []
    for sound in list(sounds):
        data = object_to_json(sound)
        results.append(data)
              
    result_data = {
        'type':'FeatureCollection',
        'features': results,
    }
    geo_json = mark_safe(json.dumps(result_data))
  
    return HttpResponse(geo_json, content_type='application/json', status=200)
    
    
# called from w/in layer_view
def object_to_json(sound_object):
    if sound_object.point:
        point = json.loads(sound_object.point.json)
    else:
        point = ''
    data = {
        "type":"Feature", 
        "geometry": point,
        "properties": { "title": sound_object.title, "id": sound_object.id }
        }
    return data
    

def start(request):
    csrf_token = get_token(request)
    return render_to_response('import.html', {'csrf_token': csrf_token}, context_instance = RequestContext(request))

import_uploader = AjaxFileUploader()