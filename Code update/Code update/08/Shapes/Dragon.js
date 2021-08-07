
function Dragon( gl ) {

    //------------------------------------------------------------------------
    //
    //  Initialize vertex data structures
    //
    var positions = LoadVertices();
    var indices = LoadIndices();

    var normals = {
        numComponents : 3,
        type : gl.FLOAT,
        values : new Float32Array(positions.values.length)
    };

    //------------------------------------------------------------------------
    //
    //  Generate the axis-aligned bounding box of the vertices
    //
    var j = 0;
    var v = positions.values.slice( j, j += 3 );

    var min = { x : v[0], y : v[1], z : v[2] };
    var max = { x : v[0], y : v[1], z : v[2] };

    for ( var i = 1; i < positions.count; ++i ) {
        v = positions.values.slice( j, j += 3 );

        if ( min.x > v[0] ) { min.x = v[0]; }
        if ( min.y > v[1] ) { min.y = v[1]; }
        if ( min.z > v[2] ) { min.z = v[2]; }

        if ( max.x < v[0] ) { max.x = v[0]; }
        if ( max.y < v[1] ) { max.y = v[1]; }
        if ( max.z < v[2] ) { max.z = v[2]; }
    }

    this.center = function () {
        return  {
            x : 0.5 * (min.x + max.x),
            y : 0.5 * (min.y + max.y),
            z : 0.5 * (min.z + max.z)
        };
    };

    this.extents = function () {
        return  {
            x : max.x - min.x,
            y : max.y - min.y,
            z : max.z - min.z
        };
    };

    //------------------------------------------------------------------------
    //
    // Generate face normals for each triangle, and record which vertices
    // are adjacent to that triangle
    //
    var numTriangles = indices.count / 3;
    var numVertices = positions.count;

    var trisByVerts = new Array(numVertices);  // triangle indices that are adjacent to a vertex
    var triNormals = new Array(numTriangles);  // face normals for each triangle
    var index = 0;

    for ( var i = 0; i < numVertices; ++i ) {
        trisByVerts[i] = [];
    }

    for ( var t = 0; t < numTriangles; ++t ) {

        var v = [];
        for ( var i = 0; i < 3; ++i ) {
            var j = indices.values[index++];

            trisByVerts[j].push(t);  // triangle t is adjacent to vertex j

            var k = 3 * j;
            v[i] = positions.values.slice(k, k + 3);
        }

        var a = vec3( v[1][0] - v[0][0], v[1][1] - v[0][1], v[1][2] - v[0][2]);
        var b = vec3( v[2][0] - v[0][0], v[2][1] - v[0][1], v[2][2] - v[0][2]);

        triNormals[t] = normalize( cross(a,b) ); // face normal for triange t
    }

    // Average all of the triangle face normals adjacent to a vertex and
    // assign that as the vertex's normal

    for ( var i = 0; i < numVertices; ++i ) {
        var v = vec3();
        for ( var j = 0; j < trisByVerts[i].length; ++j ) {
            v = add( v, triNormals[trisByVerts[i][j]] );
        }
        v = normalize( v );
        normals.values.set( v, 3 * i);
    }

    //------------------------------------------------------------------------
    //
    //  Initialize WebGL vertex data
    //
    positions.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, positions.values, gl.STATIC_DRAW );

    normals.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normals.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, normals.values, gl.STATIC_DRAW );

    indices.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indices.buffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, indices.values,
        gl.STATIC_DRAW );

    this.render = function( shaderProgram ) {
        var program = shaderProgram.program;

        var aPositionLoc = gl.getAttribLocation( program, "aPosition" );

        gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
        gl.vertexAttribPointer( aPositionLoc, positions.numComponents,
          positions.type, false, 0, 0 );
        gl.enableVertexAttribArray( aPositionLoc );

        var aNormalLoc = gl.getAttribLocation( program, "aNormal" );
        if ( aNormalLoc >= 0 ) {
            gl.bindBuffer( gl.ARRAY_BUFFER, normals.buffer );
            gl.vertexAttribPointer( aNormalLoc, normals.numComponents,
                normals.type, false, 0, 0 );
            gl.enableVertexAttribArray( aNormalLoc );
        }

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indices.buffer );

        gl.drawElements( gl.TRIANGLES, indices.count,
          indices.type, indices.offset );
    };
}
