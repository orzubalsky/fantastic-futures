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