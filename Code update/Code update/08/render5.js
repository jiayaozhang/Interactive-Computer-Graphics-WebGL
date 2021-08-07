"use strict";

var canvas;
var gl;


var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 1),
    vec2(1, 0),
    vec2(0, 0)
];

var vertices = [
    vec2(-1, -1),
    vec2(-1,  1),
    vec2(1, 1),
    vec2(1, 1),
    vec2(1, -1),
    vec2(-1, -1)
];

var positionsArray = [];

var flag = true;

var program1, program2;
var framebuffer;
var texture1, texture2;
var buffer1, buffer2, buffer3;

init();

function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }


// Create two empty textures

    texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// Allocate a frame buffer object

   framebuffer = gl.createFramebuffer();
   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
   framebuffer.width = 1024;
   framebuffer.height = 1024;


// Attach color buffer

   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);

// check for completeness

   var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
   if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');

    //
    //  Load shaders and initialize attribute buffers
    //
    program1 = initShaders(gl, "vertex-shader1", "fragment-shader1");
    program2 = initShaders(gl, "vertex-shader2", "fragment-shader2");

    gl.useProgram(program1);

    var vertices2 = [
        vec2(-1.0, -1.0),
        vec2(0.0, 1.0),
        vec2(1.0, -1.0)
    ];

    positionsArray.push( vertices2[0]);
    positionsArray.push( vertices2[1]);
    positionsArray.push( vertices2[2]);
;


//______________________________________________

    // Create and initialize a buffer object

    buffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program1, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Bind FBO and render

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);


    gl.viewport(0, 0, 1024, 1024);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT );

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    //gl.drawArrays(gl.POINTS, 0, 1);

    // Bind to window system frame buffer, unbind the texture

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    gl.useProgram(program2);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture1);

    // send data to GPU for normal render

    buffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program2, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    buffer3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer3);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program2, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    gl.uniform1i(gl.getUniformLocation(program2, "uTextureMap"), 0);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.viewport(0, 0, 1024, 1024);


    render();

}


function render() {

   // render to texture

    gl.useProgram(program1);

    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);

    if(flag) {
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture2, 0);

    }
    else {
        gl.bindTexture(gl.TEXTURE_2D, texture2);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0);
    }

    gl.useProgram(program2);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if(flag) gl.bindTexture(gl.TEXTURE_2D, texture2);
    else gl.bindTexture(gl.TEXTURE_2D, texture1);

    gl.clear( gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    flag = !flag

    requestAnimationFrame(render);
}
