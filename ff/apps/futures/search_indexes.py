from haystack import indexes
from futures.models import *

class GeoSoundIndex(indexes.RealTimeSearchIndex, indexes.Indexable):
    text       = indexes.CharField(document=True, use_template=True)
    created_by = indexes.CharField(model_attr='created_by')
    created_on = indexes.DateTimeField(model_attr='created')

    def get_model(self):
        return GeoSound
     
class ConstellationIndex(indexes.RealTimeSearchIndex, indexes.Indexable):
    text       = indexes.CharField(document=True, use_template=True)
    created_by = indexes.CharField(model_attr='created_by')
    created_on = indexes.DateTimeField(model_attr='created')

    def get_model(self):
      return Constellation

class UserProfileIndex(indexes.RealTimeSearchIndex, indexes.Indexable):
    text       = indexes.CharField(document=True, use_template=True)

    def get_model(self):
      return UserProfile
