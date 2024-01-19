const COLORCONVERT =
{
  RGBTOHEX: function (r, g, b)
  {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  },
  RGBTOXY : function (r,g,b)
    {
    // set RGB values and divide by 255 to convert to a number less than 1;
    // the setting below will set the bulbs to blue. Change the numerator on each line
    // to alter the colour the bulbs are set to.
    // below code will set the bulbs to be blue
    let red = r / 255;
    let green = g / 255;
    let blue = b / 255;

    if (red > 0.04045){
    red = Math.pow((red + 0.055) / (1.0 + 0.055), 2.4);
    }
    else red = (red / 12.92);

     if (green > 0.04045){
    green = Math.pow((green + 0.055) / (1.0 + 0.055), 2.4);
    }
    else green = (green / 12.92);

    if (blue > 0.04045){
    blue = Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4);
    }
    else blue = (blue / 12.92);

    let X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
    let Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
    let Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
    let x = X / (X + Y + Z);
    let y = Y / (X + Y + Z);

    let xy = [x,y]
    return xy
    }

}
