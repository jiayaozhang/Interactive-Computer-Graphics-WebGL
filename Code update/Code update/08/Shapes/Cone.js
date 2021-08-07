
const DefaultNumSides = 64;

function Cone( gl, numSides ) {

    this.name = "Cone";

    var n = numSides || DefaultNumSides; // Number of sides

    var theta = 0.0;
    var dTheta = 2.0 * Math.PI / n;

    var numVertices = n + 2;

    var positions = {
        numComponents : 3,
        type : gl.FLOAT,
        values : new Float32Array( 3 * numVertices ),
        count : numVertices
    };

   var indices = {
        type : gl.UNSIGNED_SHORT,
        baseOffset : 0,
    };

    this.center = function () {
        return { x : 0.0, y : 0.0, z : 0.5 };
    };

    this.extents = function () {
        return { x : 2.0, y: 2.0, z : 1.0 };
    };

    //
    // Initialize the Cone's indices and vertex positions
    //
    var j = 0;
    positions.values.set( [ 0.0, 0.0, 0.0 ], j );
    j += 3;

    var indexValues = [ 0 ];

    for ( var i = 0; i < n; ++i, j += 3 ) {
        theta = i * dTheta;
        positions.values.set( [Math.cos(theta), Math.sin(theta), 0.0],  j );

        indexValues.push(n - i);
    }

    positions.values.set( [ 0.0, 0.0, 1.0 ], j );

    // Close the triangle fan by repeating the first (non-center) point.
    //
    indexValues.push(n);

    indices.baseCount = indexValues.length;
    indices.coneOffset = 2 /* sizeof(gl.UNSIGNED_SHORT) */ * indices.baseCount;


    // Now build up the list for the cone.  First, add the apex vertex onto the index list
    //
    indexValues.push(n + 1);

    // Next, we need to append the rest of the vertices for the permieter of the disk.
    // However, the cone's perimeter vertices need to be reversed since it's effectively a
    // reflection of the bottom disk.
    //
    indexValues = indexValues.concat( indexValues.slice(1,n+2).reverse() );

    indices.values = new Uint16Array( indexValues ),
    indices.coneCount = indexValues.length - indices.baseCount;

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

        // Draw the cone's base and then top
        gl.drawElements( gl.pointMode ? gl.POINTS : gl.TRIANGLE_FAN,
            indices.baseCount, indices.type, indices.baseOffset );
        gl.drawElements( gl.pointMode ? gl.POINTS : gl.TRIANGLE_FAN,
            indices.coneCount, indices.type, indices.coneOffset );
    }
};
