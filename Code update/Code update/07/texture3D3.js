"use strict";

var canvas;
var gl;

var numPositions  = 18;

var texSize = 128;

var flag = false;
var flagX = true;
var flagY = true;
var flagZ = true;

var hx = 0.0;
var hy = 0.0;
var hz = 0.0;


var image3 = new Uint8Array(4*texSize*texSize*texSize);

// 3D texture

// solid sphere

for(var i=0; i<texSize; i++)
    for(var j=0; j<texSize; j++)
        for(var k=0; k<texSize; k++) {
          var x = i-texSize/2;
          var y = j-texSize/2;
          var z = k-texSize/2;
          if(x*x+y*y+z*z<0.16*texSize*texSize) {

            //radial color: green at center, red at outside
               var r = Math.sqrt(x*x+y*y+z*z);
               image3[4*(i+texSize*j+texSize*texSize*k)] = 510*r/texSize;
               image3[4*(i+texSize*j+texSize*texSize*k)+1] = 255 - 510*r/texSize;
               image3[4*(i+texSize*j+texSize*texSize*k)+2] = 0;

           // RGB in xyz directions

               //image3[4*(i+texSize*j+texSize*texSize*k)] = 510*Math.abs(x)/texSize;
               //image3[4*(i+texSize*j+texSize*texSize*k)+1] = 510*Math.abs(y)/texSize;
               //image3[4*(i+texSize*j+texSize*texSize*k)+2] = 510*Math.abs(z)/texSize;

             }

          // black outside sphere

             else {
               image3[4*(i+texSize*j+texSize*texSize*k)] = 0 ;
               image3[4*(i+texSize*j+texSize*texSize*k)+1] = 0;
               image3[4*(i+texSize*j+texSize*texSize*k)+2] = 0;
             }
             image3[4*(i+texSize*j+texSize*texSize*k)+3] = 255;
   }

var positionsArray = [];

// vertices for three orthogonal quads

var vertices = [
    vec4(-0.5, -0.5, hz, 1.0),
    vec4(-0.5, 0.5, hz, 1.0),
    vec4(0.5, 0.5, hz, 1.0),
    vec4(0.5, -0.5, hz, 1.0),

    vec4(-0.5, hy, -0.5, 1.0),
    vec4(-0.5, hy, 0.5, 1.0),
    vec4(0.5, hy, 0.5, 1.0),
    vec4(0.5, hy, -0.5, 1.0),

    vec4(hx, -0.5, -0.5, 1.0),
    vec4(hx, -0.5, 0.5, 1.0),
    vec4(hx, 0.5, 0.5, 1.0),
    vec4(hx, 0.5, -0.5, 1.0)
];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = vec3(45.0, 45.0, 45.0);

var thetaLoc;

init();

function quad(a, b, c, d) {
     positionsArray.push(vertices[a]);
     positionsArray.push(vertices[b]);
     positionsArray.push(vertices[c]);
     positionsArray.push(vertices[a]);
     positionsArray.push(vertices[c]);
     positionsArray.push(vertices[d]);
}


function orthogonalQuads()
{
    quad(1, 0, 3, 2);
    quad(5, 4, 7, 6);
    quad(9, 8, 11, 10);

}


function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    orthogonalQuads();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);


    var texture3D = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texture3D);
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA, texSize, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image3);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_3D);


    gl.uniform1i( gl.getUniformLocation(program, "uTextureMap3D"), 0);

    thetaLoc = gl.getUniformLocation(program, "uTheta");

    document.getElementById("toggleX").onclick = function(){flagX = !flagX};
    document.getElementById("toggleY").onclick = function(){flagY = !flagY};
    document.getElementById("toggleZ").onclick = function(){flagX = !flagZ};

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("xSlider").onchange = function(event) {
        hx = event.target.value;
        for(var i=8; i<12; i++) vertices[i][0] = hx;
        positionsArray = [];
        orthogonalQuads();
        gl.bufferData( gl.ARRAY_BUFFER, flatten(numPositions), gl.STATIC_DRAW);
    };
    document.getElementById("ySlider").onchange = function(event) {
        hy = event.target.value;
        for(var i=4; i<8; i++) vertices[i][1] = hy;
        positionsArray = [];
        orthogonalQuads();
        gl.bufferData( gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    };
    document.getElementById("zSlider").onchange = function(event) {
        hz = event.target.value;
        for(var i=0; i<4; i++) vertices[i][2] = hz;
        positionsArray = [];
        orthogonalQuads();
        gl.bufferData( gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    };

    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(flag) theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    if(flagX) gl.drawArrays( gl.TRIANGLES, 0, numPositions/3 );
    if(flagY) gl.drawArrays( gl.TRIANGLES, numPositions/3, numPositions/3 );
    if(flagZ) gl.drawArrays( gl.TRIANGLES, 2*numPositions/3, numPositions/3 );
    requestAnimationFrame(render);
}
