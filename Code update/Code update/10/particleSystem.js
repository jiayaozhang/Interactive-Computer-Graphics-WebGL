"use strict";

var canvas;
var gl;

var numVertices  = 24;
var maxNumParticles = 1000;
var initialNumParticles = 25;
var initialPointSize = 5;
var initialSpeed = 1.0;
var numColors = 8;

var program;

var time = 0;
var dt = 1;

var numParticles = initialNumParticles;
var pointSize = initialPointSize;
var speed = initialSpeed;
var gravity = false;
var elastic = false;
var repulsion = false;
var coef = 1.0;


var pointsArray = [];
var colorsArray =[];

var projectionMatrix, modelViewMatrix;
var eye;
var at;
var up;

var cBufferId, vBufferId;

var vertices = [

    vec4(-1.1, -1.1,  1.1, 1.0 ),
    vec4( -1.1,  1.1,  1.1, 1.0 ),
    vec4( 1.1,  1.1,  1.1, 1.0 ),
    vec4( 1.1, -1.1,  1.1, 1.0 ),
    vec4( -1.1, -1.1, -1.1, 1.0 ),
    vec4( -1.1,  1.1, -1.1, 1.0 ),
    vec4( 1.1,  1.1, -1.1, 1.0 ),
    vec4( 1.1, -1.1, -1.1, 1.0)
];

var vertexColors = [

    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


function particle(){

    var p = {};
    p.position = vec4(0, 0, 0, 1);
    p.velocity = vec4(0, 0, 0, 0);
    p.color = vertexColors[Math.floor(numColors*Math.random())];
    for(var j =0; j<3; j++) {
      p.position[j] = 2.0 * (Math.random() - 0.5);
      p.velocity[j] = speed * 2.0 * (Math.random() - 0.5);
    }
    p.mass = 1;
    return p;
}

var particles = [];

for(var i = 0; i< maxNumParticles; i++) particles.push(particle());

var bufferId;

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[0]);
     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[0]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[0]);
     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[0]);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    document.getElementById("Button1").onclick = function(){doubleNumParticles(); update();};
    document.getElementById("Button2").onclick = function(){numParticles /= 2; update();};
    document.getElementById("Button3").onclick = function(){speed *=2;update();};
    document.getElementById("Button4").onclick = function(){speed /= 2; update();};
    document.getElementById("Button5").onclick = function(){pointSize *= 2;gl.uniform1f(gl.getUniformLocation(program, "pointSize"), pointSize); update();};
    document.getElementById("Button6").onclick = function(){pointSize /= 2;gl.uniform1f(gl.getUniformLocation(program, "pointSize"), pointSize); update();};
    document.getElementById("Button7").onclick = function(){gravity = !gravity; update()};
    document.getElementById("Button8").onclick = function(){elastic = !elastic; update()};
    document.getElementById("Button9").onclick = function(){repulsion = !repulsion; update()};

    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    eye =  vec3(1.5, 1.0, 1.0);
    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(-2.0,2.0,-2.0,2.0,-4.0,4.0);

    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix" ), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix" ), false, flatten(projectionMatrix) );

    gl.uniform1f(gl.getUniformLocation(program, "pointSize"), pointSize);

    cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16*(maxNumParticles+numVertices), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16*(maxNumParticles+numVertices), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    gl.uniform1f(gl.getUniformLocation(program, "pointSize"), pointSize);

    simulation();
}

var simulation = function(){

    colorCube();

    // set up particles with random locations and velocities

    particles = [];
    for(var i = 0; i< maxNumParticles; i++) {
      particles.push(particle());
    }

    for(var i =0; i<numParticles; i++) {
       pointsArray.push(particles[i].position);
       colorsArray.push(particles[i].color);
       }

    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorsArray));

    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(pointsArray));

    render();

}

var doubleNumParticles = function(){

    if(2*numParticles > maxNumParticles) return;
    for ( var i = 0; i < 2*numParticles; i++ ) {
        particles.push(particle());
    }
       numParticles *= 2;

       update();
}

var forces = function( p)
{
    var force = vec4(0, 0, 0, 0);
    if ( gravity) force[1] = -0.5;     //simple gravity
    if ( repulsion )
    for ( var i= 0; i < numParticles; i++ ){
        var q = particles[i];
        if ( p != q ){
            var d = subtract(p.position, q.position);
            var direction = normalize(d);
            var d2 = dot(d, d);
            var scaleFactor = 0.01/d2;
            force = add(force, scale(scaleFactor, direction));
          }
      }
      return force;
}

var collision = function(p) {

/* tests for collisions against cube and reflect particles if necessary */

    if(elastic) coef = 0.9; else coef = 1.0;
    for (var i = 0; i < 3; i++ ) {
        if ( p.position[i] >= 1.0 ) {
            p.velocity[i] = -coef * p.velocity[i];

            p.position[i] =
                1.0 - coef * ( p.position[i] - 1.0 );
        }
        if ( p.position[i] <= -1.0 ) {
            p.velocity[i] = -coef * p.velocity[i];

            p.position[i] =
                -1.0 - coef * ( p.position[i] + 1.0 );
        }
    }
}


var update = function(){
    for (var i = 0; i < numParticles; i++ ) {
            particles[i].position = add( particles[i].position, scale(speed*dt, particles[i].velocity));
            particles[i].velocity = add( particles[i].velocity, scale(speed*dt/ particles[i].mass,
              forces(particles[i])));
        }
    for (var i = 0; i < numParticles; i++ ) collision(particles[i]);
    colorsArray = [];
    pointsArray = [];
    colorCube();
    for(var i = 0; i<numParticles; i++) {
       pointsArray.push(particles[i].position);
       colorsArray.push(particles[i].color);
    }
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(colorsArray));
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(pointsArray));
}

var render = function(){
            gl.clear( gl.COLOR_BUFFER_BIT );
            update();
            for ( var i = 0; i < 6; i++ ) gl.drawArrays( gl.LINE_LOOP, i * 4, 4 );
            gl.drawArrays(gl.POINTS, numVertices, numParticles);
            requestAnimationFrame(render);
        }
