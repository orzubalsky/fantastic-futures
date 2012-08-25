# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'SoundsXTags.processed'
        db.add_column(u'sounds_x_tags', 'processed',
                      self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Sound.processed'
        db.add_column(u'sounds', 'processed',
                      self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Comment.processed'
        db.add_column(u'comments', 'processed',
                      self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Tag.processed'
        db.add_column(u'tags', 'processed',
                      self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True),
                      keep_default=False)

        # Adding field 'User.processed'
        db.add_column(u'users', 'processed',
                      self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Loop.processed'
        db.add_column(u'loops', 'processed',
                      self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Noun.processed'
        db.add_column(u'nouns', 'processed',
                      self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True),
                      keep_default=False)

        # Adding field 'LoopsXSounds.processed'
        db.add_column(u'loops_x_sounds', 'processed',
                      self.gf('django.db.models.fields.NullBooleanField')(default=0, null=True, blank=True),
                      keep_default=False)

    def backwards(self, orm):
        # Deleting field 'SoundsXTags.processed'
        db.delete_column(u'sounds_x_tags', 'processed')

        # Deleting field 'Sound.processed'
        db.delete_column(u'sounds', 'processed')

        # Deleting field 'Comment.processed'
        db.delete_column(u'comments', 'processed')

        # Deleting field 'Tag.processed'
        db.delete_column(u'tags', 'processed')

        # Deleting field 'User.processed'
        db.delete_column(u'users', 'processed')

        # Deleting field 'Loop.processed'
        db.delete_column(u'loops', 'processed')

        # Deleting field 'Noun.processed'
        db.delete_column(u'nouns', 'processed')

        # Deleting field 'LoopsXSounds.processed'
        db.delete_column(u'loops_x_sounds', 'processed')

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