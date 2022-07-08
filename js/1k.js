      var colpick = document.getElementById('xcol');
      var thiscol = document.getElementById('thiscol');
      var c = document.getElementById('c');
      var a = c.getContext('2d');
      colpick.clientWidth;

(function() {

    // Declare constants and variables to help with minification
    // Some of these are inlined (with comments to the side with the actual equation)
    var doc = document;
    doc.c = doc.createElement;
    
    var width = c.width = c.height = 210,
        input = colpick.appendChild(doc.c("input")),
        imageData = a.createImageData(width, width),
        pixels = imageData.data,
        oneHundred = input.value = input.max = 100,
        circleOffset = 10,
        diameter = 190,                  //width-circleOffset*2,
        radius = diameter/2,                    //diameter / 2,
        radiusPlusOffset = 105,          //radius + circleOffset
        radiusSquared = radius * radius,
        two55 = 255,
        currentY = oneHundred,
        currentX = -currentY,
        wheelPixel = circleOffset*4*width+circleOffset*4;              // circleOffset*4*width+circleOffset*4;
 
    // Math helpers
    var math = Math,
        PI = math.PI,
        PI2 = PI * 2,
        sqrt = math.sqrt,
        atan2 = math.atan2;
    
    // Setup DOM properties
    input.type = "range";
    
    // Load color wheel data into memory.
    for (y = input.min = 0; y < width; y++) {
        for (x = 0; x < width; x++) {
            var rx = x - radius,
                ry = y - radius,
                d = rx * rx + ry * ry,
                rgb = hsvToRgb(
                    (atan2(ry, rx) + PI) / PI2,     // Hue
                    sqrt(d) / radius,               // Saturation
                    1                               // Value
                );

            // Print current color, but hide if outside the area of the circle
            pixels[wheelPixel++] = rgb[0];
            pixels[wheelPixel++] = rgb[1];
            pixels[wheelPixel++] = rgb[2];
            pixels[wheelPixel++] = d > radiusSquared ? 0 : two55;
        }
    }
    
    // Bind Event Handlers
    input.onchange = redraw;
    c.onmousedown = doc.onmouseup = function(e) {
        // Unbind mousemove if this is a mouseup event, or bind mousemove if this a mousedown event
        doc.onmousemove = /p/.test(e.type) ? 0 : (redraw(e), redraw);
    }

    // Handle manual calls + mousemove event handler + input change event handler all in one place.
    function redraw(e) {
    
        // Only process an actual change if it is triggered by the mousemove or mousedown event.
        // Otherwise e.pageX will be undefined, which will cause the result to be NaN, so it will fallback to the current value
        currentX = e.pageX - c.offsetLeft - radiusPlusOffset || currentX;
        currentY = e.pageY - c.offsetTop - radiusPlusOffset  || currentY;
        
        // Scope these locally so the compiler will minify the names.  Will manually remove the 'var' keyword in the minified version.
        var theta = atan2(currentY, currentX),
            d = currentX * currentX + currentY * currentY;
        
        // If the x/y is not in the circle, find angle between center and mouse point:
        //   Draw a line at that angle from center with the distance of radius
        //   Use that point on the circumference as the draggable location
        if (d > radiusSquared) {
            currentX = radius * math.cos(theta);
            currentY = radius * math.sin(theta);
            theta = atan2(currentY, currentX);
            d = currentX * currentX + currentY * currentY;
        }
        
        // gen colour
        // document.body.style.background = hsvToRgb(

        thiscol.style.background = hsvToRgb(
            (theta + PI) / PI2,         // Current hue (how many degrees along the circle)
            sqrt(d) / radius,           // Current saturation (how close to the middle)
            input.value / oneHundred    // Current value (input type="range" slider value)
        )[3];
        
 // if setcol is on, set body col
        if (xcol.classList != 'hide') {
            document.body.style.background = hsvToRgb(
                (theta + PI) / PI2,         // Current hue (how many degrees along the circle)
                sqrt(d) / radius,           // Current saturation (how close to the middle)
                input.value / oneHundred    // Current value (input type="range" slider value)
            )[3];
        }


        // Reset to color wheel and draw a spot on the current location. 
        a.putImageData(imageData, 0, 0);

        // stroke wheel
        a.beginPath();
        a.arc(105, 105, radius, 0, 2 * Math.PI, false);
        a.lineWidth = 3;
        a.strokeStyle = 'rgba(0,0,0,0.1)';
        a.stroke();

                
        // cursor picker
        a.beginPath();  
        a.strokeStyle = 'rgba(0,0,0,0.3)';
        a.lineWidth = 5;
        a.arc(~~currentX+radiusPlusOffset,~~currentY+radiusPlusOffset, 8, 0, PI2);
        a.stroke();

        a.beginPath();  
        a.strokeStyle = '#fff';
        a.lineWidth = 3;
        a.arc(~~currentX+radiusPlusOffset,~~currentY+radiusPlusOffset, 8, 0, PI2);
        a.stroke();        
        
    }
    
    // Created a shorter version of the HSV to RGB conversion function in TinyColor
    // https://github.com/bgrins/TinyColor/blob/master/tinycolor.js
    function hsvToRgb(h, s, v) {
        h*=6;
        var i = ~~h,
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod] * two55,
            g = [t, v, v, q, p, p][mod] * two55,
            b = [p, p, t, v, v, q][mod] * two55;
        
        return [r, g, b, "rgb("+ ~~r + "," + ~~g + "," + ~~b + ")"];
    }
    
    // Kick everything off
    redraw(0);
})();