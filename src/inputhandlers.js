async function HandleInputToggleSync(checked)
{
  if (checked)
  {
    await SelectStreamSource(HTML.E.canvasVideo, HTML.E.canvasImage);
    StartUpdateData();
    HUER.SYNC_COMMANDER.START(); //updates light values if brightness, brightness correction, color is there
    Console("started streaming, photographing, updating data, sync commander - add lights below, always on top set true")
    electronAPI.setAlwaysOnTop(true);
  }
  else
  {
    TIMER.STREAMIMAGEPERSECOND.clear();
    ClearStream(canvasVideo);
    HUER.SYNC_COMMANDER.STOP();
    StopUpdateData();
    Console("stopped streaming, photographing, updating data, sync commander, always on top set false")
    electronAPI.setAlwaysOnTop(false);
  }
}

function HandleInputGlobalBrightness(brightness)
{
  for (let light_id in HUER.SYNC_COMMANDER.INVENTORY.CONTENT)
  {
    HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"brightness": parseInt(brightness, 10)});
  }
  Console("brightness updated: " + brightness);
}

function HandleInputLightState(light_id, checked)
{
  HUER.REQUESTS.SET.LIGHT_OFFON(light_id, checked);
  HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"on": checked});
  HUER.SYNC_COMMANDER.UPDATE_TIMER();
}
function HandleInputLightSyncMode(light_id, checked)
{
  HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"sync": checked, "alert":"none"});
  HUER.SYNC_COMMANDER.UPDATE_TIMER();
  SaveLastState();
  UpdateCanvasMarker();
}

function HandleInputListenForLightsCoordinates(light_id)
{
  document.getElementById("light_"+light_id+"_coordinates_button").innerHTML = "🔴";
  HTML.E.canvasImageLayer1.onclick = function(event) {SetLightsCoordinatesByCanvasClick(event, this, HTML.E.canvasImage, light_id);};
  Console("click on canvas to set coordinates for light");
}


function HandleInputLightPositionX(light_id, x_value)
{
  let coordinates = {};
  coordinates.x = x_value;
  coordinates.y = document.getElementById("light_"+light_id+"_coordinates_y").value;
  if(!coordinates.y){coordinates.y = SETTINGS.HEIGHT/2;}
  HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"coordinates": coordinates});
  UpdateCanvasMarker();
  SaveLastState();
}

function HandleInputLightPositionY(light_id, y_value)
{
  let coordinates = {};
  coordinates.y = y_value;
  coordinates.x = document.getElementById("light_"+light_id+"_coordinates_x").value;
  console.log(coordinates.x);
  if(!coordinates.x){coordinates.x = SETTINGS.WIDTH/2;}
  HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"coordinates": coordinates});
  UpdateCanvasMarker();
  SaveLastState();
}

function HandleInputLightRange(light_id, value)
{
  HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"range": parseInt(value, 10)});
  UpdateCanvasMarker();
  SaveLastState();
}

function HandleInputLightGapsize(light_id, value)
{
  HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"gapsize": parseInt(value, 10)});
  Console("gapsize updated");
  SaveLastState();
}


function HandleInputLightBrightnessCorrection(light_id, brightness_correction)
{
  HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"brightness_correction": parseInt(brightness_correction,10)});
  SaveLastState();
}
