# Converting an Image File for JavaScript

Images for WebGL are a pain.  Perhaps the simplest way to get them into a WebGL program that's not being served from a web server is to encode them as a JavaScript function after converting the image file into an ASCII-friendly format, like a PPM.

1. Convert the file to a PPM.  This [site](https://www.online-utility.org/image/convert/to/PPM) will convert the file and download the resulting PPM.
2. Run the following script on the PPM file.

```sh
#! /bin/tcsh -x

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

function $CLASS() {

    var id = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, id );
    [
        { n : gl.TEXTURE_MIN_FILTER, v : gl.LINEAR_MIPMAP_LINEAR },
        { n : gl.TEXTURE_MAG_FILTER, v : gl.LINEAR },
        { n : gl.TEXTURE_WRAP_S,     v : gl.CLAMP_TO_EDGE },
        { n : gl.TEXTURE_WRAP_S,     v : gl.CLAMP_TO_EDGE }
    ].forEach( function ( p ) {
        gl.texParameteri( gl.TEXTURE_2D, p.n, p.v );
    });

    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, $DIMENSIONS,
        gl.UNSIGNED_BYTE, gl.RGB, new Uint8Array([
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
    ]);
    gl.generateMipmap();

    return id;
}
EOF
```

## Pipeline Commands
Command | Description
--------|------------
`od -v -tu1`              | output all lines as unsigned 8-bit integers
`cut -f2- -d' '`          | remove `od`'s byte labels
`tr ' ' '\n'`             | convert spaces into newlines
`sed '/^$/d'`             | delete blank lines
`pr -3 -a -t -s,`         | combine three values into one line
`sed 's/$/,/'`            | add a comma to the last component
`pr -4 -a -t -s' '`       | combine four pixels into a single line
`sed 's/^/            /'` | indent




## References

 * This [Stack Overflow Question](https://superuser.com/questions/264076/linux-unix-command-to-join-n-lines-of-input-with-delimiters) discusses folding lines using the `pr` command
