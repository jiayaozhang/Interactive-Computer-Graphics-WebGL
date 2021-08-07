"use strict";

var canvas;
var gl;

var modelViewMatrix, projectionMatrix;
var viewerPos;
var program1, program2, program3;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =vec3(0, 0, 0);

var flag = false;

var points = [];
var normals = [];
var colors = [];
var texCoord = [];

var ncube, ncylinder, nsphere;


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

// specify objects and instance them

    var myCube = cube(0.3);
    myCube.rotate(45.0, [1, 1, 1]);
    myCube.translate(0.7, 0.0, 0.0);

    var myCylinder = cylinder(72, 3, true);
    myCylinder.scale(0.5, 0.5, 0.5);
    myCylinder.rotate(45.0, [ 1, 1, 1]);
    myCylinder.translate(0.0, 0.0, 0.0);

    var mySphere = sphere();
    mySphere.scale(0.3, 0.3, 0.3);
    mySphere.rotate(45.0, [ 1, 1, 1]);
    mySphere.translate(-0.6, -0.1, 0.0);

// light, material, texture

    var myMaterial = goldMaterial();
    var myLight = light0();
    var texture = checkerboardTexture();

// put object data in arrays that will be sent to shaders

    points = myCylinder.TriangleVertices;
    normals = myCylinder.TriangleNormals;
    colors = myCylinder.TriangleVertexColors;
    texCoord = myCylinder.TextureCoordinates;
    points = points.concat(myCube.TriangleVertices);
    normals = normals.concat(myCube.TriangleNormals);
    colors = colors.concat(myCube.TriangleVertexColors);
    texCoord = texCoord.concat(myCube.TextureCoordinates);
    points = points.concat(mySphere.TriangleVertices);
    normals = normals.concat(mySphere.TriangleNormals);
    colors = colors.concat(mySphere.TriangleVertexColors);
    texCoord = texCoord.concat(mySphere.TextureCoordinates);

// object sizes (number of vertices)

    ncube = myCube.TriangleVertices.length;
    ncylinder = myCylinder.TriangleVertices.length;
    nsphere = mySphere.TriangleVertices.length;

    //
    //  Load shaders and initialize attribute buffers
    //
    program1 = initShaders( gl, "vertex-shader", "fragment-shader" );
    program2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );
    program3 = initShaders( gl, "vertex-shader3", "fragment-shader3" );

// program1: render with lighting
//    need position and normal attributes sent to shaders
// program2: render with vertex colors
//    need position and color attributes sent to shaders
// program3: render with texture and vertex colors
//    need position, color and texture coordinate attributes sent to shaders

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program2, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( colorLoc );

    var color2Loc = gl.getAttribLocation( program3, "aColor" );
    gl.vertexAttribPointer( color2Loc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( color2Loc );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var normalLoc = gl.getAttribLocation( program1, "aNormal" );
    gl.vertexAttribPointer( normalLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation(program1, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var position2Loc = gl.getAttribLocation(program2, "aPosition");
    gl.vertexAttribPointer(position2Loc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position2Loc);

    var position3Loc = gl.getAttribLocation(program3, "aPosition");
    gl.vertexAttribPointer(position3Loc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position3Loc);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW );

    var texCoordLoc = gl.getAttribLocation( program3, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

// set up projection matrix

    viewerPos = vec3(0.0, 0.0, -20.0 );

    projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);

// products of material and light properties

    var ambientProduct = mult(myLight.lightAmbient, myMaterial.materialAmbient);
    var diffuseProduct = mult(myLight.lightDiffuse, myMaterial.materialDiffuse);
    var specularProduct = mult(myLight.lightSpecular, myMaterial.materialSpecular);

// listeners

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

// uniforms for each program object

    gl.useProgram(program2);

    gl.uniformMatrix4fv( gl.getUniformLocation(program2, "projectionMatrix"),
       false, flatten(projectionMatrix));

    gl.useProgram(program3);

    gl.uniformMatrix4fv( gl.getUniformLocation(program3, "projectionMatrix"),
          false, flatten(projectionMatrix));


    gl.useProgram(program1);

    gl.uniform4fv(gl.getUniformLocation(program1, "ambientProduct"),
          flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program1, "diffuseProduct"),
          flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program1, "specularProduct"),
          flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program1, "lightPosition"),
          flatten(myLight.lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program1,
          "shininess"), myMaterial.materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program1, "projectionMatrix"),
          false, flatten(projectionMatrix));


    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//update rotation angles and form modelView matrix

    if(flag) theta[axis] += 2.0;

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0) ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0) ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1) ));

// by commenting and uncommenting gl.drawArrays we can choose which shaders to use for each object

    gl.useProgram(program1);
    gl.uniformMatrix4fv( gl.getUniformLocation(program1,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, ncylinder);
    gl.drawArrays( gl.TRIANGLES, ncylinder, ncube );
    gl.drawArrays( gl.TRIANGLES, ncylinder + ncube, nsphere );


    gl.useProgram(program2);
    gl.uniformMatrix4fv( gl.getUniformLocation(program2,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );

    //gl.drawArrays( gl.TRIANGLES, 0, ncylinder);
    //gl.drawArrays( gl.TRIANGLES, ncylinder, ncube );
    //gl.drawArrays( gl.TRIANGLES, ncylinder + ncube, nsphere );



    gl.useProgram(program3);
    gl.uniformMatrix4fv( gl.getUniformLocation(program3,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );

    //gl.drawArrays( gl.TRIANGLES, 0, ncylinder);
    //gl.drawArrays( gl.TRIANGLES, ncylinder, ncube );
    //gl.drawArrays( gl.TRIANGLES, ncylinder + ncube, nsphere );


    requestAnimationFrame(render);
}
