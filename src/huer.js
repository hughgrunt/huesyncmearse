const HUER =
{
  IP: "",
  KEY: "", //username
  CLIENTKEY: "",
  NOTIFYONERROR: function (){return}, //placeholder what do to when error
  TEST_LOGIN : async function ()
  {
    return await HUER.REQUESTS.GET.LOGIN();
  },
  INVENTORY:
  {
    LIGHTS : {},
    GROUPS: {},
    FILL:
    {
      ALL: async function ()
      {
        await HUER.INVENTORY.FILL.LIGHTS();
        await HUER.INVENTORY.FILL.GROUPS();
      },
      LIGHTS: async function ()
      {
        HUER.INVENTORY.LIGHTS.CONTENT = await HUER.REQUESTS.GET.LIGHTS();
        HUER.INVENTORY.LIGHTS.LIST_IDS = HUER.GENERICS.GETPROPLIST(HUER.INVENTORY.LIGHTS.CONTENT);
        HUER.INVENTORY.LIGHTS.LIST_NAMES = HUER.GENERICS.GETNAMELIST(HUER.INVENTORY.LIGHTS.CONTENT);
      },
      GROUPS: async function ()
      {
        HUER.INVENTORY.GROUPS.CONTENT = await HUER.REQUESTS.GET.GROUPS();
        HUER.INVENTORY.GROUPS.LIST_IDS = HUER.GENERICS.GETPROPLIST(HUER.INVENTORY.GROUPS.CONTENT);
        HUER.INVENTORY.GROUPS.LIST_NAMES = HUER.GENERICS.GETNAMELIST(HUER.INVENTORY.GROUPS.CONTENT);
        HUER.INVENTORY.GROUPS.SIMPLIFIED = HUER.INVENTORY.GETSIMPLIFIEDGROUPS(HUER.INVENTORY.GROUPS.LIST_IDS, HUER.INVENTORY.GROUPS.LIST_NAMES);
      }
    },
    GETLIGHTNAMEBYID : function (id)
    {
      for (let light in this.LIGHTS.CONTENT)
      {
        if (light == id)
        {
          return this.LIGHTS.CONTENT[id].name
        }
      }
    },
    GETSIMPLIFIEDGROUPS : function (ids, names)
    {
      let sGroups = {};
      for (let i=0;i<ids.length;i++)
      {
        sGroups[names[i]] = {};
        sGroups[names[i]].lights = [];
        sGroups[names[i]].list_lightnames = [];
        sGroups[names[i]].list_lightids = [];
        let lights = HUER.INVENTORY.GROUPS.CONTENT[ids[i]].lights;
        for (let l=0;l<lights.length;l++)
        {
          let light = {};
          light.id = lights[l];
          light.name = HUER.INVENTORY.GETLIGHTNAMEBYID(lights[l]);
          sGroups[names[i]].lights.push(light);
          sGroups[names[i]].list_lightids.push(light.id);
          sGroups[names[i]].list_lightnames.push(light.name);
        }
      }
      return sGroups;
    }
  },
  SYNC_COMMANDER:
  {
    TIMER: null,
    INTERVAL: 1000,
    MAX_CPS: 10, //cps = commands per second
    FASTEST_INVERVAL: 100,
    MAX_MS: 0,
    MIN_MS: 0,
    START: function ()
    {
      if (this.TIMER != null){return;}
      this.UPDATEINTERVAL();
      this.TIMER = setInterval(function () {HUER.SYNC_COMMANDER.SYNC();}, this.INTERVAL);
      console.log("started with interval " + this.INTERVAL);
    },
    STOP: function()
    {
      clearInterval(this.TIMER);
      this.TIMER = null;
    },
    UPDATE_TIMER : function ()
    {
      this.UPDATEINTERVAL();
      if (this.TIMER != null)
      {
        this.STOP();
        this.START();
      }
    },
    UPDATEINTERVAL : function ()
    {
      let lights_count = 0;
      for (let light in this.INVENTORY.CONTENT)
      {
        if (this.INVENTORY.CONTENT[light].sync && this.INVENTORY.CONTENT[light].on){lights_count++;};
      }
      if (lights_count == 0){lights_count = 1;}
      let max_fast_light_interval = 1000 / this.MAX_CPS;
      this.INTERVAL = max_fast_light_interval * lights_count;
      console.log(this.MAX_CPS + " actions per light becomes update for each light every "+this.INTERVAL)
    },
    SYNC: function ()
    {
      for (let light in this.INVENTORY.CONTENT) //ursprünglich
      {
        let s = this.INVENTORY.CONTENT[light].sync;
        let o = this.INVENTORY.CONTENT[light].on;
        if (!s || !o){continue;}
        let c = this.INVENTORY.CONTENT[light].color;
        if (!c){continue;}
        let b = this.INVENTORY.CONTENT[light].brightness;
        if(!b){b = 0;};
        if (typeof b == "string"){b = parseInt(b, 10);}
        let bc = this.INVENTORY.CONTENT[light].brightness_correction;
        if(!bc){bc = 0;};

        let trans_time = Math.floor((this.INTERVAL / 100) -1);
        if (trans_time < 1){trans_time = 1;}

        if (c.rgb.join("_") == "0_0_0")
        {
          HUER.REQUESTS.SET.LIGHT(light, {"xy": [0.1,0.1], "bri": 10, "transitiontime": trans_time} );
          continue;
        }
        let subj_brightness = Math.floor((0.21 * c.rgb[0]) + (0.72 * c.rgb[1]) + (0.07 * c.rgb[02]));
        let effective_brightness = subj_brightness + b + bc;
        if (effective_brightness < 0){effective_brightness = 0;}
        if (effective_brightness > 255){effective_brightness = 255;}
        HUER.REQUESTS.SET.LIGHT(light, {"xy": c.xy, "bri": effective_brightness, "transitiontime": trans_time} );
      }
    },
    INVENTORY :
    {
      CONTENT : {},
      FILLWITHALL : function ()
      {
        for (let light in HUER.INVENTORY.LIGHTS.CONTENT)
        {
          this.CONTENT[light] = {};
          this.CONTENT[light].sync = false;
        }
      },
      SETLIGHTSETTINGS : function (light_id, settings)
      {
        for (let prop in settings)
        {
          if (!this.CONTENT[light_id]){this.CONTENT[light_id] = {};};
          this.CONTENT[light_id][prop] = settings[prop];
        }
      }
    }
  },
  REQUEST: async function (method, url, body, head)
    {
      let m = method, u = url, b =body, h = head;
      let response = await new Promise(resolve =>
      {
       var xhr = new XMLHttpRequest();
       xhr.open(m, u);
       xhr.timeout = 2000;
       xhr.ontimeout = function(e)
       {
         resolve(
           {
             "success": false,
             "error": "timeout",
             "reason": "probably wrong ip"
           }
         );
         xhr.abort();
       };
       xhr.onload = function(e)
       {
         let rspns = JSON.parse(xhr.response);
         for (let r in rspns)
         {
           if (rspns[r].error)
           {
             let err_msg = rspns[r].error.type + " " + rspns[r].error.description + " at " + rspns[r].error.address + " with body " + b;
             HUER.NOTIFYONERROR(err_msg);
           }
         }
        resolve(JSON.parse(xhr.response));
       };
       xhr.onerror = function ()
       {
         resolve
         (
           {
             "success": false,
             "error": "something unexpected",
             "reason": "An error occurred during the XMLHttpRequest"
           }
         );
         console.error("** An error occurred during the XMLHttpRequest");
       };
       if (h) //falls header, ist aber noch falsch as you can see
       {
         for (let header in h)
         {
           xhr.setRequestHeader(header, header[h]);
         }

       }
       if (b) //falls body
       {
         xhr.send(b);
       }
       else
       {
         xhr.send();
       }
     });
     return response;
   },
   REQUESTS:
   {
     GET:
     {
       CONFIG : async function (){return await HUER.REQUEST("GET", HUER.URL.CONFIG());},
       LOGIN : async function (){return await HUER.REQUEST("GET", HUER.URL.LOGIN());},
       CONFIG_WRONG_IP : async function (){return await HUER.REQUEST("GET", HUER.URL.CONFIG_WRONG_IP());},
       CONFIG_WRONG_KEY : async function (){return await HUER.REQUEST("GET", HUER.URL.CONFIG_WRONG_KEY());},
       LIGHTS : async function (){return await HUER.REQUEST("GET", HUER.URL.LIGHTS());},
       GROUPS : async function (){return await HUER.REQUEST("GET", HUER.URL.GROUPS());},
       CLIPV : async function (){return await HUER.REQUEST("GET", "https://"+HUER.IP+"/clip/v2/resource/device"), false, false;},
       ENTERTAINMENT: async function () {return await HUER.REQUEST("GET", HUER.URL.ENTERTAINMENT(), false, true);}
     },
     SET:
     {
       NEW_USER: async function (value){return await HUER.REQUEST("POST", HUER.URL.API(), HUER.BODY.NEW_USER(value));},
       LIGHT : async function (light_id, object){return await HUER.REQUEST("PUT", HUER.URL.LIGHT(light_id), HUER.BODY.PROPERTY(object));},
       LIGHT_OFFON : async function (light_id, value){return await HUER.REQUEST("PUT", HUER.URL.LIGHT(light_id), HUER.BODY.PROPERTY({"on": value}));},
       LIGHT_STATE_ALERT : async function (light_id, value){return await HUER.REQUEST("PUT", HUER.URL.LIGHT(light_id), HUER.BODY.STATE_ALERT(value));},
       LIGHT_BRIGHTNESS : async function (light_id, value){return await HUER.REQUEST("PUT", HUER.URL.LIGHT(light_id), HUER.BODY.BRIGHTNESS(value));},
       LIGHT_XY : async function (light_id, value){return await HUER.REQUEST("PUT", HUER.URL.LIGHT(light_id), HUER.BODY.XY(value));},
       LIGHT_XYBRI : async function (light_id, xy, bri){return await HUER.REQUEST("PUT", HUER.URL.LIGHT(light_id), HUER.BODY.XYBRI(xy, bri));},
       LIGHT_XYBRI_QUICK : function (light_id, xy, bri){HUER.QUICKREQUEST("PUT", HUER.URL.LIGHT(light_id), HUER.BODY.XYBRI(xy, bri));}
      }
   },
   URL:
   {
     CONFIG : function (){return ("https://"+HUER.IP+"/api/"+HUER.KEY+"/config")},
     LOGIN : function (){return ("https://"+HUER.IP+"/api/"+HUER.KEY)},
     API: function () {return "https://"+HUER.IP+"/api"},
     CONFIG_WRONG_IP : function (){return ("https://192.168.0.98/api/"+HUER.KEY+"/config")},
     CONFIG_WRONG_KEY : function (){return ("https://"+HUER.IP+"/api/key123456")},
     LIGHTS : function (){return ("http://"+HUER.IP+"/api/"+HUER.KEY+"/lights")},
     LIGHT: function (light_id){return ("http://"+HUER.IP+"/api/"+HUER.KEY+"/lights/"+light_id+"/state")},
     GROUPS : function (){return ("http://"+HUER.IP+"/api/"+HUER.KEY+"/groups")},
     ENTERTAINMENT : function (){return ("https://"+HUER.IP+"/clip/v2/resource/entertainment_configuration")}
   },
   BODY :
   {
     PROPERTY: function(object){return JSON.stringify(object)},
     NEW_USER: function (value){return JSON.stringify({"devicetype": value})},
     BRIGHTNESS : function (value) {return JSON.stringify({"on": true, "bri": value})},
     XY : function (array) {return JSON.stringify({"xy": array})},
     XYBRI : function (array, value) {return JSON.stringify({"xy": array, "bri": value, "transitiontime":1})},
     STATE_ALERT : function (value) {return JSON.stringify({"alert": value, "transitiontime":1})}
   },
   HEAD :
   {
     ENTERTAINMENT : function () {return JSON.stringify({"hue-application-key": HUER.KEY})}
   },
   GENERICS:
   {
     GETPROPLIST : function (obj)
     {
       let list = [];
       for (var prop in obj)
       {
         list.push(prop)
       };
       return list;
     },
     GETVALUELIST : function (obj, prop)
     {
       let list = [];
       for (var lg in obj)
       {
         list.push(obj[lg][prop]);
       }
       return list;
     },
     GETNAMELIST : function (obj)
     {
       let list = [];
       for (var lg in obj)
       {
         list.push(obj[lg].name);
       }
       return list;
     }
   }
  }
