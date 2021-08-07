//////////////////////////////////////////////////////////////////////////////
//
//  MV.js
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------

//
// Helper Functions
//
function MVbuffer(size) {
  var b = {};
  b.buf = new Float32Array(size);
  b.index = 0;
  b.push = function(x) {
    for(var i=0; i<x.length; i++) {
      b.buf[b.index+i] = x[i];
    }
    b.index += x.length;
    b.type = '';
  }
  return b;
}

function isVector(v) {
  if(v.type == "vec2" || v.type == "vec3" || v.type == "vec4") return true;
  return false;
}

function isMatrix(v) {
  if(v.type == "mat2" || v.type == "mat3" || v.type == "mat4") return true;
  return false;
}

function radians( degrees ) {
    return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------


function patch() {
  var out = new Array(4);
  for(var i = 0; i< 4; i++) out[i] = new Array(4);
  out.type = "patch";
  return out;
}

function curve() {
  var out = new Array(4);
  out.type = "curve";
  return out;
}
//
//  Vector Constructors
//

function vec2()
{
    var out = new Array(2);
    out.type = 'vec2';

    switch ( arguments.length ) {
      case 0:
        out[0] = 0.0;
        out[1] = 0.0;
        break;
      case 1:
        if(isVector(arguments[0] && (arguments[0].type != 'vec2'))) {
        out[0] = arguments[0][0];
        out[1] = arguments[0][1];
      }
        break;

      case 2:
        out[0] = arguments[0];
        out[1] = arguments[1];
        break;
    }
    return out;
}

function vec3()
{
//var result = _argumentsToArray( arguments );

    var out = new Array(3);
    out.type = 'vec3';

    switch ( arguments.length ) {
    case 0:
      out[0] = 0.0;
      out[1] = 0.0;
      out[2] = 0.0;
      return out;
    case 1:
    if(isVector(arguments[0]) && (arguments[0].type == "vec3")) {
      out[0] = arguments[0][0];
      out[1] = arguments[0][1];
      out[2] = arguments[0][2];
      return out;
    }
    case 3:
      out[0] = arguments[0];
      out[1] = arguments[1];
      out[2] = arguments[2];
      return out;
      default:
        throw "vec3: wrong arguments";
    }

    return out;
}

function vec4()
{
    var out = new Array(4);
    out.type = 'vec4';
    switch ( arguments.length ) {

      case 0:

        out[0] = 0.0;
        out[1] = 0.0;
        out[2] = 0.0;
        out[3] = 0.0;
        return out;

      case 1:
        if(isVector(arguments[0])) {
          if(arguments[0].type == "vec4") {
            out[0] = arguments[0][0];
            out[1] = arguments[0][1];
            out[2] = arguments[0][2];
            out[3] = arguments[0][3];
            return out;
          }
        }
          else if(arguments[0].type == "vec3") {
            out[0] = arguments[0][0];
            out[1] = arguments[0][1];
            out[2] = arguments[0][2];
            out[3] = 1.0;
            return out;
          }
          else {
            out[0] = arguments[0][0];
            out[1] = arguments[0][1];
            out[2] = arguments[0][2];
            out[3] = arguments[0][3];
            return out;
          }



      case 2:
        if(typeof(arguments[0])=='number'&&arguments[1].type == 'vec3') {
          out[0] = arguments[0];
          out[1] = arguments[1][0];
          out[2] = arguments[1][1];
          out[3] = arguments[1][2];
          return out;
      }
      return out;

      case 4:

      if(isVector(arguments[0])) {
        out[0] = arguments[0][0];
        out[1] = arguments[0][1];
        out[2] = arguments[0][2];
        out[3] = arguments[0][3];
        return out;
      }
        out[0] = arguments[0];
        out[1] = arguments[1];
        out[2] = arguments[2];
        out[3] = arguments[3];
        return out;
      case 3:
        out[0] = arguments[0][0];
        out[1] = arguments[0][1];
        out[2] = arguments[0][2];
        out[3] = 1.0;
        return out;
      default:
        throw "vec4: wrong arguments";
  }
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

function mat2()
{
    var out = new Array(2);
    out[0] = new Array(2);
    out[1] = new Array(2);

    switch ( arguments.length ) {
    case 0:
        out[0][0]=out[3]=1.0;
        out[1]=out[2]=0.0;
        break;
    case 1:
      if(arguments[0].type == 'mat2') {
        out[0][0] = arguments[0][0][0];
        out[0][1] = arguments[0][0][1];
        out[1][0] = arguments[0][1][0];
        out[1][1] = arguments[0][1][1];
        break;
      }

    case 4:
        out[0][0] = arguments[0];
        out[0][1] = arguments[1];
        out[1][0] = arguments[2];
        out[1][1] = arguments[3];
        break;
     default:
         throw "mat2: wrong arguments";
    }
    out.type = 'mat2';

    return out;
}

//----------------------------------------------------------------------------

function mat3()
{
    // v = _argumentsToArray( arguments );

    var out = new Array(3);
    out[0] = new Array(3);
    out[1] = new Array(3);
    out[2] = new Array(3);

    switch ( arguments.length ) {
      case 0:
          out[0][0]=out[1][1]=out[2][2]=1.0;
          out[0][1]=out[0][2]=out[1][0]=out[1][2]=out[2][0]=out[2][1]=0.0;
          break;
    case 1:
         for(var i=0; i<3; i++) for(var i=0; i<3; i++) {
           out[i][j]=arguments[0][3*i+j];
         }
        break;

    case 9:
        for(var i=0; i<3; i++) for(var j=0; j<3; j++) {
          out[i][j] = arguments[3*i+j];
        }
        break;
    default:
        throw "mat3: wrong arguments";
    }
    out.type = 'mat3';

    return out;
}

//----------------------------------------------------------------------------

function mat4()
{
    //var v = _argumentsToArray( arguments );

    var out = new Array(4);
    out[0] = new Array(4);
    out[1] = new Array(4);
    out[2] = new Array(4);
    out[3] = new Array(4);

    switch ( arguments.length ) {
    case 0:
      out[0][0]=out[1][1]=out[2][2]=out[3][3] = 1.0;
      out[0][1]=out[0][2]=out[0][3]=out[1][0]=out[1][2]=out[1][3]=out[2][0]=out[2][1]
        =out[2][3]=out[3][0]=out[3][1]=out[3][2]=0.0;

      break;

    case 1:
      for(var i=0; i<4; i++) for(var i=0; i<4; i++) {
        out[i][j]=arguments[0][4*i+j];
      }
      break;

    case 4:
      if(arguments[0].type == "vec4") {
      for( var i=0; i<4; i++)
        for(var j=0; j<4; j++)
          out[i][j] = arguments[i][j];
       break;
      }

    case 16:
      for(var i=0; i<4; i++) for(var j=0; j<4; j++) {
        out[i][j] = arguments[4*i+j];
      }
      break;
    }
    out.type = 'mat4';

    return out;
}

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

function equal( u, v )
{
    if(!(isMatrix(u)&&isMatrix(v) || (isVector(u)&&isVector(v))))
      throw "equal: at least one input not a vec or mat";
    if ( u.type != v.type ) throw "equal: types different";
    if(isMatrix(u)) {
        for ( var i = 0; i < u.length; ++i ) for ( var j = 0; j < u.length; ++j )
            if ( u[i][j] !== v[i][j] )  return false;
        return true;
    }
    if(isVector(u)) {
        for ( var i = 0; i < u.length; ++i )
            if ( u[i] !== v[i] )  return false;
          return true;
        }
}



//----------------------------------------------------------------------------

function add( u, v )
{

  if ( u.type != v.type ) {
      throw "add(): trying to add different types";
  }
  if(isVector(u)){
    var result = new Array(u.length);
    result.type = u.type;
    for(var i=0; i<u.length; i++) {
      result[i] = u[i] + v[i];
      }
      return result;
    }
  if(isMatrix(u)){
    if(u.type == 'mat2') var result = mat2();
    if(u.type == 'mat3') var result = mat3();
    if(u.type == 'mat4') var result = mat4();
    for(var i=0; i<u.length; i++) for(var j=0; j<u.length; j++){
       result[i][j] = u[i][j] + v[i][j];
      }
      return result;
    }
}

//----------------------------------------------------------------------------

function subtract( u, v )
{

  if ( u.type != v.type ) {
      throw "add(): trying to add different types";
  }
  if(isVector(u)){
    if(u.type == 'vec2')  var result =vec2();
    if(u.type == 'vec3')  var result = vec3();
    if(u.type == 'vec4')  var result = vec4();
    result.type = u.type;
    for(var i=0; i<u.length; i++) {
      result[i] = u[i] - v[i];
      }
      return result;
    }
  if(isMatrix(u)){
    if(u.type == 'mat2')  var result = mat2();
    if(u.type == 'mat3')  var result = mat3();
    if(u.type == 'mat4')  var result = mat4();
    for(var i=0; i<u.length; i++) for(var j=0; j<u.length; j++){
       result[i][j] = u[i][j] - v[i][j];
      }
      return result;
    }
}

//----------------------------------------------------------------------------

function mult( u, v )
{

  if(typeof(u)=="number" && (isMatrix(v)||isVector(v))) {

    if(isVector(v)){
      result = new Array(v.length);
      result.type = v.type;
      for(var i =0; i<v.length; i++) {
        result[i] = u*v[i];
      }
      return result;
    }
   if(v.type = 'mat2') result = mat2();
   if(v.type = 'mat3') result = mat3();
   if(v.type = 'mat4') result = mat4();
  }
  if(u.type=='mat2' && v.type == 'vec2') {
    var result = vec2();
    for(i=0;i<2;i++)  {
      result[i] = 0.0;
      for(var k=0;k<2;k++) result[i]+=u[i][k]*v[k];
    }
    return result;
  }
  if(u.type=='mat3'&& v.type=='vec3') {
    var result = vec3();
    for(i=0;i<3;i++)  {
      result[i] = 0.0;
      for(var k=0;k<3;k++) result[i]+=u[i][k]*v[k];
    }
    return result;
  }
  if(u.type=='mat4'&& v.type=='vec4')  {
    var result = vec4();
    for(i=0;i<4;i++)  {
      result[i] = 0.0;
      for(var k=0;k<4;k++) result[i]+=u[i][k]*v[k];
    }
    return result;
  }
 if (u.type=='mat2'&&v.type=='mat2'){
    result = mat2();
    for(i=0;i<2;i++) for(j=0;j<2;j++) {
      result[i][j] = 0.0;
      for(var k=0;k<2;k++) result[i][j]+=u[i][k]*v[k][j];
    }
    return result;
  }
 if (u.type=='mat3'&&v.type=='mat3'){
    result = mat3();
    for(i=0;i<3;i++) for(j=0;j<3;j++) {
      result[i][j] = 0.0;
      for(var k=0;k<3;k++) result[i][j]+=u[i][k]*v[k][j];
    }
    return result;
  }
  else if (u.type=='mat4'&&v.type=='mat4'){
    result = mat4();
    for(i=0;i<4;i++) for(j=0;j<4;j++) {
      result[i][j] = 0.0;
      for(var k=0;k<4;k++) result[i][j]+=u[i][k]*v[k][j];
    }

    return result;
  }
  if (u.type=='vec3'&&v.type=='vec3'){
    var result = vec3(u[0]*v[0], u[1]*v[1], u[2]*v[2]);
    return result;
  }
  if (u.type=='vec4'&&v.type=='vec4'){
    var result = vec4(u[0]*v[0], u[1]*v[1], u[2]*v[2], u[3]*v[3]);
    return result;
  }
    throw "mult(): trying to mult incompatible types";
}


//----------------------------------------------------------------------------
//
//  Basic Transformation Matrix Generators
//

function translate( x, y, z )
{
    if(arguments.length!=2 && arguments.length != 3) {
      throw "translate(): not a mat3 or mat4";
    }
    if(arguments.length == 2) {
      result = mat3();
      result[0][2] = x;
      result[1][2] = y;

      return result;
    }
      result = mat4();

      result[0][3] = x;
      result[1][3] = y;
      result[2][3] = z;

      return result;

}

//----------------------------------------------------------------------------

function rotate( angle, axis )
{
  if ( axis.length == 3 ) {
    axis = vec3(axis[0], axis[1], axis[2] );
  }
   if(arguments.length == 4) {
    axis = vec3(arguments[1], arguments[2], arguments[3]);
  }
    if(axis.type != 'vec3') throw "rotate: axis not a vec3";
    var v = normalize( axis );

    var x = v[0];
    var y = v[1];
    var z = v[2];

    var c = Math.cos( radians(angle) );
    var omc = 1.0 - c;
    var s = Math.sin( radians(angle) );

    var result = mat4(
        x*x*omc + c,   x*y*omc + z*s, x*z*omc - y*s, 0.0 ,
         x*y*omc - z*s, y*y*omc + c,   y*z*omc + x*s, 0.0 ,
         x*z*omc + y*s, y*z*omc - x*s, z*z*omc + c,   0.0 ,
        0.0, 0.0, 0.0, 1.0
    );
    return result;
}

function rotateX(theta) {
  var c = Math.cos( radians(theta) );
  var s = Math.sin( radians(theta) );
  var rx = mat4( 1.0,  0.0,  0.0, 0.0,
      0.0,  c,  -s, 0.0,
      0.0, s,  c, 0.0,
      0.0,  0.0,  0.0, 1.0 );
  return rx;
}
function rotateY(theta) {
  var c = Math.cos( radians(theta) );
  var s = Math.sin( radians(theta) );
  var ry = mat4( c, 0.0, s, 0.0,
      0.0, 1.0,  0.0, 0.0,
      -s, 0.0,  c, 0.0,
      0.0, 0.0,  0.0, 1.0 );
  return ry;
}
function rotateZ(theta) {
  var c = Math.cos( radians(theta) );
  var s = Math.sin( radians(theta) );
  var rz = mat4( c, -s, 0.0, 0.0,
      s,  c, 0.0, 0.0,
      0.0,  0.0, 1.0, 0.0,
      0.0,  0.0, 0.0, 1.0 );
  return rz;
}
//----------------------------------------------------------------------------


function scale( )
{
// legacy code
// should use mult

    if(arguments.length == 2 && isVector(arguments[1])) {
      result = new Array(arguments[1].length);
      result.type = arguments[1].type;
      for(var i=0; i<arguments[1].length; i++)
          result[i] = arguments[0]*arguments[1][i];
      return result;
    }
// end legacy code

    if(arguments.length == 3) {

    var result = mat4();
    result[0][0] = arguments[0];
    result[1][1] = arguments[1];
    result[2][2] = arguments[2];
    result[3][3] = 1.0;
    return result;
  }

  throw "scale: wrong arguments";

}


//----------------------------------------------------------------------------
//
//  ModelView Matrix Generators
//

function lookAt( eye, at, up )
{
    if ( eye.type != 'vec3') {
        throw "lookAt(): first parameter [eye] must be an a vec3";
    }

    if ( at.type != 'vec3') {
        throw "lookAt(): first parameter [at] must be an a vec3";
    }

    if (up.type != 'vec3') {
        throw "lookAt(): first parameter [up] must be an a vec3";
    }

    if ( equal(eye, at) ) {
        return mat4();
    }

    var v = normalize( subtract(at, eye) );  // view direction vector
    var n = normalize( cross(v, up) ); // perpendicular vector
    var u = normalize( cross(n, v) );        // "new" up vector
    v = negate( v );

    var result = mat4(
        n[0], n[1], n[2], -dot(n, eye),
        u[0], u[1], u[2], -dot(u, eye),
        v[0], v[1], v[2], -dot(v, eye),
        0.0,  0.0,  0.0,  1.0
    );

    return result;
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//

function ortho( left, right, bottom, top, near, far )
{
    if ( left == right ) { throw "ortho(): left and right are equal"; }
    if ( bottom == top ) { throw "ortho(): bottom and top are equal"; }
    if ( near == far )   { throw "ortho(): near and far are equal"; }

    var w = right - left;
    var h = top - bottom;
    var d = far - near;

    var result = mat4();

    result[0][0] = 2.0 / w;
    result[1][1] = 2.0 / h;
    result[2][2] = -2.0 / d;

    result[0][3] = -(left + right) / w;
    result[1][3] = -(top + bottom) / h;
    result[2][3] = -(near + far) / d;
    result[3][3] = 1.0;

    return result;
}

//----------------------------------------------------------------------------

function perspective( fovy, aspect, near, far )
{
    var f = 1.0 / Math.tan( radians(fovy) / 2 );
    var d = far - near;

    var result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}

//----------------------------------------------------------------------------
//
//  Matrix Functions
//

function transpose( m )
{
    if(m.type == 'patch') {
        var out = patch()
        for(var i=0; i<4; i++) out[i] = new Array(4);
        for(var i=0; i<4; i++)
          for(var j=0; j<4; j++) out[i][j] = m[j][i];
        return out;
    }

    switch(m.type) {
      case 'mat2':
        var result = mat2(m[0][0], m[1][0],
                          m[0][1], m[1][1]
                        );
        return result;
        break;

      case 'mat3':
        var result = mat3(m[0][0], m[1][0], m[2][0],
                        m[0][1], m[1][1], m[2][1],
                        m[0][2], m[1][2], m[2][2]
                      );
        return result;
        break;

      case 'mat4':

        var result = mat4(m[0][0], m[1][0], m[2][0], m[3][0],
                          m[0][1], m[1][1], m[2][1], m[3][1],
                          m[0][2], m[1][2], m[2][2], m[3][2],
                          m[0][3], m[1][3], m[2][3], m[3][3]
                        );

        return result;
        break;

      default: throw "transpose(): trying to transpose a non-matrix";
    }
}


//----------------------------------------------------------------------------
//
//  Vector Functions
//

function dot( u, v )
{

    if ( u.type != v.type ) {
      throw "dot(): types are not the same ";
    }
    if (u.type != 'vec2' && u.type != 'vec3' && u.type != 'vec4') {
      throw "dot(): not a vector ";
    }

    var sum = 0.0;
    for ( var i = 0; i < u.length; i++ ) {
        sum += u[i] * v[i];
    }
    return sum;
}

//----------------------------------------------------------------------------

function negate( u )
{
  if (u.type != 'vec2' && u.type != 'vec3' && u.type != 'vec4') {
    throw "negate(): not a vector ";
  }
  var result = new Array(u.length);
  result.type = u.type;
  for ( var i = 0; i < u.length; ++i ) {
    result[i] = -u[i];
  }
    return result;
}

//----------------------------------------------------------------------------

function cross( u, v )
{
    if ( u.type == 'vec3' && v.type == 'vec3') {
      var result = vec3(
          u[1]*v[2] - u[2]*v[1],
          u[2]*v[0] - u[0]*v[2],
          u[0]*v[1] - u[1]*v[0]
      );
      return result;
    }

    if ( v.type == 'vec4' && v.type == 'vec4') {
      var result = vec3(
          u[1]*v[2] - u[2]*v[1],
          u[2]*v[0] - u[0]*v[2],
          u[0]*v[1] - u[1]*v[0]
      );
      return result;
    }

    throw "cross: types aren't matched vec3 or vec4";
}

//----------------------------------------------------------------------------

function length( u )
{
    return Math.sqrt( dot(u, u) );
}

//----------------------------------------------------------------------------

function normalize( u, excludeLastComponent )
{
    if(u.type != 'vec3' && u.type != 'vec4') {

      throw "normalize: not a vector type";
    }
    switch(u.type) {
      case 'vec2':
        var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]);
        var result = vec2(u[0]/len, u[1]/len);
        return result;
      break;
      case 'vec3':
        if(excludeLastComponent) {
          var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]);
          var result = vec3(u[0]/len, u[1]/len, u[2]);
          return result;
          break;
        }
        else {
        var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]+u[2]*u[2]);
        var result = vec3(u[0]/len, u[1]/len, u[2]/len);
        return result;
        break;
      }
      case 'vec4':
      if(excludeLastComponent) {
        var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]+u[2]*u[2]);
        var result = vec4(u[0]/len, u[1]/len, u[2]/len, u[3]);
        return result;
        break;
      }
      else {
        var len = Math.sqrt(u[0]*u[0]+u[1]*u[1]+u[2]*u[2]+u[3]*u[3]);
        var result = vec4(u[0]/len, u[1]/len, u[2]/len, u[3]/len);
        return result;
        break;
      }
    }
}

