from django import forms
from django.forms.formsets import BaseFormSet
from django.utils.translation import ugettext as _
from futures.models import *

class FeedbackForm(forms.Form):
    message     = forms.CharField(label="Please leave us any comments or questions.", widget=forms.Textarea)
    email       = forms.EmailField(label="Email (Optional)", required=False)


class GeoSoundForm(forms.ModelForm):
    class Meta: 
        model   = GeoSound
        fields  = ['created_by', 'location', 'story']
        widgets = {
            'created_by': forms.TextInput(attrs={'placeholder':'YOUR NAME'}),
            'location': forms.TextInput(attrs={'placeholder':'CITY, STATE, COUNTRY'}),            
            'story'     : forms.Textarea(attrs={'placeholder':'STORY ABOUT THIS SOUND (OPTIONAL)', 'class':'optional'}),
            }

    def __init__(self, *args, **kwargs):
         "Sets custom meta data to the form's fields"
         super(forms.ModelForm, self).__init__(*args, **kwargs)
         self.fields['created_by'].error_messages['required'] = "please enter your name"

    filename    = forms.CharField(widget=forms.HiddenInput, error_messages={'required': 'Please upload an mp3 file'})
    lat         = forms.CharField(error_messages={'required':'Please enter a valid address'})
    lon         = forms.CharField(required=False)
    
class ConstellationForm(forms.ModelForm):
    class Meta:
        model   = Constellation
        fields  = ['title', 'created_by', 'location']
        widgets = {
            'title'     : forms.TextInput(attrs={'placeholder':'NAME YOUR CONSTELLATION'}),        
            'created_by': forms.TextInput(attrs={'placeholder':'YOUR NAME'}),
            'location'  : forms.TextInput(attrs={'placeholder':'CITY, STATE, COUNTRY (OPTIONAL)', 'class':'optional'}),            
            }        