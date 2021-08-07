
function Cube( gl ) {

    this.name = "Cube";

    var positions = {
        numComponents : 3,
        type : gl.FLOAT,
        values : new Float32Array([
            -0.5, -0.5,  0.5,  // Vertex 0
             0.5, -0.5,  0.5,  // Vertex 1
             0.5,  0.5,  0.5,  // Vertex 2
            -0.5,  0.5,  0.5,  // Vertex 3
            -0.5, -0.5, -0.5,  // Vertex 4
             0.5, -0.5, -0.5,  // Vertex 5
             0.5,  0.5, -0.5,  // Vertex 6
            -0.5,  0.5, -0.5,  // Vertex 7
            ]),
        count : 8
    };

    var indices = {
        type : gl.UNSIGNED_SHORT,
        values : new Uint16Array([
            0, 2, 1,
            0, 3, 2,
            1, 2, 6,
            1, 6, 5,
            0, 4, 3,
            4, 7, 3,
            5, 7, 4,
            5, 6, 7,
            3, 6, 2,
            3, 7, 6,
            4, 1, 5,
            4, 0, 1
        ]),
        count : 36,
        offset : 0,
    };

    this.center = function () {
        return { x : 0.0, y : 0.0, z : 0.0 };
    };

    this.extents = function () {
        return { x : 2.0, y: 2.0, z : 2.0 };
    };

    positions.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, positions.values, gl.STATIC_DRAW );

    indices.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indices.buffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices.values, gl.STATIC_DRAW );

    delete positions.values;
    delete indices.values;

    this.render = function ( shaderProgram ) {
        var program = shaderProgram.program;

        var aPositionLoc = gl.getAttribLocation( program, "aPosition" );

        gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
        gl.vertexAttribPointer( aPositionLoc, positions.numComponents,
            positions.type, false, 0, 0 );
        gl.enableVertexAttribArray( aPositionLoc );

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indices.buffer );

        gl.drawElements( gl.pointMode ? gl.POINTS : gl.TRIANGLES,
            indices.count, indices.type, indices.offset );
    }
};
