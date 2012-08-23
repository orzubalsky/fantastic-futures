from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.forms.formsets import formset_factory
from futures.models import *
from futures.forms import *
from django.template.defaultfilters import slugify
from django.utils import simplejson as json


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

    feedback_form = FeedbackForm()

    return render_to_response(
        'index.html', { 
            'layers'        : layer_json,
            'feedback_form' : feedback_form,
        }, context_instance=RequestContext(request))

def view_sound(request, sound_slug):
    pass

def add_sound(request):
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
    
    return render_to_response('add_sound.html', { 'layers': layer_json }, context_instance=RequestContext(request))

def sound_layer(request):
    sounds = Sound.objects.all()
    geo_json = ''
    crs = None # where should this come from?

    results = []

    for datum in list(sounds):
        if not datum.point:
            continue
        data = _datum_to_json(datum)
        results.append(data)
              
    result_data = {
        'type':'FeatureCollection',
        'features': results,
    }

    geo_json = json.dumps(result_data) 

    from django.utils.safestring import mark_safe
    mark_safe(geo_json)
  
    return HttpResponse(geo_json, content_type='application/json', status=200)
    
    
# called from w/in layer_view
def _datum_to_json(datum,thickness='thin'):
    if datum.point:
        thing = json.loads(datum.point.json)
    else:
        thing = ''
    data = {
        "type":"Feature", 
        "geometry": thing,
        "properties": { "title": datum.title,
                        "id": datum.id,
                        "thickness": thickness }
        }
    return data