from django import forms
from django.forms.formsets import BaseFormSet
from django.utils.translation import ugettext as _
from futures.models import *

class FeedbackForm(forms.Form):
    message     = forms.CharField(label="Please leave us any comments or questions.", widget=forms.Textarea)
    email       = forms.EmailField(label="Email (Optional)", required=False)


class GeoSoundForm(forms.ModelForm):
    class Meta: 
        model = GeoSound
        fields = ['created_by', 'location', 'story']
        widgets = {
            'story'     : forms.Textarea(attrs={'class':'optional'}),
            }        
    filename    = forms.CharField(widget=forms.HiddenInput, error_messages={'required': 'Please upload an mp3 file'})