//----------------------------------------------------------------------------

function mix( u, v, s )
{
    if ( typeof(s) !== "number" ) {
        throw "mix: the last paramter " + s + " must be a number";
    }
    if(typeof(u)=='number'&&typeof(v)=='number') {
      return (1.0-s)*u + s*v;
    }

    if ( u.length != v.length ) {

        throw "vector dimension mismatch";
    }

    var result = new Array(u.length);
    for ( var i = 0; i < u.length; ++i ) {
        result[i] =  (1.0 - s) * u[i] + s * v[i] ;
    }
    result.type = u.type;
    return result;
}

//----------------------------------------------------------------------------
//
// Vector and Matrix utility functions
//


function flatten( v )
{

    if(isVector(v)) {
      var floats = new Float32Array(v.length)
      for(var i =0; i<v.length; i++) floats[i] = v[i];
      return floats;
    }
    if(isMatrix(v)) {

        var floats = new Float32Array(v.length*v.length);
        for(var i =0; i<v.length; i++) for(j=0;j<v.length; j++) {
          floats[i*v.length+j] = v[j][i];
        }
        return floats;
      }

      var floats = new Float32Array( v.length*v[0].length  );

      for(var i = 0; i<v.length; i++) for(var j=0; j<v[0].length; j++) {
        floats[i*v[0].length+j] = v[i][j];
      }
      return floats;
}

