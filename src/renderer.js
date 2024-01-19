//credits
//Arkelly from electronjs-discord who walked me through the process of ipc processes
//Globals

var SETTINGS = {};
SETTINGS.WIDTH = 480;
SETTINGS.HEIGHT = 240;
SETTINGS.STREAM_FPS = 30;
SETTINGS.PHOTOGRAPH_FPS = 30;

var TIMER = {};
//timer to make photo of stream and drwa it
TIMER.STREAMIMAGEPERSECOND = {};
TIMER.STREAMIMAGEPERSECOND.INTERVAL = 100;
TIMER.STREAMIMAGEPERSECOND.t = null;
TIMER.STREAMIMAGEPERSECOND.clear = function ()
{
  if (this.t != null)
  {
    clearInterval(this.t);
    this.t = null;
  }
}
//timer to read color of lights coordinates of canvasses
TIMER.READCOLORPERSECOND = {};
TIMER.READCOLORPERSECOND.INTERVAL = 100;
TIMER.READCOLORPERSECOND.t = null;
TIMER.READCOLORPERSECOND.clear = function ()
{
  if (this.t != null)
  {
    clearInterval(this.t);
    this.t = null;
  }
};
//Timer ConsoleMessage
TIMER.CONSOLEMESSAGE = {};
TIMER.CONSOLEMESSAGE.INTERVAL = 3000;
TIMER.CONSOLEMESSAGE.t = null;
TIMER.CONSOLEMESSAGE.clear = function ()
{
  if (this.t != null)
  {
    clearInterval(this.t);
    this.t = null;
  }
};



Initiate();

async function Initiate()
{
  HTML.E.content = document.getElementById("content");
  let initiate = await BOOT.UP();
  if (initiate.success)
  {
    Console("login successful!");
    HTML.DRAW.SYNC_FRAME(HTML.E.content);
  }
  else
  {
    Console("something bad: " + initiate.reason);
    HTML.DRAW.LOGIN_FORM(HTML.E.content, initiate.reason);
  }
  HUER.NOTIFYONERROR = function (msg){Console(msg);};
}



//Generics
//ElementsRelated
function SetElementSizeById(id, w, h)
{
  var e = document.getElementById(id);
  e.width = w;
  e.height = h;
}
function SetElementStyleSizeById(id, w, h)
{
  var e = document.getElementById(id);
  if (w){e.style = "width:"+w+"px;"}
  if(h){e.style = "height:"+h+"px;"}
}
function GetElementPosition(obj) //getElementPosition
{
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}
function GetEventLocation(element,event) //get EventPosition
{
    // Relies on the getElementPosition function.
    var pos = GetElementPosition(element);
    return {
    	x: (event.pageX - pos.x),
      	y: (event.pageY - pos.y)
    };
}


function Console(message)
{
  let cE = document.getElementById("console");
  let currentBg = cE.style.background;
  var now = new Date();
  var hm = now.getHours() + ":"+now.getMinutes()+":"+now.getSeconds();
  cE.innerHTML = hm+ " - "+ message;
  cE.style.transition = "0s";
  cE.style.backgroundColor = "#ff9800";

  TIMER.CONSOLEMESSAGE.t = setTimeout(function(){cE.style.transition = "3s";cE.style.backgroundColor = currentBg;}, 1000);

}
