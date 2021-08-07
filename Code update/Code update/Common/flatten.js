function flatten( v )
{

    if(!Array.isArray(v)) return v;


    if(typeof(v[0])=='number'){
      var floats = new Float32Array( v.length );

      for(var i = 0; i<v.length; i++)
          floats[i] = v[i];

      return floats;
    }

    var floats = new Float32Array( v.length*v[0].length  );

    for(var i = 0; i<v.length; i++) for(var j=0; j<v[0].length; j++) {
      floats[i*v[0].length+j] = v[i][j];

    }

    return floats;
}
