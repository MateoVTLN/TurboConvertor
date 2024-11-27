
var timeOut1;

var runOnce;
var waitingForServer;
var fileName
var fileType = 'wav';
var channels = 'mono';
var bitDepth = '16';
var sampleRate = '441';
var readyToConvert;
var sessionID;

$( document ).on( 'change', '#file', function() {

    $('#error-message').html('&nbsp;');

    runOnce = true;
    waitingForServer = true;
    readyToConvert = false;

    var formData = new FormData($(this).parents('form')[0]);
    document.getElementById('filedropzone').style.display = 'none';
    document.getElementById('fileselectedzone').style.display = 'block';

    var ext = $('#file').val().split('.').pop().toLowerCase();
    var fullFilePath = $('#file').val();
    fileName = fullFilePath.replace(/^.*[\\\/]/, '')

    // check file size
    var file = document.getElementById("file");
    var file_size_bytes = file.files[0].size;

    var max_file_size_MB = 1000;

    if($.inArray(ext, ['wav', 'Wav', 'WAV', 'mp3', 'Mp3', 'MP3', 'ogg', 'Ogg', 'OGG', 'flac', 'Flac', 'FLAC', 'm4a', 'M4a', 'M4A', 'mp4', 'Mp4', 'MP4']) == -1) {
        // must be WAV file (for now)
        $('#primary-feedback').css('margin-top', '85px');
	$('#primary-feedback').html('FILE TYPE UNSUPPORTED');
    } else if (file_size_bytes > (max_file_size_MB*1000000)) {
        // can't be greater than 500 MB
        $('#primary-feedback').css('margin-top', '85px');
	$('#primary-feedback').html('FILE SIZE EXCEEDS 1 GB');
    } else {

        document.getElementById('upload-progress-container').style.display = 'block';

        $.ajax({
            url: 'php/upload-file.php',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,

            xhr: function() {
                myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){
                    myXhr.upload.addEventListener('progress', progressHandlingFunction);
                }
                return myXhr;
            },

            success: function (data) {
	        if(data.success) {
                    waitingForServer = false;
                    readyToConvert = true;

		    sessionID = data.sessionID;

                    $('#error-message').html('&nbsp;');

	            console.log("File upload success");
                    console.log("SessionID: " + sessionID);

		} else {
                    waitingForServer = false;
    		    document.getElementById('primary-feedback').style.display = 'block';
                    $('#primary-feedback').css('margin-top', '85px');
		    $('#primary-feedback').html(data.msg);
                    console.log("File upload failed");
		}
            }
        });
    }
});

function progressHandlingFunction(e) {
    if(e.lengthComputable && runOnce) {

        var percentage = (e.loaded / e.total) * 100;
        percentage = percentage.toFixed(1);

        $('#primary-feedback').css('margin-top', '5px');
        $('#primary-feedback').html('<span style="font-size: 16px;">' + fileName + ' [' + percentage + '%]</span>');
        $('#upload-progress-bar').css('width', percentage + '%');

	// console.log('File upload: ' + percentage + '%');

        if (percentage == 100) {
            document.getElementById('upload-progress-container').style.display = 'none';
            $('#primary-feedback').css('margin-top', '75px');
            $('#primary-feedback').html('<span style="font-size: 22.5px;">' + fileName + '</span><br><span style="font-size: 16px;"><a href="#" class="changefile">Click here to select a different file</a></span>');

            runOnce = false;
        }
    }
}


function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}


function waitingForServerFunction() {

    if (!waitingForServer) {
	return;
    }

    var text = loadFile(sessionID + 'progress.txt');

    var progressPercent = 0;

    if(text != null) {
        var durationLastIdx = text.lastIndexOf('Duration:');
        var timeLastIdx = text.lastIndexOf('time=');

        if(durationLastIdx != -1 && timeLastIdx != -1) {
            var timeHHMMSS = text.substr(timeLastIdx+5, 8);
            var durationHHMMSS = text.substr(durationLastIdx+10, 8);

            // split at the colons.
            var a = timeHHMMSS.split(':');
            var b = durationHHMMSS.split(':');

            // minutes are worth 60 seconds. Hours are worth 60 minutes.
            var timeSeconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
            var durationSeconds = (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]);

            progressPercent = Math.round(100.0 * timeSeconds / durationSeconds);

            console.log('Progress: ' + progressPercent + '%');

            //var fileBasename = fileName.replace(/\.[^/.]+$/, "");

            $('#convert-feedback').css('margin-top', '5px');
            $('#convert-feedback').html('<span style="font-size: 16px;">' + fileName.split('.')[0] + '.' + fileType + ' [' + progressPercent + '%]</span>');
            $('#convert-progress-bar').css('width', progressPercent + '%');
        }
    }

    //$('#error-message').html('<span style="color: grey;">' + progressPercent + '% complete</span>');

    if (waitingForServer) {
	clearTimeout(timeOut1);
	timeOut1 = setTimeout(waitingForServerFunction, 500);
    }

}


