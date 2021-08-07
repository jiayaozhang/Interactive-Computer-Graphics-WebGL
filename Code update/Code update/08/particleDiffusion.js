"use strict";

var t1, t2;
t1 = new Date();

var canvas;
var gl;

var flag = true;

var texSize = 1024;
var numPoints = 1000;
var diffuse = 4.0;
var pointSize = 10.0;



var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 0),
    vec2(1, 1)
];

var vertices = [
    vec2(-1.0, -1.0),
    vec2(-1.0, 1.0),
    vec2(1.0, -1.0),
    vec2(1.0, 1.0)
];

var program1, program2;
var framebuffer;
var texture1, texture2;

var buffer;
var position1Loc, position2Loc;
var texCoordLoc;
var texLoc;

init();

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, texSize, texSize);
    gl.activeTexture(gl.TEXTURE0);

    texture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

    gl.bindTexture(gl.TEXTURE_2D, texture2);

    //
    //  Load shaders and initialize attribute buffers
    //

    program1 = initShaders(gl, "vertex-shader1", "fragment-shader1");
    program2 = initShaders(gl, "vertex-shader2", "fragment-shader2");

    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);
    framebuffer.width = texSize;
    framebuffer.height = texSize;

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture2, 0);

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status != gl.FRAMEBUFFER_COMPLETE) alert('Framebuffer Not Complete');

    for(var i = 0; i<numPoints; i++)
         vertices[4+i] = vec2(2.0*Math.random()-1.0, 2.0*Math.random()-1.0);


    buffer = gl.createBuffer();

    gl.useProgram(program2);

    gl.uniform1f(gl.getUniformLocation(program2, "uPointSize"), pointSize);
    gl.uniform4f(gl.getUniformLocation(program2, "uColor"), 0.0, 0.0, 0.9, 1.0);

    gl.useProgram(program1);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 64+8*numPoints, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    gl.bufferSubData(gl.ARRAY_BUFFER, 32+8*numPoints, flatten(texCoord));

    // buffers and vertex arrays


    position1Loc = gl.getAttribLocation(program1, "aPosition1");
    gl.enableVertexAttribArray(position1Loc);
    gl.vertexAttribPointer(position1Loc, 2, gl.FLOAT, false, 0,0);

    texCoordLoc = gl.getAttribLocation(program1, "aTexCoord");
    gl.enableVertexAttribArray(texCoordLoc);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 32+8*numPoints);

    gl.uniform1i( gl.getUniformLocation(program1, "uTexture"), 0);
    gl.uniform1f( gl.getUniformLocation(program1, "uDistance"), 1/texSize);
    gl.uniform1f( gl.getUniformLocation(program1, "uScale"), diffuse);

    gl.useProgram(program2);

    position2Loc = gl.getAttribLocation(program2, "aPosition2");
    gl.enableVertexAttribArray(position2Loc);
    gl.vertexAttribPointer(position2Loc, 2, gl.FLOAT, false, 0,0);

    gl.useProgram(program1);

    gl.bindTexture(gl.TEXTURE_2D, texture2);

    render();
}

function render(){

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

    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status != gl.FRAMEBUFFER_COMPLETE) alert('Framebuffer Not Complete');

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    gl.useProgram(program2);
    gl.enableVertexAttribArray( position2Loc );
    gl.vertexAttribPointer( position2Loc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f( gl.getUniformLocation(program2, "uColor"), 0.9, 0.0, 0.9, 1.0);
    gl.drawArrays(gl.POINTS, 4, numPoints/2);
    gl.uniform4f( gl.getUniformLocation(program2, "uColor"), 0.0, 9.0, 0.0, 1.0);
    gl.drawArrays(gl.POINTS, 4+numPoints/2, numPoints/2);

    gl.useProgram(program1);
    gl.enableVertexAttribArray( texCoordLoc );
    gl.enableVertexAttribArray( position1Loc );
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 32+8*numPoints);
    gl.vertexAttribPointer(position1Loc, 2, gl.FLOAT, false, 0, 0);


// render to display

    gl.useProgram(program1);

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if(flag) gl.bindTexture(gl.TEXTURE_2D, texture2);
      else gl.bindTexture(gl.TEXTURE_2D, texture1);

    var r = 1024/texSize;
    gl.viewport(0, 0, r*texSize, r*texSize);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.viewport(0, 0, texSize, texSize);

    gl.useProgram(program2);

// move particles in a random direction
// wrap arounds


    for(var i=0; i<numPoints; i++) {
        vertices[4+i][0] += 0.01*(2.0*Math.random()-1.0);
        vertices[4+i][1] += 0.01*(2.0*Math.random()-1.0);
        if(vertices[4+i][0]>1.0) vertices[4+i][0]-= 2.0;
        if(vertices[4+i][0]<-1.0) vertices[4+i][0]+= 2.0;
        if(vertices[4+i][1]>1.0) vertices[4+i][1]-= 2.0;
        if(vertices[4+i][1]<-1.0) vertices[4+i][1]+= 2.0;

    }

    gl.bufferSubData(gl.ARRAY_BUFFER,  0, flatten(vertices));

// swap textures

    flag = !flag;
    requestAnimationFrame(render);
}
