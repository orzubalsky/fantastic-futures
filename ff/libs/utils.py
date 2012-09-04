from django.conf import settings
from googlemaps import GoogleMaps

def coords_from_address(address):
    gmaps = GoogleMaps(settings.GOOGLE_API_KEY)
    try:
        result = gmaps.geocode(value)
        lng, lat = result['Placemark'][0]['Point']['coordinates'][0:2]
        return (lat, lng)
    except:
        raise Exception("Address can't be parsed by google maps")