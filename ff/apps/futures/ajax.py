from django.utils import simplejson as json
from dajaxice.decorators import dajaxice_register
from dajaxice.utils import deserialize_form
from futures.forms import *

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
        validForm.save_upload(uploaded_file, add_sound_form.cleaned_data.get('lat'), add_sound_form.cleaned_data.get('lon'))
        return json.dumps({'success':True})
    return json.dumps({'success':False, 'errors': add_sound_form.errors})