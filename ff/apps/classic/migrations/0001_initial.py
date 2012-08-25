# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'User'
        db.create_table(u'users', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('processed', self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True)),
            ('username', self.gf('django.db.models.fields.CharField')(max_length=180)),
            ('email', self.gf('django.db.models.fields.EmailField')(max_length=300)),
            ('password', self.gf('django.db.models.fields.CharField')(max_length=765)),
            ('hashcode', self.gf('django.db.models.fields.CharField')(max_length=96, db_column='hash', blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')()),
            ('created', self.gf('django.db.models.fields.DateTimeField')()),
            ('role', self.gf('django.db.models.fields.IntegerField')()),
            ('display_name', self.gf('django.db.models.fields.CharField')(max_length=765, blank=True)),
            ('city', self.gf('django.db.models.fields.CharField')(max_length=765, blank=True)),
            ('state', self.gf('django.db.models.fields.CharField')(max_length=765, blank=True)),
            ('country', self.gf('django.db.models.fields.CharField')(max_length=765, blank=True)),
            ('number', self.gf('django.db.models.fields.CharField')(max_length=90, blank=True)),
            ('country_code', self.gf('django.db.models.fields.CharField')(max_length=30, blank=True)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=765, blank=True)),
        ))
        db.send_create_signal('classic', ['User'])

        # Adding model 'Comment'
        db.create_table(u'comments', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('processed', self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True)),
            ('author', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['classic.User'], db_column='user_id')),
            ('parent_id', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('created', self.gf('django.db.models.fields.DateTimeField')()),
            ('parent_type', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['contenttypes.ContentType'])),
        ))
        db.send_create_signal('classic', ['Comment'])

        # Adding model 'Loop'
        db.create_table(u'loops', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('processed', self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=150)),
            ('author', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['classic.User'], db_column='user_id')),
            ('loop_map', self.gf('django.db.models.fields.TextField')(db_column='map')),
            ('status', self.gf('django.db.models.fields.IntegerField')()),
            ('created', self.gf('django.db.models.fields.DateTimeField')(db_column='timestamp')),
            ('length', self.gf('django.db.models.fields.IntegerField')()),
            ('looping', self.gf('django.db.models.fields.IntegerField')()),
            ('description', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=765, blank=True)),
        ))
        db.send_create_signal('classic', ['Loop'])

        # Adding model 'LoopsXSounds'
        db.create_table(u'loops_x_sounds', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('processed', self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True)),
            ('loop_id', self.gf('django.db.models.fields.IntegerField')()),
            ('sound_id', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal('classic', ['LoopsXSounds'])

        # Adding model 'Noun'
        db.create_table(u'nouns', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('processed', self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=765)),
            ('filename', self.gf('django.db.models.fields.CharField')(max_length=765)),
            ('author', self.gf('django.db.models.fields.CharField')(max_length=765, blank=True)),
            ('attribution', self.gf('django.db.models.fields.IntegerField')()),
            ('created', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal('classic', ['Noun'])

        # Adding model 'Sound'
        db.create_table(u'sounds', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('processed', self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True)),
            ('filename', self.gf('django.db.models.fields.CharField')(max_length=150)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=150)),
            ('location', self.gf('django.db.models.fields.CharField')(max_length=150)),
            ('story', self.gf('django.db.models.fields.TextField')()),
            ('created', self.gf('django.db.models.fields.DateTimeField')(db_column='timestamp')),
            ('status', self.gf('django.db.models.fields.IntegerField')()),
            ('author', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['classic.User'], db_column='user_id')),
            ('length', self.gf('django.db.models.fields.IntegerField')()),
            ('filename_original', self.gf('django.db.models.fields.CharField')(max_length=765)),
            ('noun', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['classic.Noun'], db_column='noun_id')),
            ('sound_type', self.gf('django.db.models.fields.IntegerField')(db_column='type')),
            ('twilio_status', self.gf('django.db.models.fields.IntegerField')()),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=765, blank=True)),
        ))
        db.send_create_signal('classic', ['Sound'])

        # Adding model 'SoundsXTags'
        db.create_table(u'sounds_x_tags', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('processed', self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True)),
            ('sound_id', self.gf('django.db.models.fields.IntegerField')()),
            ('tag_id', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal('classic', ['SoundsXTags'])

        # Adding model 'Tag'
        db.create_table(u'tags', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('processed', self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=150)),
            ('status', self.gf('django.db.models.fields.IntegerField')()),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=765, blank=True)),
        ))
        db.send_create_signal('classic', ['Tag'])

    def backwards(self, orm):
        # Deleting model 'User'
        db.delete_table(u'users')

        # Deleting model 'Comment'
        db.delete_table(u'comments')

        # Deleting model 'Loop'
        db.delete_table(u'loops')

        # Deleting model 'LoopsXSounds'
        db.delete_table(u'loops_x_sounds')

        # Deleting model 'Noun'
        db.delete_table(u'nouns')

        # Deleting model 'Sound'
        db.delete_table(u'sounds')

        # Deleting model 'SoundsXTags'
        db.delete_table(u'sounds_x_tags')

        # Deleting model 'Tag'
        db.delete_table(u'tags')

    models = {
        'classic.comment': {
            'Meta': {'object_name': 'Comment', 'db_table': "u'comments'"},
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['classic.User']", 'db_column': "'user_id'"}),
            'content': ('django.db.models.fields.TextField', [], {}),
            'created': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'parent_id': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'parent_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'processed': ('django.db.models.fields.NullBooleanField', [], {'default': '0', 'null': 'True', 'blank': 'True'})
        },
        'classic.loop': {
            'Meta': {'object_name': 'Loop', 'db_table': "u'loops'"},
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['classic.User']", 'db_column': "'user_id'"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'db_column': "'timestamp'"}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'length': ('django.db.models.fields.IntegerField', [], {}),
            'loop_map': ('django.db.models.fields.TextField', [], {'db_column': "'map'"}),
            'looping': ('django.db.models.fields.IntegerField', [], {}),
            'processed': ('django.db.models.fields.NullBooleanField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '765', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '150'})
        },
        'classic.loopsxsounds': {
            'Meta': {'object_name': 'LoopsXSounds', 'db_table': "u'loops_x_sounds'"},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'loop_id': ('django.db.models.fields.IntegerField', [], {}),
            'processed': ('django.db.models.fields.NullBooleanField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'sound_id': ('django.db.models.fields.IntegerField', [], {})
        },
        'classic.noun': {
            'Meta': {'object_name': 'Noun', 'db_table': "u'nouns'"},
            'attribution': ('django.db.models.fields.IntegerField', [], {}),
            'author': ('django.db.models.fields.CharField', [], {'max_length': '765', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {}),
            'filename': ('django.db.models.fields.CharField', [], {'max_length': '765'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'processed': ('django.db.models.fields.NullBooleanField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '765'})
        },
        'classic.sound': {
            'Meta': {'object_name': 'Sound', 'db_table': "u'sounds'"},
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['classic.User']", 'db_column': "'user_id'"}),
            'created': ('django.db.models.fields.DateTimeField', [], {'db_column': "'timestamp'"}),
            'filename': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'filename_original': ('django.db.models.fields.CharField', [], {'max_length': '765'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'length': ('django.db.models.fields.IntegerField', [], {}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'noun': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['classic.Noun']", 'db_column': "'noun_id'"}),
            'processed': ('django.db.models.fields.NullBooleanField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '765', 'blank': 'True'}),
            'sound_type': ('django.db.models.fields.IntegerField', [], {'db_column': "'type'"}),
            'status': ('django.db.models.fields.IntegerField', [], {}),
            'story': ('django.db.models.fields.TextField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '150'}),
            'twilio_status': ('django.db.models.fields.IntegerField', [], {})
        },
        'classic.soundsxtags': {
            'Meta': {'object_name': 'SoundsXTags', 'db_table': "u'sounds_x_tags'"},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'processed': ('django.db.models.fields.NullBooleanField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'sound_id': ('django.db.models.fields.IntegerField', [], {}),
            'tag_id': ('django.db.models.fields.IntegerField', [], {})
        },
        'classic.tag': {
            'Meta': {'object_name': 'Tag', 'db_table': "u'tags'"},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'processed': ('django.db.models.fields.NullBooleanField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '765', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '150'})
        },
        'classic.user': {
            'Meta': {'object_name': 'User', 'db_table': "u'users'"},
            'city': ('django.db.models.fields.CharField', [], {'max_length': '765', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '765', 'blank': 'True'}),
            'country_code': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {}),
            'display_name': ('django.db.models.fields.CharField', [], {'max_length': '765', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '300'}),
            'hashcode': ('django.db.models.fields.CharField', [], {'max_length': '96', 'db_column': "'hash'", 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'number': ('django.db.models.fields.CharField', [], {'max_length': '90', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '765'}),
            'processed': ('django.db.models.fields.NullBooleanField', [], {'default': '0', 'null': 'True', 'blank': 'True'}),
            'role': ('django.db.models.fields.IntegerField', [], {}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '765', 'blank': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '765', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {}),
            'username': ('django.db.models.fields.CharField', [], {'max_length': '180'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['classic']