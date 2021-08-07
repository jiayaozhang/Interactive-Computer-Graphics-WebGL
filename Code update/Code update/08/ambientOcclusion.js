
"use strict";

var gl = null;
var canvas = null;

var width = 0;
var height = 0;

var dragon = null;
var quad = null;

var shaderPrograms = {};

var framebuffer = null;
var depthTexture = null;
var normalMap = null;

var normalMapGenerated = false;
var depthTextureGenerated = false;
var aoImageGenerated = false;

const modes = {
    SHOW_DEPTH_TEXTURE : 0,
    SHOW_NORMAL_MAP : 1,
    SHOW_LIT_MODEL : 2,
    SHOW_AMBIENT_OCCLUSION : 3
};

var mode = modes.SHOW_AMBIENT_OCCLUSION;

init();

//----------------------------------------------------------------------------
//
//  main()
//
function init() {

    canvas = document.getElementById( "gl-canvas" );

    width = canvas.width;
    height = canvas.height;

    gl = canvas.getContext( "webgl2" );
    if ( !gl ) {
        alert( "WebGL 2.0 isn't available" );
    }

    //------------------------------------------------------------------------
    //
    //  User-input setup
    //
    window.onkeypress = function ( event ) {

        switch( event.key ) {
            case 'a' : mode = modes.SHOW_AMBIENT_OCCLUSION; break;
            case 'd' : mode = modes.SHOW_DEPTH_TEXTURE; break;
            case 'l' : mode = modes.SHOW_LIT_MODEL; break;
            case 'n' : mode = modes.SHOW_NORMAL_MAP; break;
        }

        render();
    };

    //------------------------------------------------------------------------
    //
    //  Initialize our geometric models
    //
    dragon = new Dragon( gl );
    quad = new Quad( gl );

    //------------------------------------------------------------------------
    //
    //  Configure the various shader programs
    //
    var program = initShaders( gl, "vertex-shader", "lit" );
    shaderPrograms.lit = {
        program : program,
        modelViewMatrixLoc : gl.getUniformLocation( program, "modelViewMatrix" ),
        projectionMatrixLoc : gl.getUniformLocation( program, "projectionMatrix" )
    };

    program = initShaders( gl, "vertex-shader", "normal-map" );
    shaderPrograms.normalMap = {
        program : program,
        modelViewMatrixLoc : gl.getUniformLocation( program, "modelViewMatrix" ),
        projectionMatrixLoc : gl.getUniformLocation( program, "projectionMatrix" )
    };

    program = initShaders( gl, "vertex-shader", "depth-render" );
    shaderPrograms.depthPass = {
        program : program,
        modelViewMatrixLoc : gl.getUniformLocation( program, "modelViewMatrix" ),
        projectionMatrixLoc : gl.getUniformLocation( program, "projectionMatrix" )
    };

    program = initShaders( gl, "vertex-shader", "ssao" );
    shaderPrograms.ssao = {
        program : program,
        modelViewMatrixLoc : gl.getUniformLocation( program, "modelViewMatrix" ),
        projectionMatrixLoc : gl.getUniformLocation( program, "projectionMatrix" ),
        depthTextureLoc : gl.getUniformLocation( program, "depthTexture" ),
        windowSizeLoc : gl.getUniformLocation( program, "windowSize" )
    };

    program = initShaders( gl, "vertex-blit", "color-blit" );
    shaderPrograms.blit = {
        program : program,
        blitTextureLoc : gl.getUniformLocation( program, "blitTexture" )
    };

    program = initShaders( gl, "vertex-blit", "depth-blit" );
    shaderPrograms.depthBlit = {
        program : program,
        blitTextureLoc : gl.getUniformLocation( program, "blitTexture" )
    };

    //------------------------------------------------------------------------
    //
    // Configure the framebuffer object and textures we'll need for rendering
    //
    framebuffer = gl.createFramebuffer();

    // Create a texture for storing the depth values
    depthTexture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, depthTexture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, width, height, 0,
        gl.DEPTH_COMPONENT, gl.FLOAT, null );

    // Create a texture for storing the model's normals
    normalMap = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, normalMap );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, width, height, 0,
        gl.RGB, gl.UNSIGNED_BYTE, null );

    //------------------------------------------------------------------------
    //
    //  Set other WebGL state
    //
    gl.clearColor( 0.1, 0.1, 0.1, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    render();
};

//----------------------------------------------------------------------------
//
//  WebGL Framebuffer Verficiation Function
//
function CheckFramebufferStatus( gl, message ) {
    var status = gl.checkFramebufferStatus( gl.DRAW_FRAMEBUFFER );
    if ( status != gl.FRAMEBUFFER_COMPLETE ) {
        console.log( message + ' framebuffer incomplete: ' + status.toString() );
    }
}

