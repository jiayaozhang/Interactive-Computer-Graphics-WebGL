#! /bin/tcsh

if ( $# != 1 ) then
  echo "Usage: $0 <PPM filename>"
  exit
endif

set PPM   = $1
set name  = ${PPM:r}
set CLASS = ${name}Texture
set JS    = $name.js

set DIMENSIONS = `head -2 $PPM | tail -1 | sed 's/ /, /'`

cat << EOF > $JS

function $CLASS( gl ) {

    var id = gl.createTexture();
    var target = gl.TEXTURE_2D;

    gl.bindTexture( target, id );
    [
        { n : gl.TEXTURE_MIN_FILTER, v : gl.LINEAR_MIPMAP_LINEAR },
        { n : gl.TEXTURE_MAG_FILTER, v : gl.LINEAR },
        { n : gl.TEXTURE_WRAP_S,     v : gl.CLAMP_TO_EDGE },
        { n : gl.TEXTURE_WRAP_S,     v : gl.CLAMP_TO_EDGE }
    ].forEach( function ( p ) {
        gl.texParameteri( target, p.n, p.v );
    });

    gl.texImage2D( target, 0, gl.RGB, $DIMENSIONS, 0,
        gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([
EOF

cat $PPM \
  | od -v -tu1 \
  | cut -f2- -d' ' \
  | tr ' ' '\n' \
  | sed '/^$/d' \
  | pr -3 -a -t -s, \
  | sed 's/$/,/' \
  | pr -4 -a -t -s' ' \
  | sed 's/^/            /' \
  >> $JS

cat << EOF >> $JS
        ])
    );
    gl.generateMipmap( target );

    this.bind = function ( unit ) {
       gl.activeTexture( unit || gl.TEXTURE0 );
       gl.bindTexture( target, id );
    }
}
EOF
