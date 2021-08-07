// shadow map example

// two objects: a rotatable cube and triangle
// point light source behind triangle

"use strict";

var canvas;
var gl;

window.onload = init;

var numCubeVertices  = 36;
var numTriangleVertices = 3;

var triangleInstanceMatrix, cubeInstanceMatrix;
var projectionMatrix;
var cameraViewMatrix;
var lightProjectionMatrix;
var lightViewMatrix;

var vPosition;

// initial cube rotation axis and angle

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 45, 0];

// cube rotation flag

var flag = false;

var vBuffer, cBuffer;
var framebuffer, renderbuffer;
var texture1;
var buffer1, buffer2, buffer3;

var program1, program2;

var positionsArray = [];
var colorsArray = [];

// object vertex and color data

var cubeVertices = [
    vec4(-0.5, -0.5, 0.5, 1.2),
    vec4(-0.5, 0.5, 0.5, 1.2),
    vec4(0.5, 0.5, 0.5, 1.2),
    vec4(0.5, -0.5, 0.5, 1.2),
    vec4(-0.5, -0.5, -0.5, 1.2),
    vec4(-0.5, 0.5, -0.5, 1.2),
    vec4(0.5, 0.5, -0.5, 1.2),
    vec4(0.5, -0.5, -0.5, 1.2)
];

var cubeColors = [
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

var triangleVertices = [
    vec4(0.0, 1.0, 1.0, 1.0),
    vec4(0.25, 0.5, 1.0, 1.0),
    vec4(-0.25, 0.5, 1.0, 1.0)
];

var triangleColor = vec4(0.5, 0.5, 0.0, 1.0);

// functions to generate buffer data for objects

init();

function quad(a, b, c, d) {
     positionsArray.push(cubeVertices[a]);
     colorsArray.push(cubeColors[a]);
     positionsArray.push(cubeVertices[b]);
     colorsArray.push(cubeColors[a]);
     positionsArray.push(cubeVertices[c]);
     colorsArray.push(cubeColors[a]);
     positionsArray.push(cubeVertices[a]);
     colorsArray.push(cubeColors[a]);
     positionsArray.push(cubeVertices[c]);
     colorsArray.push(cubeColors[a]);
     positionsArray.push(cubeVertices[d]);
     colorsArray.push(cubeColors[a]);
}

function colorCube()
{
    quad(0, 1, 5, 4);
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(4, 5, 6, 7);
    quad(5, 1, 2, 6);
}

function triangle(a, b, c) {

     positionsArray.push(triangleVertices[a]);
     colorsArray.push(triangleColor);
     positionsArray.push(triangleVertices[b]);
     colorsArray.push(triangleColor);
     positionsArray.push(triangleVertices[c]);
     colorsArray.push(triangleColor);
}

function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);

    gl.enable(gl.DEPTH_TEST);

// Create an empty texture

    texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// Buttons

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

// generate cube and triangle data

    colorCube();
    triangle(0, 1, 2);

//  Load shaders and initialize attribute buffers

    program1 = initShaders(gl, "vertex-shader-1", "fragment-shader-1");
    program2 = initShaders(gl, "vertex-shader-2", "fragment-shader-2");


    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program1, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    buffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var shaderPositionLoc = gl.getAttribLocation(program2, "aPosition");
    gl.vertexAttribPointer(shaderPositionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderPositionLoc);

    var buffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var shaderColorLoc = gl.getAttribLocation( program2, "aColor");
    gl.vertexAttribPointer(shaderColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderColorLoc);

    render();
}

function render() {

// First render the objects from the light's persepctive
// Render into texture so we can save the distances from camera

// Allocate a frame buffer object

    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    framebuffer.width = 1024;
    framebuffer.height = 1024;

    renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1024, 1024);

    // Attach color buffer

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    // check for completeness

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');


    gl.useProgram(program1);

// light projection and modelview matrices

    var fovy = 45.0;
    var near = 3.0;
    var far = 10.0;
    var aspect = 1.0;

   lightProjectionMatrix = perspective(fovy, aspect, near, far);

    var lightPosition = vec3(1.0, 3.0, 5.0);

    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);

    lightViewMatrix = lookAt(lightPosition, at, up);

    gl.uniformMatrix4fv(gl.getUniformLocation(program1,
            "uProjectionMatrix"), false, flatten(lightProjectionMatrix));

    gl.uniformMatrix4fv(gl.getUniformLocation(program1,
            "uModelViewMatrix"), false, flatten(lightViewMatrix));

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// update cube rotation matrix (its instance transformation) then render ccube


    if(flag) theta[axis] += 0.5;

    cubeInstanceMatrix = mat4();
    cubeInstanceMatrix = mult(cubeInstanceMatrix, rotateX(theta[xAxis] ));
    cubeInstanceMatrix = mult(cubeInstanceMatrix, rotateY(theta[yAxis]));
    cubeInstanceMatrix = mult(cubeInstanceMatrix, rotateZ(theta[zAxis]));
    gl.uniformMatrix4fv( gl.getUniformLocation(program1,
            "uInstanceMatrix"), false, flatten(cubeInstanceMatrix) );

    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

// don't rotate traingle and render it

    triangleInstanceMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program1,
            "uInstanceMatrix"), false, flatten(triangleInstanceMatrix));

    gl.drawArrays(gl.TRIANGLES, numCubeVertices, numTriangleVertices);

// release buffers

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

//  second render from camera view pointsArray
// need matrices for both views so we can compare distances

    gl.useProgram(program2);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.viewport(0, 0, 1024, 1024);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(gl.getUniformLocation(program2,
            "uLightProjectionMatrix"), false, flatten(lightProjectionMatrix));

     gl.uniformMatrix4fv(gl.getUniformLocation(program2,
            "uLightViewMatrix"), false, flatten(lightViewMatrix));

// modelView and projection matrices for camera viewpor

    projectionMatrix = ortho(-1, 1, -1, 1, -5, 5);

    gl.uniformMatrix4fv(gl.getUniformLocation(program2,
            "uProjectionMatrix"), false, flatten(projectionMatrix));

    cameraViewMatrix = mat4();

     var cameraLoc = vec3(0, 1, 1);
     var cameraAt = vec3(0, 0, 0);
     var cameraUp = vec3(0, 1, 0);

    cameraViewMatrix = lookAt(cameraLoc, cameraAt, cameraUp);

    gl.uniformMatrix4fv(gl.getUniformLocation(program2,
            "uModelViewMatrix"), false, flatten(cameraViewMatrix));

    gl.uniformMatrix4fv(gl.getUniformLocation(program2,
            "uInstanceMatrix"), false, flatten(cubeInstanceMatrix));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices);


    gl.uniformMatrix4fv(gl.getUniformLocation(program2,
            "uInstanceMatrix"), false, flatten(triangleInstanceMatrix));
    gl.drawArrays(gl.TRIANGLES, numCubeVertices, numTriangleVertices);

    requestAnimationFrame(render);

}
