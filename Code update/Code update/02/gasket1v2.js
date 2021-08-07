"use strict";

var gl;
var positions = [];

var numPositions = 5000;

init();

function init()
{
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert( "WebGL 2.0 isn't available" );


    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    var vertices = [
        vec2(-1, -1),
        vec2(0,  1),
        vec2(1, -1)
    ];

    // Next, generate the rest of the points, by first finding a random position
    //  within our gasket boundary.  We use Barycentric coordinates
    //  (simply the weighted average of the corners) to find the position

    var coeffs = vec3(Math.random(), Math.random(), Math.random());


    var a = mult(coeffs[0], vertices[0]);
    var b = mult(coeffs[1], vertices[1]);
    var c = mult(coeffs[2], vertices[2]);

    var p = add(a, add(b, c));

    // Add our randomly chosen position into our array of positions
    positions.push(p);

    for (var i = 0; positions.length < numPositions; ++i) {
        var j = Math.floor(3*Math.random());

        p = add(positions[i], vertices[j]);
        p = mult(0.5, p);
        positions.push(p);
    }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "shaders/vshader21.glsl",
                               "shaders/fshader21.glsl");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};


function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, positions.length);
}
