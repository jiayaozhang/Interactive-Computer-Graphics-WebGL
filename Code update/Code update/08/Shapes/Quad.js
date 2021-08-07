
function Quad( gl ) {

    var positions = {
        numComponents : 2,
        type : gl.FLOAT,
        values : new Float32Array([
             1.0, -1.0,
             1.0,  1.0,
            -1.0, -1.0,
            -1.0,  1.0
        ]),
        count : 4
    };

    positions.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, positions.values, gl.STATIC_DRAW );

    this.render = function ( shaderProgram ) {
        var program = shaderProgram.program;

        var aPositionLoc = gl.getAttribLocation( program, "aPosition" );

        gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
        gl.vertexAttribPointer( aPositionLoc, positions.numComponents,
            positions.type, false, 0, 0 );
        gl.enableVertexAttribArray( aPositionLoc );

        gl.drawArrays( gl.TRIANGLE_STRIP, 0 /* first */, positions.count );
    };
}

