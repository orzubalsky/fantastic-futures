from django.shortcuts import get_object_or_404
from twilio.twiml import Response
from django_twilio.decorators import twilio_view
from django.core.urlresolvers import reverse
from voicemail.models import VoicemailBox


@twilio_view
def answer(request, slug=None, location=None):

    voicemailbox = get_object_or_404(VoicemailBox, slug=slug)

    r = Response()
    r.say('Thanks for calling Fantastic Futures!')

    action = reverse(
        'handle-recording',
        kwargs={
            'slug': voicemailbox.slug,
            'location': location
        }
    )

    r.record(action=action, timeout=20, maxLength=360, playBeep=True)

    return r


@twilio_view
def handle_recording(request, slug=None, location=None):

    r = Response()

    voicemailbox = get_object_or_404(VoicemailBox, slug=slug)

    for key in request.POST:
        value = request.POST[key]
        print key + ':' + value

    recording_data = {
        'recording_id': request.POST.get('RecordingSid'),
        'audio_url': request.POST.get('RecordingUrl'),
        'from': request.POST.get('From'),
        'duration': request.POST.get('RecordingDuration'),
    }
    print recording_data

    voicemailbox.collection.add_voicemail(
        audio_url=request.POST.get('RecordingUrl'),
        title='recorded in %s for %s' % (location, voicemailbox.target_location),
        location=voicemailbox.target_location,
    )

    return r
