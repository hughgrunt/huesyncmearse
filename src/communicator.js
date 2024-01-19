//SetUps
async function ValidateLogin()
{
  let ip = document.getElementById("input_ip").value;
  let key = document.getElementById("input_key").value;
  let feedback = document.getElementById("input_feedback");
  if (ip.length <= 0 || key.length <= 0)
  {
    feedback.innerHTML = "fields empty";
    return;
  }
  HUER.IP = ip;
  HUER.KEY = key;

  let login = await BOOT.LOGIN();
  if (!login.success)
  {
    Console(login.reason);
    feedback.innerHTML = login.reason;
    return;
  }
  Console("login successful");
  BOOT.WRITECONFIG(ip, key);
  HTML.DRAW.SYNC_FRAME(HTML.E.content);
}

//Timer start stop;
function StartUpdateData()
{
  if (TIMER.READCOLORPERSECOND.t == null)
  {
    TIMER.READCOLORPERSECOND.t = setInterval(function (){UpdateAllLightsColor()},TIMER.READCOLORPERSECOND.INTERVAL);
  }
}

function StopUpdateData()
{
  TIMER.READCOLORPERSECOND.clear();
}

function SetInitialLightsData()
{
  let gl_brightness = document.getElementById("global_brightness").value;
  for (let l in HUER.SYNC_COMMANDER.INVENTORY.CONTENT)
  {
    let on = false;
    if (HUER.INVENTORY.LIGHTS.CONTENT[l].state.on)
    {
      document.getElementById("light_"+l+"_on").checked = true;
      on = true;
    }
    HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(l, {"on": on, "brightness": 0, "brightness_correction": 0,"range": 1, "gapsize": 1});
  }
}

//Last State
async function ReadLastState()
{
  let last_state = await BOOT.READLASTSTATE();
  if (last_state.success)
  {
    for (var light_id in last_state.content)
    {
      let light = last_state.content[light_id];
      if (light.sync)
      {
        document.getElementById("light_"+light_id+"_sync").checked = true;
        HUER.SYNC_COMMANDER.INVENTORY.CONTENT[light_id].sync = true;
      }
      if (light.coordinates)
      {
        document.getElementById("light_"+light_id+"_coordinates_x").value = light.coordinates.x;
        document.getElementById("light_"+light_id+"_coordinates_y").value = light.coordinates.y;
        HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"coordinates": light.coordinates});
      }
      if (light.range)
      {
        document.getElementById("light_"+light_id+"_range").value = light.range;
        HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"range": light.range});
      }
      if (light.gapsize)
      {
        document.getElementById("light_"+light_id+"_gapsize").value = light.gapsize;
        HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"gapsize": light.gapsize});
      }
      if (light.brightness_correction)
      {
        document.getElementById("light_"+light_id+"_gapsize").value = light.brightness_correction;
        HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"brightness_correction": light.brightness_correction});
      }
    }
    UpdateCanvasMarker();
    Console("Last State Read and Applied")
  }
}

function SaveLastState()
{
  BOOT.WRITELASTSTATE(HUER.SYNC_COMMANDER.INVENTORY.CONTENT)
}
//HANDLle INTERACTIONS
function ToggleStreamActive(id, checked)
{
  if (!checked)
  {
    TIMER.STREAMIMAGEPERSECOND.clear();
    ClearStream(canvasVideo);
    document.getElementById(id).disabled = true;

  }
  if (checked)
  {
    document.getElementById(id).disabled = false;
    document.getElementById(id).checked = true;
  }
}



function UpdateColorById(light_id)
{
  let coordinates = HUER.SYNC_COMMANDER.INVENTORY.CONTENT[light_id].coordinates;
  let range = HUER.SYNC_COMMANDER.INVENTORY.CONTENT[light_id].range;
  let gapsize = HUER.SYNC_COMMANDER.INVENTORY.CONTENT[light_id].gapsize;
  if (!coordinates){return;}
  let color = GetColorOfCanvasByCoordinates(HTML.E.canvasImage, coordinates,range, gapsize);

  HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"color": color});
  document.getElementById("light_"+light_id+"_color").style.color = color.hex;
  document.getElementById("light_"+light_id+"_color").style.backgroundColor = color.hex;
}



function UpdateAllLightsColor()
{
  for(let light_id in HUER.SYNC_COMMANDER.INVENTORY.CONTENT)
  {
    if (HUER.SYNC_COMMANDER.INVENTORY.CONTENT[light_id].sync){UpdateColorById(light_id);};

  }
}