//
//----------------------------------------------------------------------------


function cut(a)
{
  return Math.round(a*1000)/1000;
}
function printm(m)
{
    switch(m.type) {
      case 'mat2':
        console.log(cut(m[0][0]), cut(m[0][1]));
        console.log(cut(m[1][0]), cut(m[1][1]));
       break;
      case 'mat3':
       console.log(cut(m[0][0]), cut(m[0][1]), cut(m[0][2]));
       console.log(cut(m[1][0]), cut(m[1][1]), cut(m[1][2]));
       console.log(cut(m[2][0]), cut(m[2][1]), cut(m[2][2]));
       break;
      case 'mat4':
        console.log(cut(m[0][0]), cut(m[0][1]), cut(m[0][2]), cut(m[0][3]));
        console.log(cut(m[1][0]), cut(m[1][1]), cut(m[1][2]), cut(m[1][3]));
        console.log(cut(m[2][0]), cut(m[2][1]), cut(m[2][2]), cut(m[2][3]));
        console.log(cut(m[3][0]), cut(m[3][1]), cut(m[3][2]), cut(m[3][3]));
        break;
      case 'patch':
        for(var i=0;i<4;i++)
          console.log(m[i][0], m[i][1], m[i][2], m[i][3]);
         break;
      default: throw "printm: not a matrix";
    }
}
// determinants

