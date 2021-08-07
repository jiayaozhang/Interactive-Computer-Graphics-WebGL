
const DefaultNumSlices = 20;  // Longitudinal divisions
const DefaultNumStacks = 12;  // Latitude divisions

function Sphere( gl, slices, stacks ) {

    this.name = "Sphere";

    var numSlices = slices || DefaultNumSlices;
    var numStacks = stacks || DefaultNumStacks;

    var numVertices = (numStacks - 1) * numSlices + 2;

    var positions = {
        numComponents : 3,
        type : gl.FLOAT,
        values : new Float32Array( 3 * numVertices ),
        count : numVertices
    };

    var texCoords = {
        numComponents : 2,
        type : gl.FLOAT,
        values : new Float32Array( 2 * numVertices ),
        count : numVertices
    }

    var dPhi = 1.0 / numStacks;
    var dTheta = 1.0 / numSlices;

    var pPos = 0;
    var tPos = 0;
    positions.values.set( [ 0.0, 0.0, 1.0 ], pPos );
    texCoords.values.set( [ 0.0, 0.0 ], tPos );
    pPos += positions.numComponents;
    tPos += texCoords.numComponents;

    var tau = 2.0 * Math.PI;
    for (j = 1; j < numStacks; ++j) {
        var t = j * dPhi;
        var phi = t * Math.PI;
        var z = Math.cos(phi);

        for (i = 0; i < numSlices; ++i) {
            var s = i * dTheta;
            var theta = s * tau;
            var sinPhi = Math.sin(phi);
            var x = Math.cos(theta) * sinPhi;
            var y = Math.sin(theta) * sinPhi;

            positions.values.set( [ x, y, z ], pPos );
            texCoords.values.set( [s, t], tPos );
            pPos += positions.numComponents;
            tPos += texCoords.numComponents;
        }
    }

    positions.values.set( [ 0.0, 0.0, -1.0 ], pPos );
    texCoords.values.set( [ 0.0, 1.0 ], tPos );

    // Generate the sphere's topology (i.e., indices)
    var indices = [];

    // Since we'll be using multiple draw calls to render the sphere,
    // build up an array of those calls' parameters to simplify rendering
    var drawCalls = [];

    // Generate the indices for the North Pole cap.  "indices.length" will
    // be zero at this point, but you'll see the pattern of using indices'
    // length value in future computations, so we use it here as well to
    // not break the pattern
    var start = indices.length; // this will be zero here
    var offset = start * 2 /* sizeof(gl.UNSIGNED_SHORT) */;

    var n = 1; // starting value of each "row" of indices

    indices.push(0);
    for (i = 0; i < numSlices; ++i) {
        var m = n + i;
        indices.push(n + i);
    }
    indices.push(n);

    const indexType = gl.UNSIGNED_SHORT;

    drawCalls.push({
        mode: gl.TRIANGLE_FAN,
        count: indices.length,
        type: indexType,
        offset: offset
    });

    // Generate the indices for each band around the sphere
    start = indices.length;
    offset = start * 2 /* sizeof(gl.UNSIGNED_SHORT) */ ;

    for (j = 0; j < numStacks - 2; ++j) {
        for (i = 0; i < numSlices; ++i) {
            var m = n + i;
            indices.push(m);
            indices.push(m + numSlices);
        }
        indices.push(n);
        indices.push(n + numSlices);

        n += numSlices;

        drawCalls.push({
            mode: gl.TRIANGLE_STRIP,
            count: indices.length - start,
            type : indexType,
            offset: offset
        });

        start = indices.length;
        offset = start * 2 /* sizeof(gl.UNSIGNED_SHORT) */ ;
    }

    // Generate the indices for the South Pole cap
    indices.push(n + numSlices);
    indices.push(n);
    for (i = 0; i < numSlices; ++i) {
        m = n + numSlices - i - 1;
        indices.push(m);
    }

    drawCalls.push({
        mode: gl.TRIANGLE_FAN,
        count: indices.length - start,
        type : indexType,
        offset: offset
    });

    this.center = function () {
        return { x : 0.0, y : 0.0, z : 0.0 };
    };

    this.extents = function () {
        return { x : 2.0, y: 2.0, z : 2.0 };
    };

    positions.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, positions.values, gl.STATIC_DRAW );

    texCoords.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, texCoords.buffer );
    gl.bufferData( gl.ARRAY_BUFFER, texCoords.values, gl.STATIC_DRAW );

    var values = new Uint16Array( indices );

    indices = {};

    indices.buffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indices.buffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, values, gl.STATIC_DRAW );

    delete positions.values;
    delete texCoords.values;

    this.render = function ( shaderProgram ) {
        var program = shaderProgram.program;

        var aPositionLoc = gl.getAttribLocation( program, "aPosition" );

        gl.bindBuffer( gl.ARRAY_BUFFER, positions.buffer );
        gl.vertexAttribPointer( aPositionLoc, positions.numComponents,
            positions.type, false, 0, 0 );
        gl.enableVertexAttribArray( aPositionLoc );

        var aTexCoordLoc = gl.getAttribLocation( program, "aTexCoord" );
        if ( aTexCoordLoc >= 0 ) {
            gl.bindBuffer( gl.ARRAY_BUFFER, texCoords.buffer );
            gl.vertexAttribPointer( aTexCoordLoc, texCoords.numComponents,
                texCoords.type, false, 0, 0 );
            gl.enableVertexAttribArray( aTexCoordLoc );
        }

        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indices.buffer );

        drawCalls.forEach( function( d ) {
            gl.drawElements( gl.pointMode ? gl.POINTS : d.mode,
                d.count, d.type, d.offset );
        });
    }
};
