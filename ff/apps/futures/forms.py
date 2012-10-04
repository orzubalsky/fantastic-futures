from django import forms
from haystack.forms import SearchForm
from haystack.utils.geo import Point, D
from django.forms.formsets import BaseFormSet
from django.utils.translation import ugettext as _
from django.core.validators import *
from futures.models import *

class GeoSearchForm(SearchForm):
    q = forms.CharField(required=False, widget=forms.widgets.TextInput(attrs={'placeholder':'SEARCH'}))
             
    def search(self):
        # First, store the SearchQuerySet received from other processing.
        sqs = super(GeoSearchForm, self).search()
        return sqs

class FeedbackForm(forms.Form):
    message     = forms.CharField(label="Please leave us any comments or questions.", widget=forms.Textarea)
    email       = forms.EmailField(label="Email (Optional)", required=False)


class GeoSoundForm(forms.ModelForm):
    class Meta: 
        model   = GeoSound
        fields  = ['created_by', 'location', 'story']
        widgets = {
            'created_by': forms.TextInput(attrs={'placeholder':'YOUR NAME'}),
            'location'  : forms.TextInput(attrs={'placeholder':'CITY, STATE, COUNTRY'}),            
            'story'     : forms.Textarea(attrs={'placeholder':'STORY ABOUT THIS SOUND (OPTIONAL)', 'class':'optional'}),
            }

    def __init__(self, *args, **kwargs):
         "Sets custom meta data to the form's fields"
         super(forms.ModelForm, self).__init__(*args, **kwargs)
         self.fields['created_by'].error_messages['required'] = "please enter your name"

    filename    = forms.CharField(widget=forms.HiddenInput, error_messages={'required': 'Please upload an mp3 file'})
    lat         = forms.CharField(widget=forms.HiddenInput, error_messages={'required':'Please enter a valid address'})
    lon         = forms.CharField(widget=forms.HiddenInput, required=False)
    
class ConstellationForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
         "Sets custom meta data to the form's fields"
         super(forms.ModelForm, self).__init__(*args, **kwargs)
         self.fields['created_by'].error_messages['required'] = "please enter your name"
         self.fields['title'].error_messages['required'] = "please name your constellation"
         
    class Meta:
        model   = Constellation
        fields  = ['title', 'created_by', 'location', 'zoom']
        widgets = {
            'title'     : forms.TextInput(attrs={'placeholder':'NAME YOUR CONSTELLATION',}),
            'created_by': forms.TextInput(attrs={'placeholder':'YOUR NAME'}),
            'location'  : forms.TextInput(attrs={'placeholder':'CITY, STATE, COUNTRY (OPTIONAL)', 'class':'optional'}),           
            'zoom'      : forms.HiddenInput(),             
            }
    connection_count = forms.CharField(widget=forms.HiddenInput, error_messages={'required':'Please connect sounds before saving'})
             