function det2(m)
{

     return m[0][0]*m[1][1]-m[0][1]*m[1][0];

}

function det3(m)
{
     var d = m[0][0]*m[1][1]*m[2][2]
           + m[0][1]*m[1][2]*m[2][0]
           + m[0][2]*m[2][1]*m[1][0]
           - m[2][0]*m[1][1]*m[0][2]
           - m[1][0]*m[0][1]*m[2][2]
           - m[0][0]*m[1][2]*m[2][1]
           ;
     return d;
}

function det4(m)
{
     var m0 = [
         vec3(m[1][1], m[1][2], m[1][3]),
         vec3(m[2][1], m[2][2], m[2][3]),
         vec3(m[3][1], m[3][2], m[3][3])
     ];
     var m1 = [
         vec3(m[1][0], m[1][2], m[1][3]),
         vec3(m[2][0], m[2][2], m[2][3]),
         vec3(m[3][0], m[3][2], m[3][3])
     ];
     var m2 = [
         vec3(m[1][0], m[1][1], m[1][3]),
         vec3(m[2][0], m[2][1], m[2][3]),
         vec3(m[3][0], m[3][1], m[3][3])
     ];
     var m3 = [
         vec3(m[1][0], m[1][1], m[1][2]),
         vec3(m[2][0], m[2][1], m[2][2]),
         vec3(m[3][0], m[3][1], m[3][2])
     ];
     return m[0][0]*det3(m0) - m[0][1]*det3(m1)
         + m[0][2]*det3(m2) - m[0][3]*det3(m3);

}

