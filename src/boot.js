const BOOT =
{
  FILEPATH:
  {
    CONFIG: "config.json",
    LAST_STATE: "last_state.json"
  },
  READCONFIG : async function ()
  {
    let c = {};
    c.success = false;
    let txt = await electronAPI.readFile(this.FILEPATH.CONFIG);
    if (typeof txt == "object")
    {
      c.reason = txt;
    }
    else
    {
      try
      {
        c.content = JSON.parse(txt);
        c.success = true;
      }
      catch(e)
      {
        c.reason = e.message;
        c.success = false;
      }
    }
    return c;
  },
  WRITECONFIG:  function (ip, key)
  {
    let config ={};
    config.ip = ip;
    config.key = key;
    electronAPI.writeFile(this.FILEPATH.CONFIG, JSON.stringify(config));
  },
  READLASTSTATE: async function ()
  {
    let ls = {};
    ls.success = false;
    let txt = await electronAPI.readFile(this.FILEPATH.LAST_STATE);
    if (typeof txt == "object")
    {
      ls.reason = txt;
    }
    else
    {
      ls.success = true;
      ls.content = JSON.parse(txt);
    }
    return ls;
  },
  WRITELASTSTATE: async function (stateobject)
  {
    electronAPI.writeFile(this.FILEPATH.LAST_STATE, JSON.stringify(stateobject));
  },
  UP : async function ()
  {
    let bootup = {};
    bootup.success = false;
    let c = await this.READCONFIG();
    if (!c.success)
    {
      bootup.reason = "no config found"
      return bootup;
    }
    else
    {
      HUER.IP = c.content.ip;
      HUER.KEY = c.content.key;
      let login = await BOOT.LOGIN();
      if (!login.success)
      {
        bootup.reason = login.reason;
        return bootup;
      }
      bootup.success = true;
      return bootup;
    }
  },
  LOGIN : async function ()
  {
    let login_attempt = await HUER.TEST_LOGIN();
    let attempt = {};
    attempt.success = false;
    if (login_attempt && JSON.stringify(login_attempt).indexOf("config") > -1)
    {
      attempt.success = true;
    }
    else if (JSON.stringify(login_attempt).indexOf("timeout") > -1)
    {
      attempt.reason = "timeout, probably wrong ip";
    }
    else
    {
      attempt.reason = "wrong key";
    }
    return attempt;
  }
}
