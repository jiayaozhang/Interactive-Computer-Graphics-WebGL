

var cube, cubeGeometry, cubeColors;
var camera, scene, renderer;
var flag = false;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;

init();
function init() {


	 scene = new THREE.Scene();
	 camera = new THREE.PerspectiveCamera( 45, 1.0, 0.3, 4.0 );
	 renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(0xEEEEEE);
	renderer.setSize(512, 512);

	document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
	document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
	document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
	document.getElementById("ButtonT").onclick = function(){flag = !flag;};


// Cube

			  cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );

				cubeColors = [];
				cubeColors[0]=cubeColors[1]=0xff0000;
				cubeColors[2]=cubeColors[3]=0x00ff00;
				cubeColors[4]=cubeColors[5]=0x0000ff;
				cubeColors[6]=cubeColors[7]=0xffff00;
				cubeColors[8]=cubeColors[9]=0xff00ff;
				cubeColors[10]=cubeColors[11]=0x00ffff;

				for ( var i = 0; i < cubeGeometry.faces.length; i++ ) {
					cubeGeometry.faces[ i ].color.setHex( cubeColors[i] );
				}

				var cubeMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors} );
			  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

				cube.position.x = 0.0;
				cube.position.y = 0.0;
				cube.position.z = 0.0;

				scene.add(cube);

				camera.position.x = 2.0;
				camera.position.y = 2.0;
				camera.position.z = -2.0;
				camera.lookAt(scene.position);


				document.body.appendChild(renderer.domElement);
        render();

			}

      function render() {
        if(flag) {
					if(axis == 0) cube.rotation.x += 0.03;
					else if(axis == 1) cube.rotation.y += 0.03;
					else cube.rotation.z += 0.03;
				}
				requestAnimationFrame( render );
				renderer.render(scene, camera);
			}
