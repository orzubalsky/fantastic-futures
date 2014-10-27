# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'VoicemailBox.target_location'
        db.add_column(u'voicemail_voicemailbox', 'target_location',
                      self.gf('django.db.models.fields.CharField')(default='Strausburg, France', max_length=100),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'VoicemailBox.target_location'
        db.delete_column(u'voicemail_voicemailbox', 'target_location')


    models = {
        u'futures.collection': {
            'Meta': {'object_name': 'Collection'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'map_setting': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['futures.MapSetting']", 'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '120'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        u'futures.mapsetting': {
            'Meta': {'object_name': 'MapSetting'},
            'basemap': ('django.db.models.fields.CharField', [], {'default': "'dymaxion'", 'max_length': '20'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'initial_bounds': ('django.contrib.gis.db.models.fields.PolygonField', [], {'null': 'True', 'blank': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'mapdisplay_fill_color': ('paintstore.fields.ColorPickerField', [], {'default': "'#000000'", 'max_length': '7', 'blank': 'True'}),
            'mapdisplay_fill_opacity': ('django.db.models.fields.FloatField', [], {'default': '1.0', 'blank': 'True'}),
            'mapdisplay_point_radius': ('django.db.models.fields.IntegerField', [], {'default': '2', 'max_length': '3', 'blank': 'True'}),
            'mapdisplay_size': ('django.db.models.fields.IntegerField', [], {'default': '8', 'null': 'True', 'blank': 'True'}),
            'mapdisplay_stroke_color': ('paintstore.fields.ColorPickerField', [], {'default': "'#000000'", 'max_length': '7', 'blank': 'True'}),
            'mapdisplay_stroke_opacity': ('django.db.models.fields.FloatField', [], {'default': '1.0', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'zoom_enabled': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        u'voicemail.voicemailbox': {
            'Meta': {'object_name': 'VoicemailBox'},
            'collection': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['futures.Collection']"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'extension': ('django.db.models.fields.IntegerField', [], {'max_length': '3', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '120'}),
            'target_location': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            'updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['voicemail']