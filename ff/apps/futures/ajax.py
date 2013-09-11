from django.template.loader import render_to_string
from dajaxice.decorators import dajaxice_register
from dajaxice.utils import deserialize_form
from django.utils import simplejson as json
from django.utils.safestring import mark_safe
from django.core.mail import send_mail
from haystack.query import SearchQuerySet
from futures.forms import *
from futures.views import sound_to_json, constellations_to_json


@dajaxice_register(method='POST')
def autocomplete(request, q):
    search_results = SearchQuerySet().auto_query(q)

    results = {'Geosounds': [], 'Constellations': []}

    for search_result in search_results:
        data = searchresult_to_json(search_result)
        results[data["type"]].append(data)

    return json.dumps({'success': True, 'results': results})


def searchresult_to_json(search_result):
    data = {
        "type": search_result.verbose_name_plural,
        "id": search_result.pk,
        "score": search_result.score,
    }
    return data


@dajaxice_register(method='POST')
def submit_feedback(request, form):

    feedback_form = FeedbackForm(deserialize_form(form))

    if feedback_form.is_valid():
        message = "from: %s \n message: %s" % (
            feedback_form.cleaned_data.get('email'),
            feedback_form.cleaned_data.get('message')
        )
        send_mail(
            'FF | Feedback Receieved!',
            message,
            'noreply@fantasticfutures.fm',
            ('youngestforever@gmail.com',)
        )

        return json.dumps({'success': True})
    return json.dumps({'success': False, 'errors': feedback_form.errors})


@dajaxice_register(method='GET')
def submit_sound(request, form, tags, collection_slug=None):
    add_sound_form = GeoSoundForm(deserialize_form(form))
    if add_sound_form.is_valid():
        validForm = add_sound_form.save(commit=False)
        uploaded_file = add_sound_form.cleaned_data.get('filename')
        lat = add_sound_form.cleaned_data.get('lat')
        lon = add_sound_form.cleaned_data.get('lon')

        new_sound = validForm.save_upload(
            uploaded_file,
            float(lat),
            float(lon),
            tags,
            collection_slug
        )

        result_data = {
            'type': 'FeatureCollection',
            'features': sound_to_json(new_sound)
        }
        geo_json = mark_safe(json.dumps(result_data))

        return json.dumps({'success': True, 'geojson': geo_json})
    return json.dumps({'success': False, 'errors': add_sound_form.errors})


@dajaxice_register(method='GET')
def submit_constellation(request, form, connections, rotation):
    constellation_form = ConstellationForm(deserialize_form(form))

    if constellation_form.is_valid():
        validForm = constellation_form.save(commit=False)
        new_constellation = validForm.save_ajax(rotation)

        for c in connections:
            sound_1 = GeoSound.objects.get(pk=int(c['sound_1']))
            sound_2 = GeoSound.objects.get(pk=int(c['sound_2']))
            sound_1_volume = float(c['sound_1_volume'])
            sound_2_volume = float(c['sound_2_volume'])

            # try finding an existing connection
            connection, created = Connection.objects.get_or_create(
                sound_1=sound_1,
                sound_1_volume=sound_1_volume,
                sound_2=sound_2,
                sound_2_volume=sound_2_volume
            )
            new_constellation.connections.add(connection)

        constellations = Constellation.objects.all()
        constellations_json = constellations_to_json(constellations)
        html = render_to_string("constellations.html", {
            'constellations': constellations,
            'constellations_json': constellations_json}
        )

        
        return json.dumps({'success':True, 'constellations':html})
    return json.dumps({'success':False, 'errors': constellation_form.errors})