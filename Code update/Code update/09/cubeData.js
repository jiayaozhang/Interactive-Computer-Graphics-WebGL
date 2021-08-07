
"use strict";

function cube(s) {

var data = {};

var size;
if (!s) size = 0.5;
else size = s/2;

var cubeVertices = [
    [ -size, -size,  size, 1.0 ],
    [ -size,  size,  size, 1.0 ],
    [  size, size, size, 1.0 ],
    [  size, -size,  size, 1.0 ],
    [ -size, -size, -size, 1.0 ],
    [ -size,  size, -size, 1.0 ],
    [ size,  size, -size, 1.0  ],
    [ size, -size, -size, 1.0 ]
];

var cubeFaceNormals = [
  [ 0, 0, 1],
  [ 1, 0, 0],
  [ 0, -1, 0],
  [ 0, 1, 0],
  [ 0, 0, -1],
  [ -1 , 0, 0]
];

var cubeIndices = [

 [ 1, 0, 3, 2],
 [ 2, 3, 7, 6],
 [ 3, 0, 4, 7],
 [ 6, 5, 1, 2],
 [ 4, 5, 6, 7],
 [ 5, 4, 0, 1]
];

var cubeVertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 1.0, 1.0, 1.0 ]   // white
];

var cubeElements = [
    1, 0, 3,
    3, 2, 1,

    2, 3, 7,
    7, 6, 2,

    3, 0, 4,
    4, 7, 3,

    6, 5, 1,
    1, 2, 6,

    4, 5, 6,
    6, 7, 4,

    5, 4, 0,
    0, 1, 5
];

var cubeTexElements = [
    1, 0, 3,
    3, 2, 1,

    1, 0, 3,
    3, 2, 1,

    0, 1, 2,
    2, 3, 0,

    2, 1, 0,
    0, 3, 2,

    3, 2, 1,
    1, 0, 3,

    2, 3, 0,
    0, 1, 2
];

var cubeNormalElements = [
  0, 0, 0,
  0, 0, 0,
  1, 1, 1,
  1, 1, 1,
  2, 2, 2,
  2, 2, 2,
  3, 3, 3,
  3, 3, 3,
  4, 4, 4,
  4, 4, 4,
  5, 5, 5,
  5, 5, 5

];

var faceTexCoord = [
    [ 0, 0],
    [ 0, 1],
    [ 1, 1],
    [ 1, 0]
];

var cubeTriangleVertices = [];
var cubeTriangleVertexColors = [];
var cubeTriangleFaceColors = [];
var cubeTextureCoordinates = [];
var cubeTriangleNormals = [];

for ( var i = 0; i < cubeElements.length; i++ ) {
    cubeTriangleVertices.push( cubeVertices[cubeElements[i]] );
    cubeTriangleVertexColors.push( cubeVertexColors[cubeElements[i]] );
    cubeTextureCoordinates.push( faceTexCoord[cubeTexElements[i]]);
    cubeTriangleNormals.push(cubeFaceNormals[cubeNormalElements[i]]);
}

for ( var i = 0; i < cubeElements.length; i++ ) {
    cubeTriangleFaceColors[i] = cubeVertexColors[1+Math.floor((i/6))];
}

function translate(x, y, z){
   for(i=0; i<8; i++) {
     cubeVertices[i][0] += x;
     cubeVertices[i][1] += y;
     cubeVertices[i][2] += z;
   };
}

function scale(sx, sy, sz){
    for(i=0; i<8; i++) {
        cubeVertices[i][0] *= sx;
        cubeVertices[i][1] *= sy;
        cubeVertices[i][2] *= sz;
    };
}

function radians( degrees ) {
    return degrees * Math.PI / 180.0;
}

function rotate( angle, axis) {

    var d = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);

    var x = axis[0]/d;
    var y = axis[1]/d;
    var z = axis[2]/d;

    var c = Math.cos( radians(angle) );
    var omc = 1.0 - c;
    var s = Math.sin( radians(angle) );

    var mat = [
        [ x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s ],
        [ x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s ],
        [ x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c ]
    ];

    for(i=0; i<8; i++) {
          var t = [0, 0, 0];
          for( var j =0; j<3; j++)
           for( var k =0 ; k<3; k++)
              t[j] += mat[j][k]*cubeVertices[i][k];
           for( var j =0; j<3; j++) cubeVertices[i][j] = t[j];
    };
}


data.Indices = cubeIndices;
data.VertexColors = cubeVertexColors;
data.Vertices = cubeVertices;
data.Elements = cubeElements;
data.TextureCoordinates = cubeTextureCoordinates;
data.TriangleVertices = cubeTriangleVertices;
data.TriangleVertexColors = cubeTriangleVertexColors;
data.TriangleFaceColors = cubeTriangleFaceColors;
data.TriangleNormals = cubeTriangleNormals;
data.translate = translate;
data.scale = scale;
data.rotate = rotate;

return data;

}
