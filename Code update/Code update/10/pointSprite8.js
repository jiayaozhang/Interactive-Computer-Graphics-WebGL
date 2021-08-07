"use strict";

var canvas;
var gl;

var numVertices = 10000;
var vertices = new Float32Array(3*numVertices);
var colors = new Float32Array(3*numVertices);
var velocities = new Float32Array(3*numVertices);

var theta = 0.0;
var thetaLoc;

var timeLoc;
var time = 0;
var dt = 0.01;  //time increment

var t1 = new Date();
var t2;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    // gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // random initial positions, velocities and colors

  for(var i = 0; i<3*numVertices; i++) {
    vertices[i] = 2.0*(Math.random() - 0.5);
    colors[i] = Math.random();
    velocities[i] = 2.0*(Math.random() - 0.5);
  }

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    // same for colors and velocities

    var colorId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorId );
    gl.bufferData( gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var velocityId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, velocityId );
    gl.bufferData( gl.ARRAY_BUFFER, velocities, gl.STATIC_DRAW );

    var velocityLoc = gl.getAttribLocation( program, "aVelocity" );
    gl.vertexAttribPointer( velocityLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( velocityLoc );

    // theta gives lattitude of light source

    thetaLoc = gl.getUniformLocation( program, "theta" );

    // elapsed time

    timeLoc = gl.getUniformLocation( program, "time" );

    render();
};


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    // increment lattitude of light source and elapsed time

    theta += 0.1;
    gl.uniform1f( thetaLoc, theta );

    time += dt;
    gl.uniform1f(timeLoc, time);

    // compute frame rate

    t2 = new Date;
    console.log("fps = ", Math.floor( 1000/(t2.valueOf()-t1.valueOf())+0.5), "with ", numVertices, "vertices");
    t1 = t2;

    gl.drawArrays( gl.POINTS, 0, numVertices );

    requestAnimationFrame(render);
}
