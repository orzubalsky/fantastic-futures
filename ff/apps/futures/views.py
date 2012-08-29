from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.forms.formsets import formset_factory
from futures.models import *
from futures.forms import *
from django.template.defaultfilters import slugify
from django.utils import simplejson as json
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
    add_sound_form  = GeoSoundForm(initial={'created_by': 'YOUR NAME', 'location': 'CITY, STATE, COUNTRY', 'story': 'STORY ABOUT THIS SOUND (OPTIONAL)'})

    return render_to_response(
        'index.html', { 
            'layers'        : layer_json,
            'feedback_form' : feedback_form,
            'add_sound_form': add_sound_form,
        }, context_instance=RequestContext(request))

def view_sound(request, sound_slug):
    pass

def sound_layer(request):
    sounds = GeoSound.objects.all()

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
    

def start(request):
    csrf_token = get_token(request)
    return render_to_response('import.html', {'csrf_token': csrf_token}, context_instance = RequestContext(request))

import_uploader = AjaxFileUploader()

def add_sound(request):    
    if request.method == 'POST':
        add_sound_form = GeoSoundForm(request.POST)
        print add_sound_form.errors
        if add_sound_form.is_valid():
            validForm = add_sound_form.save(commit=False)
            uploaded_file = add_sound_form.cleaned_data.get('filename')            
            print uploaded_file
            validForm.save_upload(uploaded_file)
    else:
        add_sound_form  = GeoSoundForm(initial={'created_by': 'YOUR NAME', 'location': 'CITY, STATE, COUNTRY', 'story': 'STORY ABOUT THIS SOUND (OPTIONAL)'})
    feedback_form   = FeedbackForm()        
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
    return render_to_response(
        'index.html', { 
            'layers'        : layer_json,
            'feedback_form' : feedback_form,
            'add_sound_form': add_sound_form,
        }, context_instance=RequestContext(request))