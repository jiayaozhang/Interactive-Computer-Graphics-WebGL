var gl;

window.onload = function init()
{
        'use strict';

        // -- Init WebGL Context
        var canvas = document.getElementById( "gl-canvas" );
        gl = canvas.getContext("webgl2");
        if (!gl) { alert( "WebGL 2.0 isn't available" ); }

        // -- Init Program
        var program = initShaders( gl, "vs", "fs" );
        gl.useProgram(program);

        // -- Init Vertex Array
        var vertexArray = gl.createVertexArray();
        gl.bindVertexArray(vertexArray);

        // -- Init Buffers
        var positionLoc = 0;  // set with GLSL layout qualifier
        var vertices = new Float32Array([
            -0.3, -0.5,
             0.3, -0.5,
             0.0,  0.5
        ]);
        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        var colorLoc = 1;  // set with GLSL layout qualifier
        var colors = new Float32Array([
            1.0, 0.5, 0.0,
            0.0, 0.5, 1.0
        ]);
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(colorLoc);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribDivisor(colorLoc, 1); // attribute used once per instance

        // -- Render
        render();
};

function render() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, 2);
}
