async function SelectStreamSource(videoCanvas, imageCanvas) //initiate handling the stream
{
  let sid = await window.electronAPI.getStreamSourceId();
  let stream = await getStreamById(sid, SETTINGS.WIDTH, SETTINGS.HEIGHT);
  let settings = stream.getVideoTracks()[0].getSettings();
  DrawStreamToCanvas(videoCanvas, stream);
  TIMER.STREAMIMAGEPERSECOND.t = setInterval(function(){DrawImageFromVideoCanvas(videoCanvas, imageCanvas);}, TIMER.STREAMIMAGEPERSECOND.INTERVAL);

}

async function getStreamById(id, width, height) //get the stream using the electon api
{
  try {
    let stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: id,
          minWidth: width,
          maxWidth: width,
          minHeight: height,
          maxHeight: height,
          frameRate:
          {
             ideal: SETTINGS.STREAM_FPS,
             min: SETTINGS.STREAM_FPS
         }
        },
      }
    });
    return stream;
  } catch (e)
  {
    console.log("couldnt get source by id: " + e)
  }
}

function ClearStream(videoCanvas)
{
  let e = videoCanvas;
  if (e.srcObject == null){return;}
  let tracks = e.srcObject.getTracks(); //get all tracks and stop all of them
  tracks.forEach((track) => track.stop());
  e.srcObject = null; //assign feedback as empty
}

function DrawStreamToCanvas(targetCanvas, stream)
{
  targetCanvas.srcObject = stream;
}

function DrawImageFromVideoCanvas(videoCanvas, targetCanvas)
{
  let v = videoCanvas;
  let c = targetCanvas;
  if (!v.srcObject || v.srcObject == null)
  {
    return;
  }
  if (!c || c == null)
  {
    return;
  }
  let cC = c.getContext("2d");
  let w = v.videoWidth;
  let h = v.videoHeight;
  cC.drawImage(v, 0, 0, w, h);
}


//Get lights coordinates and color of canvas
//ListenForColorInputs

function SetLightsCoordinatesByCanvasClick(event, elementOrigin, elementTarget, light_id)
{
  let coordinates = GetCoordinatesOfCanvasOnClick(elementOrigin, event);
  if (!document.getElementById("light_"+light_id+"_coordinates_x") || !document.getElementById("light_"+light_id+"_coordinates_y"))
  {
    Console("id not found: " + "light_"+light_id+"_coordinates");
    return;
  }
  if (!document.getElementById("light_"+light_id+"_color"))
  {
    Console("id not found: " + "light_"+light_id+"_color");
    return;
  }

  HUER.SYNC_COMMANDER.INVENTORY.SETLIGHTSETTINGS(light_id, {"coordinates": coordinates});
  UpdateHTMLInputsCoordinates(light_id, coordinates);
  UpdateColorById(light_id);
  UpdateCanvasMarker();
  SaveLastState();

  document.getElementById("light_"+light_id+"_coordinates_button").innerHTML = "►";
  canvasImageLayer1.onclick = '';
  Console("coordinates set");
}

function GetCoordinatesOfCanvasOnClick(element, event) // Get the coordinates of the click
{
  let coordinates = GetEventLocation(element, event);
  return coordinates;
}

function GetColorOfCanvasByCoordinates(canvas, coordinates, range, gapsize) //get the color of coordinates
{
  canvas = document.getElementById("canvasImage");
  let context = canvas.getContext('2d');
  if (!range){range = 1;};
  if (!gapsize){gapsize = 1;};
  let rangedPixelData = context.getImageData(coordinates.x-(range/2), coordinates.y-(range/2), range, range).data;
  let averagedColor = GetAverageOfPixelData(rangedPixelData, gapsize);

  let color = {};
  color.rgb = averagedColor;
  color.hex = "#" + ("000000" + COLORCONVERT.RGBTOHEX(color.rgb[0], color.rgb[1], color.rgb[2])).slice(-6);
  color.xy = COLORCONVERT.RGBTOXY(color.rgb[0], color.rgb[1], color.rgb[2]);
  return color;
}

function GetAverageOfPixelData(pixeldata, gapsize)
{
  let r=0,g=0,b=0;
  let count = 0;
  for(let p=0;p<pixeldata.length;p+= (4*gapsize))
  {
    r += pixeldata[p];
    g += pixeldata[p+1];
    b += pixeldata[p+2];
    count++;
  }
  r = r/count;
  g = g/count;
  b = b/count;
  return [r, g, b]
}

function UpdateCanvasMarker()
{
  let canvas = document.getElementById("canvasImageLayer1");
  let ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let light in HUER.SYNC_COMMANDER.INVENTORY.CONTENT)
  {
    if (HUER.SYNC_COMMANDER.INVENTORY.CONTENT[light].sync && HUER.SYNC_COMMANDER.INVENTORY.CONTENT[light].coordinates)
    {
      let c = HUER.SYNC_COMMANDER.INVENTORY.CONTENT[light].coordinates;
      let r = HUER.SYNC_COMMANDER.INVENTORY.CONTENT[light].range;

      ctx.fillText(light, c.x, c.y);
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.rect(c.x-(r/2), c.y-(r/2), r, r);
      ctx.stroke();
    }
  }
}
