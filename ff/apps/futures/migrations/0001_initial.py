# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Author'
        db.create_table(u'users', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('username', self.gf('django.db.models.fields.CharField')(max_length=60)),
            ('email', self.gf('django.db.models.fields.EmailField')(max_length=75)),
            ('password', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('hash32', self.gf('django.db.models.fields.CharField')(max_length=32, db_column='hash', blank=True)),
            ('status', self.gf('django.db.models.fields.SmallIntegerField')()),
            ('created_on', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, db_column='created', blank=True)),
            ('role', self.gf('django.db.models.fields.SmallIntegerField')()),
            ('display_name', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('city', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('state', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('country', self.gf('django_countries.fields.CountryField')(max_length=2)),
            ('number', self.gf('django.db.models.fields.CharField')(max_length=30, blank=True)),
            ('country_code', self.gf('django.db.models.fields.CharField')(max_length=10, blank=True)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=255)),
        ))
        db.send_create_signal('futures', ['Author'])

        # Adding model 'Sound'
        db.create_table(u'sounds', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('filename', self.gf('django.db.models.fields.files.FileField')(max_length=150, db_column='filename')),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=150, null=True)),
            ('location', self.gf('django.db.models.fields.CharField')(max_length=150, null=True)),
            ('story', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('created_on', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, db_column='timestamp', blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('user_id', self.gf('django.db.models.fields.IntegerField')(null=True, db_column='user_id', blank=True)),
            ('length', self.gf('django.db.models.fields.IntegerField')(blank=True)),
            ('noun_id', self.gf('django.db.models.fields.IntegerField')(blank=True)),
            ('sound_type', self.gf('django.db.models.fields.IntegerField')(db_column='type', blank=True)),
            ('twilio_status', self.gf('django.db.models.fields.IntegerField')(blank=True)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=765)),
            ('point', self.gf('django.contrib.gis.db.models.fields.PointField')(null=True, blank=True)),
            ('created_by', self.gf('django.db.models.fields.CharField')(default='', max_length=60, null=True)),
            ('is_active', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal('futures', ['Sound'])

    def backwards(self, orm):
        # Deleting model 'Author'
        db.delete_table(u'users')

        # Deleting model 'Sound'
        db.delete_table(u'sounds')

    models = {
        'futures.author': {
            'Meta': {'object_name': 'Author', 'db_table': "u'users'"},
            'city': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'country': ('django_countries.fields.CountryField', [], {'max_length': '2'}),
            'country_code': ('django.db.models.fields.CharField', [], {'max_length': '10', 'blank': 'True'}),
            'created_on': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'db_column': "'created'", 'blank': 'True'}),
            'display_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75'}),
            'hash32': ('django.db.models.fields.CharField', [], {'max_length': '32', 'db_column': "'hash'", 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'number': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'role': ('django.db.models.fields.SmallIntegerField', [], {}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '255'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'status': ('django.db.models.fields.SmallIntegerField', [], {}),
            'username': ('django.db.models.fields.CharField', [], {'max_length': '60'})
        },
        'futures.sound': {
            'Meta': {'object_name': 'Sound', 'db_table': "u'sounds'"},
            'created_by': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '60', 'null': 'True'}),
            'created_on': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'db_column': "'timestamp'", 'blank': 'True'}),
            'filename': ('django.db.models.fields.files.FileField', [], {'max_length': '150', 'db_column': "'filename'"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'length': ('django.db.models.fields.IntegerField', [], {'blank': 'True'}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True'}),
            'noun_id': ('django.db.models.fields.IntegerField', [], {'blank': 'True'}),
            'point': ('django.contrib.gis.db.models.fields.PointField', [], {'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '765'}),
            'sound_type': ('django.db.models.fields.IntegerField', [], {'db_column': "'type'", 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'story': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True'}),
            'twilio_status': ('django.db.models.fields.IntegerField', [], {'blank': 'True'}),
            'user_id': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'db_column': "'user_id'", 'blank': 'True'})
        }
    }

    complete_apps = ['futures']