function det(m)
{
     if(!isMatrix(m)) throw("det: m not a matrix");
     if(m.length == 2) return det2(m);
     if(m.length == 3) return det3(m);
     if(m.length == 4) return det4(m);
}


//---------------------------------------------------------

// inverses

function inverse2(m)
{
     var a = mat2();
     var d = det2(m);
     a[0][0] = m[1][1]/d;
     a[0][1] = -m[0][1]/d;
     a[1][0] = -m[1][0]/d;
     a[1][1] = m[0][0]/d;
     return a;
}

function inverse3(m)
{
    var a = mat3();
    var d = det3(m);

    var a00 = [
       vec2(m[1][1], m[1][2]),
       vec2(m[2][1], m[2][2])
    ];
    var a01 = [
       vec2(m[1][0], m[1][2]),
       vec2(m[2][0], m[2][2])
    ];
    var a02 = [
       vec2(m[1][0], m[1][1]),
       vec2(m[2][0], m[2][1])
    ];
    var a10 = [
       vec2(m[0][1], m[0][2]),
       vec2(m[2][1], m[2][2])
    ];
    var a11 = [
       vec2(m[0][0], m[0][2]),
       vec2(m[2][0], m[2][2])
    ];
    var a12 = [
       vec2(m[0][0], m[0][1]),
       vec2(m[2][0], m[2][1])
    ];
    var a20 = [
       vec2(m[0][1], m[0][2]),
       vec2(m[1][1], m[1][2])
    ];
    var a21 = [
       vec2(m[0][0], m[0][2]),
       vec2(m[1][0], m[1][2])
    ];
    var a22 = [
       vec2(m[0][0], m[0][1]),
       vec2(m[1][0], m[1][1])
    ];

   a[0][0] = det2(a00)/d;
   a[0][1] = -det2(a10)/d;
   a[0][2] = det2(a20)/d;
   a[1][0] = -det2(a01)/d;
   a[1][1] = det2(a11)/d;
   a[1][2] = -det2(a21)/d;
   a[2][0] = det2(a02)/d;
   a[2][1] = -det2(a12)/d;
   a[2][2] = det2(a22)/d;

   return a;

}