//----------------------------------------------------------------------------
//
//  Set tranformation matrices
//
function SetTranforms( shaderProgram ) {

   var aspect = width / height;

    var center = dragon.center();
    var extents = dragon.extents();

    var modelViewMatrix = translate( -center.x, -center.y,
        -(1.0 + center.z + 0.5 * extents.z ) );

    // var eye = vec3( center.x, center.y, 1.0 + 0.5 * extents.z );
    // var at = vec3( center.x, center.y, center.z );
    // var up = vec3( 0, 1, 0 );
    // var modelViewMatrix = lookAt( eye, at, up );

    var scale = 1.1;  // Add a little space between near & far clipping planes

    var fovy = 12.0;
    var near = 1.0;
    var far = near + scale * extents.z;

    var projectionMatrix = perspective( fovy, aspect, near, far );

    gl.useProgram( shaderProgram.program );
    gl.uniformMatrix4fv( shaderProgram.modelViewMatrixLoc, false,
        flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( shaderProgram.projectionMatrixLoc, false,
        flatten(projectionMatrix) );
}

//----------------------------------------------------------------------------
//
//  Generate a depth texture image
//
function GenerateDepthTexture() {

    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );
    gl.viewport( 0, 0, width, height );
    gl.framebufferTexture2D( gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
        gl.TEXTURE_2D, depthTexture, 0 );

    CheckFramebufferStatus( gl, 'Depth texture' );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    var shaderProgram = shaderPrograms.depthPass;
    SetTranforms( shaderProgram );
    dragon.render( shaderProgram );

    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    depthTextureGenerated = true;
}

//----------------------------------------------------------------------------
//
//  Generate a normal map
//
function GenerateNormalMap() {

    gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer );
    gl.viewport( 0, 0, width, height );
    gl.framebufferTexture2D( gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D, normalMap, 0 );
    //     gl.framebufferTexture2D( gl.READ_FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
    //     gl.TEXTURE_2D, depthTexture, 0 );

    CheckFramebufferStatus( gl, 'Normal map' );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    var shaderProgram = shaderPrograms.normalMap;
    SetTranforms( shaderProgram );
    dragon.render( shaderProgram );

    gl.bindFramebuffer( gl.FRAMEBUFFER, null );

    normalMapGenerated = true;
}

//----------------------------------------------------------------------------
//
//  Generate an ambient-occluded image
//
function GenerateAOImage() {

    // normalMapGenerated || GenerateNormalMap();
    depthTextureGenerated || GenerateDepthTexture();

    gl.enable( gl.DEPTH_TEST );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    var shaderProgram = shaderPrograms.ssao;
    SetTranforms( shaderProgram );
    gl.uniform2f( shaderProgram.windowSizeLoc, width, height );

    const NumOffsets = 64;
    for ( var i = 0; i < NumOffsets; ++i ) {
        var p = vec3(
            2.0 * Math.random() - 1.0,  // x in [-1,1]
            2.0 * Math.random() - 1.0,  // y in [-1,1]
            Math.random()               // z in [0,1]
        );
        p = normalize( p );

        var loc = gl.getUniformLocation( shaderProgram.program,
            "offsets[" + i + "]");
        gl.uniform3fv( loc, flatten(p) );
    }

    gl.bindFramebuffer( gl.DRAW_FRAMEBUFFER, null );

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, depthTexture );
    gl.uniform1i( shaderProgram.depthTextureLoc, 0 );

    dragon.render( shaderProgram );

    aoImageGenerated = true;
}

//----------------------------------------------------------------------------
//
//  Blit image to default framebuffer
//
function Blit( shaderProgram ) {
    gl.disable( gl.DEPTH_TEST );
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.useProgram( shaderProgram.program );
    gl.uniform1i( shaderProgram.blitTextureLoc, 0 ); // gl.TEXTURE0

    quad.render( shaderProgram );

    gl.enable( gl.DEPTH_TEST );
}

//----------------------------------------------------------------------------
//
//  SSAO Blit pass
//
function SSAO( shaderProgram ) {
    gl.disable( gl.DEPTH_TEST );
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.useProgram( shaderProgram.program );
    gl.uniform1i( shaderProgram.depth, 0 ); // active texture = gl.TEXTURE0
    gl.uniform1i( shaderProgram.normals, 1 ); // active texture = gl.TEXTURE1

    quad.render( shaderProgram );

    gl.enable( gl.DEPTH_TEST );
}


//----------------------------------------------------------------------------
//
//  Main Rendering Function
//

function render() {

    switch ( mode ) {
        //-----------------------------------------------------------------
        //
        //  (Forward) render a simply lit version of the model
        //
        case modes.SHOW_LIT_MODEL:
            gl.enable( gl.DEPTH_TEST );
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

            var shaderProgram = shaderPrograms.lit;
            SetTranforms( shaderProgram );
            dragon.render( shaderProgram );
            break;

        //-----------------------------------------------------------------
        //
        //  (Forward) render a simply lit version of the model
        //
        case modes.SHOW_DEPTH_TEXTURE:
            depthTextureGenerated || GenerateDepthTexture();

            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, depthTexture );
            Blit( shaderPrograms.depthBlit );
            break;

        //-----------------------------------------------------------------
        //
        //  (Forward) render a simply lit version of the model
        //
        case modes.SHOW_NORMAL_MAP:
            normalMapGenerated || GenerateNormalMap();

            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, normalMap );
            Blit( shaderPrograms.blit );
            break;

        //-----------------------------------------------------------------
        //
        //  (Forward) render a simply lit version of the model
        //
        case modes.SHOW_AMBIENT_OCCLUSION:
            GenerateAOImage();
//            aoImageGenerated || GenerateAOImage();
//
//            gl.activeTexture( gl.TEXTURE0 );
//            gl.bindTexture( gl.TEXTURE_2D, depthTexture );
//
//            gl.activeTexture( gl.TEXTURE1 );
//            gl.bindTexture( gl.TEXTURE_2D, normalMap );
//
//            SSAO( shaderPrograms.aoBlit );
//
//            gl.activeTexture( gl.TEXTURE0 );
            break;
    }
}