$(document).ready(function () {

    $('#filedropzone').on('dragenter', function() {
	this.style.backgroundColor = '#DCDCDC';
    });

    $('#filedropzone').on('dragover', function() {
        this.style.backgroundColor = '#F76363';
    });

    $('#filedropzone').on('dragleave', function() {
        this.style.backgroundColor = '#EFEFEF';
    });

    $('#filedropzone').on('mouseenter', function() {
        this.style.backgroundColor = '#DCDCDC';
    });

    $('#filedropzone').on('mouseover', function() {
        this.style.backgroundColor = '#DCDCDC';
    });

    $('#filedropzone').on('mouseleave', function() {
        this.style.backgroundColor = '#EFEFEF';
    });

    $('#convert-button').on('click', function() {

	if(waitingForServer) {
	    $('#error-message').html('Please wait for your file to finish uploading');
        } else if(!readyToConvert) {
	    $('#error-message').html('You need to select a file to convert first');
	} else {

            waitingForServer = true;

	    /*$('#error-message').html('<span style="color: grey;">Your file should be ready in just a few moments...</span>');*/
            $('#error-message').html('');

            // NEW
            document.getElementById('convert-button').style.display = 'none'; // hide the convert button..
            document.getElementById('fileconvertzone').style.display = 'block';
	    timeOut1 = setTimeout(waitingForServerFunction, 500);

            var quality = document.getElementById("myRange").value;

            console.log("Convert: targetExtension: " + fileType + ", targetChannels: " + channels + ", targetBitDepth: " + bitDepth + ", targetSampleRate: " + sampleRate + ", targetEncodingQuality: " + quality);

            jQuery.ajax({
                url: 'php/convert-file.php',
                type: 'POST',
                data: { 'targetExtension':fileType, 'targetChannels':channels, 'targetBitDepth':bitDepth, 'targetSampleRate':sampleRate, 'targetEncodingQuality':quality },
                dataType: 'json',

                success: function (data) {
	            if(data.success) {
                        waitingForServer = false;
                        clearTimeout(timeOut1);
	                console.log("Convert success");
                        $('#convert-feedback').html('<span style="font-size: 16px;">' + fileName.split('.')[0] + '.' + fileType + ' [100%]</span>');
                        $('#convert-progress-bar').css('width', '100%');
                        document.getElementById('fileconvertzone').style.display = 'none';
                        document.getElementById('fileconvertedzone').style.display = 'block';

			$('#converted-feedback').html('<span style="font-size: 22.5px;"><a href=' + data.downloadURL + ' download>Download ' +  fileName.split('.')[0] + '.' + fileType + '</a><br><span style="font-size: 16px; color: #333;">Completed in ' + data.conversionTime + ' seconds</span>');
		    } else {
                        waitingForServer = false;
                	clearTimeout(timeOut1);
	                console.log("Convert failed");
                        document.getElementById('fileconvertzone').style.display = 'none';
                        document.getElementById('fileconvertedzone').style.display = 'none';
	                $('#error-message').html(data.msg);
		    }
                }
            });
        }
    });

    $('#select-wav').on('click', function() {
        $('.filetypebutton-group button').css('background-color', '');
        this.style.backgroundColor = '#f76363';
        fileType = 'wav';
	document.getElementById('qualityzoneenabled').style.display = 'block';
	document.getElementById('qualityzonedisabled').style.display = 'none';
        console.log(fileType + ' file type selected');
        $('#q2').html('&nbsp; &nbsp; 16 bit');
    });


    $('#select-mono').on('click', function() {
        $('.channelsbutton-group button').css('background-color', '');
        this.style.backgroundColor = '#f76363';
        channels = 'mono';
        console.log(channels + ' channels selected');
    });

    $('#select-16bit').on('click', function() {
        $('.bitdepthbutton-group button').css('background-color', '');
        this.style.backgroundColor = '#f76363';
        bitDepth = '16';
        console.log(bitDepth + ' bit depth selected');
    });

    $('#select-441khz').on('click', function() {
        $('.sampleratebutton-group button').css('background-color', '');
        this.style.backgroundColor = '#f76363';
        sampleRate = '441';
        console.log(sampleRate + ' sample rate selected');
    });


    $(document).on("click", "a.changefile" , function() {
        console.log("Select new file event");

        $('#error-message').html('&nbsp;');

        document.getElementById('filedropzone').style.display = 'block';
        document.getElementById('fileselectedzone').style.display = 'none';
        document.getElementById('fileconvertedzone').style.display = 'none';
	document.getElementById('convert-button').style.display = 'block'; // restore the convert button..

        // reset information for conversion progress
        $('#convert-feedback').css('margin-top', '5px');
        $('#convert-feedback').html('Please wait...');
        $('#convert-progress-bar').css('width', '0%');

        readyToConvert = false;

        jQuery.ajax({
            url: 'php/clear-session.php',
            type: 'POST',
            cache: false,
            contentType: false,
            processData: false,

            success: function (data) {
	        if(data.success) {
	            console.log("Session cleared");
		} else {
	            console.log("Session failed to clear");
		}
            }
        });
    });

    $(document).on("click", "a.changeformat" , function() {
        console.log("Select new format event");

        $('#error-message').html('&nbsp;');

        document.getElementById('fileconvertedzone').style.display = 'none';
	document.getElementById('convert-button').style.display = 'block'; // restore the convert button..

        // reset information for conversion progress
        $('#convert-feedback').css('margin-top', '5px');
        $('#convert-feedback').html('Please wait...');
        $('#convert-progress-bar').css('width', '0%');
    });

});
