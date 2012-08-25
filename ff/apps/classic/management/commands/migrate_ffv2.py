from django.core.management.base import BaseCommand, CommandError
from classic.models import *

def migrate(handle, model): 
    "migrate a model from ff v2 classic noun site into v3 django site"  
    
    handle.stdout.write('\n\nstarting migration of %s \n\n' % model.__str__)
     
    # iterate over selected rows
    queryset = model.objects.using('classic').all()
    for old_db_model in queryset:
        # get fields and values for each db row
        data = {k: v for k,v in old_db_model.__dict__.items()}

        # call the appropriate function, according to the rules dictionary
        model.objects.migrate(data)
        handle.stdout.write('migrated %s: [%i] \n' % (old_db_model.__str__, data['id']))
                
    #queryset.update(processed=True)
    
class Command(BaseCommand): 
    help = 'migrate the db from ff v2 to the new django based site'
        
    def handle(self, *args, **options): 
       migrate(self, User)
       migrate(self, Sound)


