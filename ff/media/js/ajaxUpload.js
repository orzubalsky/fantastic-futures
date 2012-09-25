;(function($){
	var ajaxUpload = window.site.ajaxUpload = new function() {
	    this.csrfToken;
		this.init = function() {
			this.csrfToken = $('#addSoundForm input[name="csrfmiddlewaretoken"]').val();
			this.fileUpload();			
		},
		this.debug = function() {
		},
		this.fileUpload = function()
		{   
		    var self = this;
		    
            var uploader = new qq.FileUploader({
                action: "/ajax-upload",
                element: $('#file-uploader')[0],
                multiple: false,
                debug: false,
                allowedExtensions: ['mp3'],
                onSubmit: function(id, fileName)
                {
                    $('.progressBarContainer').show();
                    $('#uploadText').text(fileName).show();
                    
                },
                onProgress: function(id, fileName, loaded, total)
                {
                	$('.qq-upload-file, .qq-upload-size, .qq-upload-cancel').hide();
                	var percentage=Math.round((loaded/total)*100);
                	lib.log(percentage);
                	$('#ajaxUploadContainer').addClass('progress');		
                	$('.progressBarContainer .progress').css({'width':percentage+'%'});		
                },
                onCancel: function(id, fileName)
                {
                	$('.qq-upload-file, .qq-upload-size, .qq-upload-cancel').hide();
                	$('#ajaxUploadContainer').removeClass();
                },
                onComplete: function( id, fileName, responseJSON ) 
                {
                	$('.qq-upload-file, .qq-upload-size, .qq-upload-cancel').hide();	
                    $('.progressBarContainer').fadeOut(200);
                	
                	$('#id_filename').val('uploads/' + fileName);
                },
                onAllComplete: function( uploads ) {
                // uploads is an array of maps
                // the maps look like this: { file: FileObject, response: JSONServerResponse }
                $('#ajaxUploadContainer').removeClass().addClass('complete');
                },              
                params: {
                   'csrf_token': self.csrfToken,
                   'csrf_name': 'csrfmiddlewaretoken',
                   'csrf_xname': 'X-CSRFToken',
                },
           });
           
           $('#uploadText').live('click', function(e) 
           {
              e.preventDefault();
           });
		};
	};
})(jQuery);