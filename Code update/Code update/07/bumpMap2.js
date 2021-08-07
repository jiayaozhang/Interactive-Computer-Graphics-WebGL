"use strict";

var canvas;
var gl;

var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI/180.0;

var texSize = 256;

// Bump Data

var data = new Array()
    for (var i = 0; i<= texSize; i++)  data[i] = new Array();
    for (var i = 0; i<= texSize; i++) for (var j=0; j<=texSize; j++)
        data[i][j] = rawData[i*256+j];


// Bump Map Normals

var normalst = new Array()
    for (var i=0; i<texSize; i++)  normalst[i] = new Array();
    for (var i=0; i<texSize; i++) for ( var j = 0; j < texSize; j++)
        normalst[i][j] = new Array();
    for (var i=0; i<texSize; i++) for ( var j = 0; j < texSize; j++) {
        normalst[i][j][0] = data[i][j]-data[i+1][j];
        normalst[i][j][1] = data[i][j]-data[i][j+1];
        normalst[i][j][2] = 1;
    }

// Scale to Texture Coordinates

    for (var i=0; i<texSize; i++) for (var j=0; j<texSize; j++) {
       var d = 0;
       for(k=0;k<3;k++) d+=normalst[i][j][k]*normalst[i][j][k];
       d = Math.sqrt(d);
       for(k=0;k<3;k++) normalst[i][j][k]= 0.5*normalst[i][j][k]/d + 0.5;
    }

// Normal Texture Array

var normals = new Uint8Array(3*texSize*texSize);

    for (var i = 0; i < texSize; i++)
        for (var j = 0; j < texSize; j++)
           for(var k =0; k<3; k++)
                normals[3*texSize*i+3*j+k] = 255*normalst[i][j][k];


var positionsArray = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(1, 1),
    vec2(0, 1)
];

var vertices = [
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(1.0,  0.0,  0.0, 1.0),
    vec4(1.0,  0.0,  1.0, 1.0),
    vec4(0.0, 0.0,  1.0, 1.0)
];

var modelViewMatrix, projectionMatrix, nMatrix;


var normal = vec4(0.0, 1.0, 0.0, 0.0);
var tangent = vec3(1.0, 0.0, 0.0);

var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);

var materialDiffuse = vec4(0.7, 0.7, 0.7, 1.0);

var program;

init();

function configureTexture( image ) {
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

}


function mesh() {
     positionsArray.push(vertices[0]);
     texCoordsArray.push(texCoord[0]);

     positionsArray.push(vertices[1]);
     texCoordsArray.push(texCoord[1]);

     positionsArray.push(vertices[3]);
     texCoordsArray.push(texCoord[3]);

     positionsArray.push(vertices[2]);
     texCoordsArray.push(texCoord[2]);
}

function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    mesh();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation( program, "aTexCoord");
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    configureTexture(normals);

    var diffuseProduct = mult(lightDiffuse, materialDiffuse);

    gl.uniform4fv( gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct);
    gl.uniform4fv( gl.getUniformLocation(program, "uNormal"), normal);
    gl.uniform3fv( gl.getUniformLocation(program, "uObjTangent"), tangent);


    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};

    render();
}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var lightPosition = vec4(0.0, 2.0, 0.0, 1.0 );

    lightPosition[1] = 2.0*Math.cos(theta);
    gl.uniform4fv( gl.getUniformLocation(program, "uLightPosition"), lightPosition);


    var eye = vec3(2.0, 3.0*(1.0+Math.cos(phi)), 2.0);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);

    modelViewMatrix  = lookAt(eye, at, up);
    projectionMatrix = ortho(-1.2, 1.2, -1.2, 1.2,-10.0,10.0);

    var nMatrix = normalMatrix(modelViewMatrix, true);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));
    gl.uniformMatrix3fv( gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));


    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
}
