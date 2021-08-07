"use strict";

var numDivisions = 5;

var index = 0;

var points = [];
var normals = [];

var modelViewMatrix = [];
var projectionMatrix = [];
var nMatrix, nMatrixLoc;

var axis =0;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var theta = vec3(0, 0, 0);
var dTheta = 5.0;

var flag = true;

var program;
var canvas, render, gl;

init();

function bezier(u) {
    var b = [];
    var a = 1-u;
    b.push(u*u*u);
    b.push(3*a*u*u);
    b.push(3*a*a*u);
    b.push(a*a*a);

    return b;
}

function init()  {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);


    var h = 1.0/numDivisions;

    var patch = new Array(numTeapotPatches);
    for(var i=0; i<numTeapotPatches; i++) patch[i] = new Array(16);
    for(var i=0; i<numTeapotPatches; i++)
        for(j=0; j<16; j++) {
            patch[i][j] = vec4([vertices[indices[i][j]][0],
             vertices[indices[i][j]][2],
                vertices[indices[i][j]][1], 1.0]);
    }


    for ( var n = 0; n < numTeapotPatches; n++ ) {


    var data = new Array(numDivisions+1);
    for(var j = 0; j<= numDivisions; j++) data[j] = new Array(numDivisions+1);
    for(var i=0; i<=numDivisions; i++) for(var j=0; j<= numDivisions; j++) {
        data[i][j] = vec4(0,0,0,1);
        var u = i*h;
        var v = j*h;
        var t = new Array(4);
        for(var ii=0; ii<4; ii++) t[ii]=new Array(4);
        for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++)
            t[ii][jj] = bezier(u)[ii]*bezier(v)[jj];


        for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++) {
            var temp = vec4(patch[n][4*ii+jj]);
            temp = mult( t[ii][jj], temp);
            data[i][j] = add(data[i][j], temp);
            data[i][j][3] = 1;
        }
    }

    var ndata = [];
    for(var i = 0; i<= numDivisions; i++) ndata[i] = new Array(4);
    for(var i = 0; i<= numDivisions; i++) for(var j = 0; j<= numDivisions; j++) ndata[i][j] = new Array(4);

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    for(var i=0; i<numDivisions; i++) for(var j =0; j<numDivisions; j++) {


      var t1 = subtract(data[i+1][j], data[i][j]);
      var t2  =subtract(data[i+1][j+1], data[i][j]);
      var normal = cross(t1, t2);

       normal = normalize(normal);
       normal = vec4(normal[0], normal[1], normal[2], 0.0);

        points.push(data[i][j]);
        normals.push(normal);


        points.push(data[i+1][j]);
        normals.push(normal);


        points.push(data[i+1][j+1]);
        normals.push(normal);

        points.push(data[i][j]);
        normals.push(normal);


        points.push(data[i+1][j+1]);
        normals.push(normal);


        points.push(data[i][j+1]);
        normals.push(normal);

        index+= 6;
        }
    }


    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );


    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var normalLoc = gl.getAttribLocation( program, "aNormal" );
    gl.vertexAttribPointer( normalLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalLoc );

    projectionMatrix = ortho(-4, 4, -4, 4, -200, 200);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix) );

    var lightPosition = vec4(10.0, 10.0, 10.0, 0.0 );
    var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
    var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

    var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
    var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
    var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
    var materialShininess = 10.0;

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),ambientProduct );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), diffuseProduct );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),specularProduct);
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), lightPosition );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialShininess );

    nMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    render();
}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 0.5;

    modelViewMatrix = mat4();

    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );

    nMatrix = normalMatrix(modelViewMatrix, true);
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );

    gl.drawArrays( gl.TRIANGLES, 0, index);

    requestAnimationFrame(render);
}
