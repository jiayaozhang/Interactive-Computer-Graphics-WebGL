"use strict";

var numDivisions = 3;

var index = 0;

var points = [];
var normals = [];

var modelViewMatrix = [];
var projectionMatrix = [];

var nMatrix, nMatrixLoc;

var axis =0;

var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var theta = vec3(0, 0, 0);
var dTheta = 5.0;

var flag = true;

var program;
var canvas, render, gl;


var bezier = function(u) {
    var b =new Array(4);
    var a = 1-u;
    b[3] = a*a*a;
    b[2] = 3*a*a*u;
    b[1] = 3*a*u*u;
    b[0] = u*u*u;
    return b;
}

var nbezier = function(u) {
    var b = [];
    b.push(3*u*u);
    b.push(3*u*(2-3*u));
    b.push(3*(1-4*u+3*u*u));
    b.push(-3*(1-u)*(1-u));
    return b;
}

onload = function init()  {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);


    var sum = [0, 0, 0];
    for(var i = 0; i<306; i++) for(j=0; j<3; j++)
      sum[j] += vertices[i][j];
      for(j=0; j<3; j++) sum[j]/=306;
        for(var i = 0; i<306; i++) for(j=0; j<2; j++)
       vertices[i][j] -= sum[j]/2
           for(var i = 0; i<306; i++) for(j=0; j<3; j++)
       vertices[i][j] *= 2;


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
            temp = vec4(patch[n][4*ii+jj]);
            temp = mult( t[ii][jj], temp);
            data[i][j] = add(data[i][j], temp);
        }
    }

    var ndata = new Array(numDivisions+1);
    for(var j = 0; j<= numDivisions; j++) ndata[j] = new Array(numDivisions+1);
    var tdata = new Array(numDivisions+1);
    for(var j = 0; j<= numDivisions; j++) tdata[j] = new Array(numDivisions+1);
    var sdata = new Array(numDivisions+1);
    for(var j = 0; j<= numDivisions; j++) sdata[j] = new Array(numDivisions+1);
    for(var i=0; i<=numDivisions; i++) for(var j=0; j<= numDivisions; j++) {
        ndata[i][j] = vec4(0,0,0,0);
        sdata[i][j] = vec4(0,0,0,0);
        tdata[i][j] = vec4(0,0,0,0);
        var u = i*h;
        var v = j*h;
        var tt = new Array(4);
        for(var ii=0; ii<4; ii++) tt[ii]=new Array(4);
        var ss = new Array(4);
        for(var ii=0; ii<4; ii++) ss[ii]=new Array(4);

        for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++) {
            tt[ii][jj] = nbezier(u)[ii]*bezier(v)[jj];
            ss[ii][jj] = bezier(u)[ii]*nbezier(v)[jj];
        }

        for(var ii=0; ii<4; ii++) for(var jj=0; jj<4; jj++) {
            var temp = vec4(patch[n][4*ii+jj]); ;
            temp = mult( tt[ii][jj], temp);
            tdata[i][j] = add(tdata[i][j], temp);

            var stemp = vec4(patch[n][4*ii+jj]); ;
            stemp = mult( ss[ii][jj], stemp);
            sdata[i][j] = add(sdata[i][j], stemp);

        }
        temp = cross(tdata[i][j], sdata[i][j])

        ndata[i][j] =  normalize(vec4(temp[0], temp[1], temp[2], 0));
    }

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    for(var i=0; i<numDivisions; i++) for(var j =0; j<numDivisions; j++) {
        points.push(data[i][j]);
        normals.push(ndata[i][j]);

        points.push(data[i+1][j]);
        normals.push(ndata[i+1][j]);

        points.push(data[i+1][j+1]);
        normals.push(ndata[i+1][j+1]);

        points.push(data[i][j]);
        normals.push(ndata[i][j]);

        points.push(data[i+1][j+1]);
        normals.push(ndata[i+1][j+1]);

        points.push(data[i][j+1]);
        normals.push(ndata[i][j+1]);
        index+= 6;
        }
    }

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );


    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var normalLoc = gl.getAttribLocation( program, "aNormal" );
    gl.vertexAttribPointer( normalLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalLoc);


    projectionMatrix = ortho(-4, 4, -4, 4, -200, 200);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
    nMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );


    var lightPosition = vec4(0.0, 0.0, 20.0, 0.0 );
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

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), ambientProduct );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), diffuseProduct );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), specularProduct);
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), lightPosition );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );

    for(var i =0; i<27; i++) console.log(
      Math.floor(i),
      Math.floor(i/9),
      Math.floor((i-9*Math.floor(i/9))/3),
      Math.floor(i-3*Math.floor(i/3))
    );
    render();
}

var render = function(){
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            if(flag) theta[axis] += 0.5;

            modelViewMatrix = mat4();

            modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
            modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
            modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

            gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
            nMatrix = normalMatrix(modelViewMatrix, true);

            gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix) );

            //gl.drawArrays( gl.TRIANGLES, 0, index);
            console.log(index);
              gl.drawArraysInstanced(gl.TRIANGLES, 0, index, 27);
            requestAnimationFrame(render);
        }
