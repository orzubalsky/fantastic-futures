import urllib2
from django.core.management.base import BaseCommand
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from futures.models import GeoSound


class Command(BaseCommand):
    help = ''

    def handle(self, *args, **kwargs):
        """
        """
        if kwargs.get('url') and kwargs.get('object_pk'):

            geosound = GeoSound.objects.get(pk=kwargs.get('object_pk'))

            url = kwargs.get('url')

            file_temp = NamedTemporaryFile(delete=True)
            file_temp.write(urllib2.urlopen(url).read())
            file_temp.flush()

            filename = "%s.mp3" % geosound.slug

        geosound.sound.save(filename, File(file_temp))
