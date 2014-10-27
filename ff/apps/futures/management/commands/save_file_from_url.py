import urllib2
from optparse import make_option
from django.core.management.base import BaseCommand
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from django.core.cache import cache
from futures.models import GeoSound


class Command(BaseCommand):
    help = ''

    option_list = BaseCommand.option_list + (
        make_option(
            '--object_pk',
            #action='store_true',
            help='GeoSound primary key'
        ),
        make_option(
            '--url',
            #action='store_true',
            help='URL of file to download'
        ),
    )

    def handle(self, *args, **kwargs):
        """
        """
        print kwargs.get('url')
        print kwargs.get('object_pk')

        if kwargs.get('url') and kwargs.get('object_pk'):

            geosound = GeoSound.objects.get(pk=kwargs.get('object_pk'))
            print geosound.sound

            url = kwargs.get('url')

            file_temp = NamedTemporaryFile(delete=True)
            file_temp.write(urllib2.urlopen(url).read())
            file_temp.flush()

            print file_temp

            filename = "%s.mp3" % geosound.slug
            print filename

        geosound.sound.save(filename, File(file_temp))
        geosound.save()
        print geosound.sound

        cache.clear()
