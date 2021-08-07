

var cube, cubeGeometry, cubeMaterial;
var camera, scene, renderer;

var flag = false;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;

init();

function init() {

	 scene = new THREE.Scene();

	 camera = new THREE.OrthographicCamera( -1.0, 1.0, -1.0, 1.0, -10.0, 10.0 );
	 renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(0xEEEEEE);
	renderer.setSize(512, 512);

	document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
	document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
	document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
	document.getElementById("ButtonT").onclick = function(){flag = !flag;};

	cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(0, 0, -20);
	scene.add(directionalLight);

  cubeMaterial = new THREE.MeshPhongMaterial( { color: 0xffc000, specular: 0xffc000, shininess: 100} );
	cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

	scene.add(cube);

	camera.position.x = 0.0;
	camera.position.y = 0.0;
	camera.position.z = 2.0;
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
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}
