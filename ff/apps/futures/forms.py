from django import forms
from django.forms.formsets import BaseFormSet
from django.utils.translation import ugettext as _
from futures.models import *

class FeedbackForm(forms.Form):
    message     = forms.CharField(label="Please leave us any comments or questions.", widget=forms.Textarea)
    email       = forms.EmailField(label="Email (Optional)", required=False)
