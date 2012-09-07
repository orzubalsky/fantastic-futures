from dajaxice.decorators import dajaxice_register
from dajaxice.utils import deserialize_form
from django.utils import simplejson as json
from django.utils.safestring import mark_safe
from futures.forms import *
from futures.views import object_to_json

@dajaxice_register(method='POST')
def submit_feedback(request, form):
    
    feedback_form = FeedbackForm(deserialize_form(form))
        
    if feedback_form.is_valid():
        # Use mail_admin or something to send off the data like you normally would.
        
        return json.dumps({'success':True})
    return json.dumps({'success':False, 'errors': feedback_form.errors})
    
    
@dajaxice_register(method='POST')
def submit_sound(request, form):
    add_sound_form = GeoSoundForm(deserialize_form(form))
    if add_sound_form.is_valid():
        validForm = add_sound_form.save(commit=False)
        uploaded_file = add_sound_form.cleaned_data.get('filename')
        lat = add_sound_form.cleaned_data.get('lat')
        lon = add_sound_form.cleaned_data.get('lon')
        new_sound = validForm.save_upload(uploaded_file, float(lat), float(lon))
        
        result_data = { 'type':'FeatureCollection', 'features': object_to_json(new_sound)}
        geo_json = mark_safe(json.dumps(result_data))        
        
        return json.dumps({'success':True, 'geojson':geo_json})
    return json.dumps({'success':False, 'errors': add_sound_form.errors})
    
@dajaxice_register(method='POST')
def submit_constellation(request, form, connections, rotation):
    constellation_form = ConstellationForm(deserialize_form(form))
    
    if constellation_form.is_valid():
        validForm = constellation_form.save(commit=False)        
        new_constellation = validForm.save_ajax(rotation)
        
        for c in connections:
            sound_1 = GeoSound.objects.get(pk=int(c['sound_1']))
            sound_2 = GeoSound.objects.get(pk=int(c['sound_2']))
            
            # try finding an existing connection
            try:
                connection = Connection.objects.get(sound_1=sound_1, sound_2=sound_2)
            except Connection.DoesNotExist:
                connection = Connection(sound_1=sound_1, sound_2=sound_2)        
                connection.save()
            
            new_constellation.connections.add(connection)
        
        return json.dumps({'success':True})
    return json.dumps({'success':False, 'errors': constellation_form.errors})