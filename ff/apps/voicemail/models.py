from futures.models import *


class VoicemailBox(Base):
    title = CharField(max_length=100, blank=False, null=True)
    target_location = CharField(max_length=100, blank=False, null=False)
    slug = SlugField(max_length=120, blank=False, null=False)
    extension = IntegerField(max_length=3, blank=True, null=True)
    collection = ForeignKey(Collection)

    def __unicode__(self):
        return self.title
