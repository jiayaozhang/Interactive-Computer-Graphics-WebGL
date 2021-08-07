
"use strict";

var gl = null;
var canvas = null;

var width = 0;
var height = 0;

var dragon = null;

var shaderPrograms = {};

var texture = null;

const modes = {
    SHOW_ALBEDO_MAP : 0,
    SHOW_SPECULAR_MAP : 1,
};

var mode = modes.SHOW_ALBEDO_MAP;

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
            case 'a' : mode = modes.SHOW_ALBEDO_MAP; break;
            case 's' : mode = modes.SHOW_SPECULAR_MAP; break;
        }

        render();
    };

    var program = initShaders( gl, "vertex-shader", "albedo-fragment" );
    shaderPrograms.albedo = {
        program : program,
        modelViewMatrixLoc : gl.getUniformLocation( program, "modelViewMatrix" ),
        projectionMatrixLoc : gl.getUniformLocation( program, "projectionMatrix" ),
        boundingBoxLoc : gl.getUniformLocation( program, "boundingBox" ),
        specularMapLoc : gl.getUniformLocation( program, "specularMap" )
    };

    program = initShaders( gl, "vertex-shader", "specular-fragment" );
    shaderPrograms.specular = {
        program : program,
        modelViewMatrixLoc : gl.getUniformLocation( program, "modelViewMatrix" ),
        projectionMatrixLoc : gl.getUniformLocation( program, "projectionMatrix" ),
        boundingBoxLoc : gl.getUniformLocation( program, "boundingBox" ),
        specularMapLoc : gl.getUniformLocation( program, "specularMap" )
    };

    //------------------------------------------------------------------------
    //
    //  Load models and textures
    //

    dragon = new Dragon( gl );
    // texture = new SpecularMapTexture( gl );
    texture = new StripesTexture( gl );

    //------------------------------------------------------------------------
    //
    //  Set other WebGL state
    //
    gl.clearColor( 0.1, 0.1, 0.1 , 1.0 );
    gl.enable( gl.DEPTH_TEST );

    render();
};

//----------------------------------------------------------------------------
//
//  Set tranformation matric
//
function SetTranforms( shaderProgram ) {

   var aspect = width / height;

    var center = dragon.center();
    var extents = dragon.extents();

    gl.uniform4f( shaderProgram.boundingBoxLoc,
        center.x, center.y, extents.x, extents.y );

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
//  Main Rendering Function
//

function render() {

    var shaderProgram = null;

    switch ( mode ) {
        case modes.SHOW_ALBEDO_MAP:
            shaderProgram = shaderPrograms.albedo;
            break;

        case modes.SHOW_SPECULAR_MAP:
            shaderProgram = shaderPrograms.specular;
            break;
    }

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    gl.useProgram( shaderProgram.program );
    SetTranforms( shaderProgram );
    texture.bind();
    gl.uniform1i( shaderProgram.specularMapLoc, 0 );
    dragon.render( shaderProgram );
}
