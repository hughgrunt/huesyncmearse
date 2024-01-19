const HTML =
{
  E :
  {
    content: null,
    canvasVideo : null,
    canvasImage : null,
    canvasImageLayer1: null,
    btnSelectStreamSource: null,
    btnStartCapture: null,
    btnStopCapture: null,
    btnTimerStartDrawImage: null,
    divSdpLightsGlobals: null,
    divSdpLights: null
  },
  DRAW :
  {
    SYNC_FRAME: async function (target)
    {
      await HUER.INVENTORY.FILL.ALL();
      HUER.SYNC_COMMANDER.INVENTORY.FILLWITHALL();
      target.innerHTML = HTML.BUILD.SYNC_FRAME();
      HTML.SETUP.SYNC_FRAME();
      HTML.E.divSdpLightsGlobals.innerHTML = HTML.BUILD.LIGHT_GLOBALS_CONTROLLER();
      HTML.E.divSdpLights.innerHTML = HTML.BUILD.LIGHT_CARDS_SYNC(HUER.INVENTORY.LIGHTS.LIST_IDS);
      SetInitialLightsData();
      ReadLastState();
    },
    LOGIN_FORM: function (target, reason)
    {
      target.innerHTML = HTML.BUILD.LOGIN_FORM(reason);
    }
  },
  BUILD:
  {
    LOGIN_FORM : function (reason)
    {
      if (!reason){reason = "";};
      let form = "";
      form = "<table>"
            + "<tr>"
               + "<th colspan='2'>"+reason+"</th>"
            + "</tr>"
            + "<tr>"
               + "<td colspan='2'><i>To find your the IP of your Bridge and generate a Key (username) follow the steps as stated in the offical Philipps Hue Documentation<br><a target='_blank' href='https://developers.meethue.com/develop/get-started-2/'>https://developers.meethue.com/develop/get-started-2/</a></i><br></td>"
            + "</tr>"
            + "<tr>"
               + "<td colspan='2'><b>LOGIN</b></td>"
            + "</tr>"
           + "<tr>"
              + "<td colspan='2'>Please enter your ip and clientkey.</td>"
           + "</tr>"
           + "<tr>"
           + "<th>IP</th>"
           + "<td><input id='input_ip' type='text'></input></td>"
           + "</tr>"
           + "<tr>"
           + "<th>key (username)</th>"
           + "<td><input id='input_key' type='text'></input></td>"
           + "</tr>"
           + "<tr>"
           + "<td colspan='2'><button onclick='ValidateLogin()'>validate</button></td>"
           + "</tr>"
           + "<tr>"
           + "<td colspan='2' id='input_feedback'></td>"
           + "</tr>"
           + "</table>";
      return form;
    },
    SYNC_FRAME : function ()
    {
      let form = "";
      form +=  "<div id='divSyncDashPanel'>"
      form +=    "<div id='divSdpLightsGlobals'></div>"
      form += "<div id='Atelier'>"
      form +=  "<div id='AtelierRoom1' style='display:none' class='flexCentered'>"
      form +=    "<video id='canvasVideo' alt='liveImage' autoplay></video>"
      form +=  "</div>"
      form +=  "<div id='AtelierRoom2' class='flexCentered'>"
      form +=    "<canvas id='canvasImage' class='canvas' willReadFrequently='true'></canvas>"
      form +=    "<canvas id='canvasImageLayer1' class='canvas layer1'></canvas>"
      form +=  "</div>"
      form += "</div>";
      form +=    "<div id='divSdpLightsContent' class='flexContainer'></div>"
      form +=  "</div>"

      form += "";
      return form;
    },
    LIGHT_GLOBALS_CONTROLLER : function ()
    {
      let controls = "";
      controls += "<div class='flexCentered'>"
      controls += "<b>ACTIVATE SYNC</b>"
      controls += "</div>"
      controls += "<div class='flexCentered'>"
      controls += "<label class='switch big'><input onchange='HandleInputToggleSync(this.checked)' id='sldBig' type='checkbox'><span class='slider big round'></span></label>"
      controls += "</div>"
      controls += "<div class='flexCentered'>"
      controls += "<b>BRIGHTNESS CORRECTION</b>"
      controls += "</div>"
      controls += "<div class='flexCentered'>"
      controls += "<input class='rangeslider big' onchange='HandleInputGlobalBrightness(this.value);document.getElementById("+'"label_global_brightness"'+").innerHTML = this.value' id='global_brightness' type='range' min='-255' max='255' value='0'/>";
      controls += "</div>"
      controls += "<div class='flexCentered'>"
      controls += "<label id='label_global_brightness' for='global_brightness'>0</label>";
      controls += "</div>"
      return controls;

    },
    LIGHT_CARDS_SYNC : function (light_ids)
    {
      let cards = "";
      for (let l = 0;l<light_ids.length;l++)
      {
        cards += this.LIGHT_CARD_SYNC(light_ids[l])
      }
      return cards;
    },
    LIGHT_CARD_SYNC : function (light_id)
    {
      let light_name = HUER.INVENTORY.GETLIGHTNAMEBYID(light_id);
      let table = ""
                +"<table class='lightcard'>"
                + "<tr>"
                +   "<th colspan='4'>"+light_id+": "+light_name+"</th>"
                + "</tr>"
                + "<tr>"
                + "<td>"
                +   "on <label class='switch small'><input id='light_"+light_id+"_on' type='checkbox' onclick='HandleInputLightState("+light_id+", this.checked)'><span class='slider small round'></span></label>"
                + "</td>"
                + "<td>"
                +   "sync <label class='switch small'><input id='light_"+light_id+"_sync' type='checkbox' onclick='HandleInputLightSyncMode("+light_id+", this.checked)'><span class='slider small round'></span></label>"
                + "</td>"
                + "<td>"
                + " <span class='colorsquare' id='light_"+light_id+"_color'>---</span>"
                + "</td>"
                + "<td>"
                + "<button id='light_"+light_id+"_coordinates_button' onclick='HandleInputListenForLightsCoordinates("+light_id+");'>►</button>"
                + "</td>"
                + "</tr>"
                + "<tr>"
                +   "<td>"
                +     "&#8596;"
                +   "</td>"
                +   "<td>"
                +     "<input class='position_input' id='light_"+light_id+"_coordinates_x' type='number' min='1' max='"+SETTINGS.WIDTH+"' onchange='HandleInputLightPositionX("+light_id+",this.value)'>"
                +   "</td>"
                +   "<td>"
                +     "&#8597;"
                +   "</td>"
                +   "<td>"
                +     "<input class='position_input' id='light_"+light_id+"_coordinates_y' type='number' min='1' max='"+SETTINGS.HEIGHT+"' onchange='HandleInputLightPositionY("+light_id+",this.value)'>"
                +   "</td>"
                + "</tr>"
                + "<tr>"
                +   "<td>"
                +     "range"
                +   "</td>"
                +   "<td>"
                +     "<input class='position_input' id='light_"+light_id+"_range' type='number' value='1' min='0' max='"+SETTINGS.WIDTH+"' onchange='HandleInputLightRange("+light_id+",this.value)'>"
                +   "</td>"
                +   "<td>"
                +     "gap"
                +   "</td>"
                +   "<td>"
                +     "<input class='position_input' id='light_"+light_id+"_gapsize' type='number' value='1' min='0' max='"+SETTINGS.WIDTH+"' onchange='HandleInputLightGapsize("+light_id+",this.value)'>"
                +   "</td>"
                + "</tr>"
                + "<tr>"
                +   "<td colspan='3'>brightness correction</td>"
                +   "<td>"
                +     "<input id='light_"+light_id+"_brightness' class='position_input' type='number' value='0' min='-255' max='255' onchange='HandleInputLightBrightnessCorrection("+light_id+", this.value);'>"
                +   "</td>"
                + "</tr>"
                + "</table>";
      return table;
    }
  },
  SETUP:
  {
    SYNC_FRAME : function ()
    {
      SetElementSizeById("canvasVideo", SETTINGS.WIDTH, SETTINGS.HEIGHT);
      SetElementSizeById("canvasImage", SETTINGS.WIDTH, SETTINGS.HEIGHT);
      SetElementSizeById("canvasImageLayer1", SETTINGS.WIDTH, SETTINGS.HEIGHT);
      SetElementStyleSizeById("AtelierRoom2", false, SETTINGS.HEIGHT + 40)

      HTML.E.btnSelectSteamSource = document.getElementById("btnSelectSteamSource");
      HTML.E.canvasVideo = document.getElementById("canvasVideo");
      HTML.E.canvasImage = document.getElementById("canvasImage");
      HTML.E.canvasImageLayer1 = document.getElementById("canvasImageLayer1");
      HTML.E.btnStartCapture = document.getElementById("btnStartCapture");
      HTML.E.btnStopCapture = document.getElementById("btnStopCapture");
      HTML.E.btnTimerStartDrawImage = document.getElementById("btnTimerStartDrawImage");
      HTML.E.divSdpLightsGlobals = document.getElementById("divSdpLightsGlobals");
      HTML.E.divSdpLights = document.getElementById("divSdpLightsContent");

    }
  }
}

//UpdateHTMLElements
function UpdateHTMLInputsCoordinates(light_id, coordinates)
{
  document.getElementById("light_"+light_id+"_coordinates_x").value = coordinates.x;
  document.getElementById("light_"+light_id+"_coordinates_y").value = coordinates.y;
}
