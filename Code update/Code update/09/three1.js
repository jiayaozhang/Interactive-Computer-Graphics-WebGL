


window.onload = function init() {

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 45, 1.0, 0.3, 4.0 );
	var renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(0xEEEEEE);
	renderer.setSize(512, 512);
	document.body.appendChild(renderer.domElement);

	var cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
	var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true} );
	var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

	scene.add(cube);

	camera.position.x = 2.0;
	camera.position.y = 2.0;
	camera.position.z = -2.0;
	camera.lookAt(scene.position);

	renderer.render(scene, camera);

}
