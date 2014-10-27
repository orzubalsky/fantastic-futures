from django.shortcuts import get_object_or_404
from twilio.twiml import Response
from django_twilio.decorators import twilio_view
from django.core.urlresolvers import reverse
from voicemail.models import VoicemailBox


@twilio_view
def answer(request, slug=None, location=None):

    r = Response()
    r.say(
        "Thanks for calling Fantastic Futures, "
        "You are about to record a wonderful sound, "
        "Once you are done, please hang up so your recording "
        "can start its journey to the website."
    )

    action = reverse(
        'handle-recording',
        kwargs={
            'slug': slug,
            'location': location
        }
    )

    r.record(action=action, timeout=20, maxLength=360, playBeep=True)

    return r


@twilio_view
def handle_recording(request, slug=None, location=None):

    r = Response()

    voicemailbox = get_object_or_404(VoicemailBox, slug=slug)

    voicemailbox.collection.add_voicemail(
        audio_url=request.POST.get('RecordingUrl'),
        title='recorded in %s for %s' % (location, voicemailbox.target_location),
        location=voicemailbox.target_location,
    )

    return r
