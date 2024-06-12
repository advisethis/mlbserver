$(document).ready(function () {
    
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });


    $('#faster').change(function() {
        if(this.checked) {
            $('#dvr').prop("checked", true);
        }       
    });

    var datePicker = document.getElementById("gameDate");
    
    if(datePicker){
        datePicker.addEventListener("change", changeDate, false);
        datePicker.addEventListener("keypress", removeDate, false); 

        // Datepicker functions
        function changeDate(e) {
            date = datePicker.value;
            reload();
        }
        function removeDate(e) {
            datePicker.removeEventListener("change", changeDate, false);
            datePicker.addEventListener("blur", changeDate, false);
            if (e.keyCode === 13) {
                date = datePicker.value;
                reload();
            }
        }
    }
    

});
  
    function toggleSettings()
    {
        $('#pageSettings').toggle();
        $('#mvSettings').toggle();
    }

  
  // Ajax function for multiview and highlights
  function makeGETRequest(url, callback){
    var request=new XMLHttpRequest();
    request.onreadystatechange=function()
    {
        if (request.readyState==4 && request.status==200)
        {
            callback(request.responseText)}
        };
        request.open("GET", url);
        request.send();
    }

  // Multiview functions
    var excludeTeams=[];
    function parsemultiviewresponse(responsetext)
    {
        if (responsetext == "started")
        {
            setTimeout(function()
            {
                document.getElementById("startmultiview").innerHTML="Restart";
                document.getElementById("stopmultiview").innerHTML="Stop"
            },15000)
        }else if (responsetext == "stopped")
        {
            setTimeout(function()
            {
                document.getElementById("stopmultiview").innerHTML="Stopped";
                document.getElementById("startmultiview").innerHTML="Start"
            },3000)
        }else{
            alert(responsetext)}
        }
        
        function addmultiview(e, teams=[], excludes=[])
        {
            var newvalue=e.value;
            for(var i=1;i<=4;i++)
            {
                var valuefound = false;var oldvalue="";
                if(!e.checked)
                {
                    oldvalue=e.value;newvalue=""
                }
                if ((document.getElementById("multiview" + i).value == oldvalue) || ((oldvalue != "") && (document.getElementById("multiview" + i).value.startsWith(oldvalue))))
                {
                    if ((newvalue != "") && (excludes.length > 0))
                    {
                        newvalue+="&excludeTeams="+excludeTeams.toString()
                    }
                    document.getElementById("multiview" + i).value=newvalue;valuefound=true;break
                }
            }
            if(e.checked && !valuefound)
            {
                e.checked=false
            }
            for(var i=0;i<teams.length;i++)
            {
                if(e.checked)
                {
                    excludeTeams.push(teams[i])
                }else{
                    var index=excludeTeams.indexOf(teams[i]);
                    if (index !== -1){excludeTeams.splice(index,1)
                    }
                }
            }
        }
        
        function startmultiview(e)
        {
            var count=0;
            var getstr="";
            for(var i=1;i<=4;i++)
            {
                if (document.getElementById("multiview"+i).value != "")
                {
                    count++;
                    getstr+="streams="+encodeURIComponent(document.getElementById("multiview"+i).value)+"&sync="+encodeURIComponent(document.getElementById("sync"+i).value)+ content_protect_b +"&"
                }
            }
            if((count >= 1) && (count <= 4))
            {
                if (document.getElementById("faster").checked)
                {
                    getstr+="faster=true&dvr=true&"
                }else if (document.getElementById("dvr").checked)
                {
                    getstr+="dvr=true&"
                }
                if (document.getElementById("reencode").checked)
                {
                    getstr+="reencode=true&"
                }if (document.getElementById("park_audio").checked)
                {
                    getstr+="park_audio=true&"
                }if (document.getElementById("audio_url").value != "")
                {
                    getstr+="audio_url="+encodeURIComponent(document.getElementById("audio_url").value)+"&";
                    if (document.getElementById("audio_url_seek").value != "0")
                    {getstr+="audio_url_seek="+encodeURIComponent(document.getElementById("audio_url_seek").value)
                }
            }e.innerHTML="starting...";
            makeGETRequest("/multiview?"+getstr, parsemultiviewresponse)
        }else{
            alert("Multiview requires between 1-4 streams to be selected")
        }return false
    }
    
    function stopmultiview(e)
    {
        e.innerHTML="stopping...";
        makeGETRequest("/multiview", parsemultiviewresponse);
        return false
    }

    //Function to switch URLs to stream URLs, where necessary
    function stream_substitution(url)
    {
        return url.replace(/\\/([a-zA-Z]+'.html')/"/stream.m3u8")
    }

    function goBack()
    {
        var prevPage = window.location.href;
        window.history.go(-1);
    }

    function toggleAudio(x) {
        var elements = document.getElementsByClassName("audioButton");
        for (var i = 0; i < elements.length; i++)
        {
            elements[i].className = "audioButton"
        }
        document.getElementById("audioButton" + x).className += " default"; hls.audioTrack = x
    }
    function changeTime(x) {
        video.currentTime += x
    }
    function changeRate(x) {
        let newRate = Math.round((Number(document.getElementById("playback_rate").value) + x) * 10) / 10;
        if ((newRate <= document.getElementById("playback_rate").max) && (newRate >= document.getElementById("playback_rate").min)) {
            document.getElementById("playback_rate").value = newRate.toFixed(1);
            video.defaultPlaybackRate = video.playbackRate = document.getElementById("playback_rate").value
        }
    }
    function myKeyPress(e)
    {
        if (e.key == "ArrowRight") {
            changeTime(10)
        }
        else if (e.key == "ArrowLeft")
        {
            changeTime(-10)
        } else if (e.key == "ArrowUp")
        {
            changeRate(0.1)
        } else if (e.key == "ArrowDown")
        {
            changeRate(-0.1)
        }
    }


    
    //Highlights Modal Functions
    var myModal = new bootstrap.Modal(document.getElementById("myModal"), {});
    //var highlightsModal = document.getElementById("");
   // var span = document.getElementsByClassName("close")[0];
    function parsehighlightsresponse(responsetext) {
        try {
            var highlights = JSON.parse(responsetext);
            console.log(highlights);
            var modaltext = "<ul>";
            if (highlights && highlights[0]) {
                for (var i = 0; i < highlights.length; i++) {
                    if(highlights[i].headline.includes("Highlights"))
                    {
                        $('#modalTitle').text(highlights[i].headline);
                    }
                    modaltext += "<li><a href='embed.html?highlight_src=" + encodeURIComponent(highlights[i].playbacks[3].url) + "&resolution=" + resolution + content_protect_b + "'>" + highlights[i].headline + "</a><span class='tinytext'> (<a href='" + highlights[i].playbacks[0].url + "'>MP4</a>)</span></li>"
                }
            } else {
                modaltext += "No highlights available for this game.";
            }
            modaltext += "</ul>";
            $('#highlights').html(modaltext);
            myModal.show();
        } catch (e) {
            alert("Error processing highlights: " + e.message)
        }
    }
    function showhighlights(gamePk, gameDate) {
        makeGETRequest("/highlights?gamePk=" + gamePk + "&gameDate=" + gameDate + content_protect_b, parsehighlightsresponse);
        return false;
    }
    

  // Adds touch capability to hover tooltips
  document.addEventListener("touchstart", function() {}, true)