function inverse4(m)
{
    var a = mat4();
    var d = det4(m);

    var a00 = [
       vec3(m[1][1], m[1][2], m[1][3]),
       vec3(m[2][1], m[2][2], m[2][3]),
       vec3(m[3][1], m[3][2], m[3][3])
    ];
    var a01 = [
       vec3(m[1][0], m[1][2], m[1][3]),
       vec3(m[2][0], m[2][2], m[2][3]),
       vec3(m[3][0], m[3][2], m[3][3])
    ];
    var a02 = [
       vec3(m[1][0], m[1][1], m[1][3]),
       vec3(m[2][0], m[2][1], m[2][3]),
       vec3(m[3][0], m[3][1], m[3][3])
    ];
    var a03 = [
       vec3(m[1][0], m[1][1], m[1][2]),
       vec3(m[2][0], m[2][1], m[2][2]),
       vec3(m[3][0], m[3][1], m[3][2])
    ];
    var a10 = [
       vec3(m[0][1], m[0][2], m[0][3]),
       vec3(m[2][1], m[2][2], m[2][3]),
       vec3(m[3][1], m[3][2], m[3][3])
    ];
    var a11 = [
       vec3(m[0][0], m[0][2], m[0][3]),
       vec3(m[2][0], m[2][2], m[2][3]),
       vec3(m[3][0], m[3][2], m[3][3])
    ];
    var a12 = [
       vec3(m[0][0], m[0][1], m[0][3]),
       vec3(m[2][0], m[2][1], m[2][3]),
       vec3(m[3][0], m[3][1], m[3][3])
    ];
    var a13 = [
       vec3(m[0][0], m[0][1], m[0][2]),
       vec3(m[2][0], m[2][1], m[2][2]),
       vec3(m[3][0], m[3][1], m[3][2])
    ];
    var a20 = [
       vec3(m[0][1], m[0][2], m[0][3]),
       vec3(m[1][1], m[1][2], m[1][3]),
       vec3(m[3][1], m[3][2], m[3][3])
    ];
    var a21 = [
       vec3(m[0][0], m[0][2], m[0][3]),
       vec3(m[1][0], m[1][2], m[1][3]),
       vec3(m[3][0], m[3][2], m[3][3])
    ];
    var a22 = [
       vec3(m[0][0], m[0][1], m[0][3]),
       vec3(m[1][0], m[1][1], m[1][3]),
       vec3(m[3][0], m[3][1], m[3][3])
    ];
    var a23 = [
       vec3(m[0][0], m[0][1], m[0][2]),
       vec3(m[1][0], m[1][1], m[1][2]),
       vec3(m[3][0], m[3][1], m[3][2])
    ];

    var a30 = [
       vec3(m[0][1], m[0][2], m[0][3]),
       vec3(m[1][1], m[1][2], m[1][3]),
       vec3(m[2][1], m[2][2], m[2][3])
    ];
    var a31 = [
       vec3(m[0][0], m[0][2], m[0][3]),
       vec3(m[1][0], m[1][2], m[1][3]),
       vec3(m[2][0], m[2][2], m[2][3])
    ];
    var a32 = [
       vec3(m[0][0], m[0][1], m[0][3]),
       vec3(m[1][0], m[1][1], m[1][3]),
       vec3(m[2][0], m[2][1], m[2][3])
    ];
    var a33 = [
       vec3(m[0][0], m[0][1], m[0][2]),
       vec3(m[1][0], m[1][1], m[1][2]),
       vec3(m[2][0], m[2][1], m[2][2])
    ];



   a[0][0] = det3(a00)/d;
   a[0][1] = -det3(a10)/d;
   a[0][2] = det3(a20)/d;
   a[0][3] = -det3(a30)/d;
   a[1][0] = -det3(a01)/d;
   a[1][1] = det3(a11)/d;
   a[1][2] = -det3(a21)/d;
   a[1][3] = det3(a31)/d;
   a[2][0] = det3(a02)/d;
   a[2][1] = -det3(a12)/d;
   a[2][2] = det3(a22)/d;
   a[2][3] = -det3(a32)/d;
   a[3][0] = -det3(a03)/d;
   a[3][1] = det3(a13)/d;
   a[3][2] = -det3(a23)/d;
   a[3][3] = det3(a33)/d;

   return a;
}
function inverse(m)
{
   if(!isMatrix(m)) throw("inverse: m not a matrix");
   if(m.length == 2) return inverse2(m);
   if(m.length == 3) return inverse3(m);
   if(m.length == 4) return inverse4(m);
}

//---------------------------------------------------------

// normal matrix


function normalMatrix(m, flag)
{
    if(m.type!='mat4') throw "normalMatrix: input not a mat4";
    var a = inverse(transpose(m));
    if(arguments.length == 1 &&flag == false) return a;

    var b = mat3();
    for(var i=0;i<3;i++) for(var j=0; j<3; j++) b[i][j] = a[i][j];

    return b;
}
