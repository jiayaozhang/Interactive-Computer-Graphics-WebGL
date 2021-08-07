"use strict";

var canvas;
var gl;

var theta = 0.0;
var angle = 0.0;
var thetaLoc, angleLoc;

var texSize = 64;

var texture1, texture2, texture3, texture4;

// Create a checkerboard pattern using floats


var checkerboard = new Array()
    for (var i =0; i<2*texSize; i++)  checkerboard[i] = new Array();
    for (var i =0; i<2*texSize; i++)
        for ( var j = 0; j < 2*texSize; j++)
           checkerboard[i][j] = new Float32Array(4);
    for (var i =0; i<2*texSize; i++) for (var j=0; j<2*texSize; j++) {
        var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
        if((i<texSize)&&(j<texSize))
         checkerboard[i][j] = [c, 0, c, 1];
        else if(i<texSize&&j>texSize) checkerboard[i][j] = [0, 0, c, 1];
        else if (i>texSize&&j<texSize) checkerboard[i][j] = [0, c, 0, 1];
        else  if(i>texSize&&j>texSize)checkerboard[i][j] = [c, 0, 0, 1];
    }

// Convert floats to ubytes for texture

var image1 = new Uint8Array(4*texSize*texSize);
var image2 = new Uint8Array(4*texSize*texSize);
var image3 = new Uint8Array(4*texSize*texSize);
var image4 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ )
        for ( var j = 0; j < texSize; j++ )
           for(var k =0; k<4; k++) {
                image1[4*texSize*i+4*j+k] = 255*checkerboard[i][j][k];
                image2[4*texSize*i+4*j+k] = 255*checkerboard[i+texSize][j][k];
                image3[4*texSize*i+4*j+k] = 255*checkerboard[i][j+texSize][k];
                image4[4*texSize*i+4*j+k] = 255*checkerboard[i+texSize][j+texSize][k];
              }



function configureTexture(texture, image) {
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vertices = [
        vec2(  0,  0.5 ),
        vec2(  -0.5,  0 ),
        vec2( 0.5,  0 ),
        vec2(  0, -0.5 )
    ];




    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer
    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    thetaLoc = gl.getUniformLocation( program, "theta" );
    angleLoc = gl.getUniformLocation( program, "angle" );

     texture1 = gl.createTexture();
     texture2 = gl.createTexture();
     texture3 = gl.createTexture();
     texture4 = gl.createTexture();

    configureTexture(texture4, image4);
    configureTexture(texture3, image3);
    configureTexture(texture2, image2);
    configureTexture(texture1, image1);



    render();
};


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += 0.1;
    gl.uniform1f( thetaLoc, theta );
    angle -= 0.1;
    gl.uniform1f( angleLoc, angle );

    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.drawArrays( gl.POINTS, 0, 1 );
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.drawArrays( gl.POINTS, 1, 1 );
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    gl.drawArrays( gl.POINTS, 2, 1 );
    gl.bindTexture(gl.TEXTURE_2D, texture4);
    gl.drawArrays( gl.POINTS, 3, 1 );

    requestAnimationFrame(render);
}
