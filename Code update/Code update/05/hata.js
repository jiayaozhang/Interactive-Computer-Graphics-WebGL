"use strict";

var hata = function() {

var nRows = 50;
var nColumns = 50;


// data for radial hat function: sin(Pi*r)/(Pi*r)


var data = new Array(nRows);
for(var i =0; i<nRows; i++) data[i]=new Array(nColumns);

for(var i=0; i<nRows; i++) {
    var x = Math.PI*(4*i/nRows-2.0);
    for(var j=0; j<nColumns; j++) {
        var y = Math.PI*(4*j/nRows-2.0);
        var r = Math.sqrt(x*x+y*y)

        // take care of 0/0 for r = 0


        if(r) data[i][j] = Math.sin(r)/r;
        else data[i][j] = 1;
    }
}



var positionsArray = [];

var canvas;
var gl;

var near = -10;
var far = 10;
var radius = 1.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var top = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

init();

function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

// vertex array of data for nRows and nColumns of line strips

    for(var i=0; i<nRows-1; i++) for(var j=0; j<nColumns-1;j++) {
        positionsArray.push(vec4(2*i/nRows-1, data[i][j], 2*j/nColumns-1, 1.0));
    }
    for(var j=0; j<nColumns-1; j++) for(var i=0; i<nRows-1;i++) {
        positionsArray.push(vec4(2*i/nRows-1, data[i][j], 2*j/nColumns-1, 1.0));
    }
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

// buttons for moving viewer and changing size

    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near  *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){radius *= 2.0;};
    document.getElementById("Button4").onclick = function(){radius *= 0.5;};
    document.getElementById("Button5").onclick = function(){theta += dr;};
    document.getElementById("Button6").onclick = function(){theta -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};
    document.getElementById("Button9").onclick = function(){left  *= 0.9; right *= 0.9;};
    document.getElementById("Button10").onclick = function(){left *= 1.1; right *= 1.1;};
    document.getElementById("Button11").onclick = function(){top  *= 0.9; bottom *= 0.9;};
    document.getElementById("Button12").onclick = function(){top *= 1.1; bottom *= 1.1;};

    render();
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, top, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

// render columns of data then rows

    for(var i=0; i<nRows-1; i++) gl.drawArrays( gl.LINE_STRIP, i*(nColumns-1), nColumns-1 );
    for(var i=0; i<nColumns-1; i++) gl.drawArrays( gl.LINE_STRIP, i*(nRows-1)+positionsArray.length/2, nRows-1 );



    requestAnimationFrame(render);
}

}

hata();
