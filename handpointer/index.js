var abs  = Math.abs.bind (Math);
var sqrt = Math.sqrt.bind(Math);
var atan2= Math.atan2.bind(Math);

var scene = new THREE.Scene();
var pointer = undefined;
var v0={x:0,y:0,z:0}; t0=+new Date;
var gRot = {};

function rotate(alpha, beta, gamma) {
  cube.rotation.x =-beta;
  cube.rotation.y =-gamma;
  cube.rotation.z =-alpha;
}

(function () {
try{
    var lastTouch = {};

    var ws = new WebSocket('ws://localhost:8887');
    ws.onmessage = function(e) {
        var o = JSON.parse(e.data);
        if (o.type == "deviceorientation") {
          var d = abs(o.alpha) + abs(o.beta) + abs(o.gamma);
          rotate(THREE.Math.degToRad(o.alpha), THREE.Math.degToRad(o.beta), THREE.Math.degToRad(o.gamma));
        }
        if (o.type == "devicemotion") {
        }
        if (o.type == 'touchstart') {
            lastTouch = o.touches[0];
        }
        if (o.type == 'touchend' || o.type == 'touchcancel') {
            cube.position.set(0,0,0);
        }
        if (o.type == 'touchmove') {
            var dx = o.touches[0].clientX - lastTouch.clientX;
            var dy = o.touches[0].clientY - lastTouch.clientY;
            lastTouch = o.touches[0];

            cube.position.x += dx/5;
            cube.position.y -= dy/5;
        }
        if (o.type == undefined) {
            pointer = Math.PI/2 - Math.atan2(o.y, o.x);
        }
    }
}catch(e){
alert(e)}
})();

$(function () {
    var WIDTH = window.innerWidth;
    var HEIGHT= window.innerHeight;

    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40, 40, 40),
        new THREE.MeshBasicMaterial({color: 0x888888, wireframe:true})
    );
    scene.add(plane);
    scene.rotation.x =-0.5*Math.PI;

    var cubeGeometry = new THREE.BoxGeometry(10, 10, 10, 5, 5, 5);
    var cubeMaterials= [
        new THREE.MeshLambertMaterial({ambient: 0xffffff, map: THREE.ImageUtils.loadTexture('img/1.png')}),
        new THREE.MeshLambertMaterial({ambient: 0xffffff, map: THREE.ImageUtils.loadTexture('img/2.png')}),
        new THREE.MeshLambertMaterial({ambient: 0xffffff, map: THREE.ImageUtils.loadTexture('img/3.png')}),
        new THREE.MeshLambertMaterial({ambient: 0xffffff, map: THREE.ImageUtils.loadTexture('img/4.png')}),
        new THREE.MeshLambertMaterial({ambient: 0xffffff, map: THREE.ImageUtils.loadTexture('img/5.png')}),
        new THREE.MeshLambertMaterial({ambient: 0xffffff, map: THREE.ImageUtils.loadTexture('img/6.png')})
    ]
    window.cube = new THREE.Mesh(cubeGeometry, new THREE.MeshFaceMaterial(cubeMaterials));
    scene.add(cube);
//window.cube = new THREE.Object3D();
//scene.add(cube);

//var p = new THREE.Mesh(cubeGeometry, new THREE.MeshFaceMaterial(cubeMaterials));
//p.position.z = 20;
//cube.add(p);

    scene.add(new THREE.AmbientLight(0xffffff));

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0xffffff, 1);

    var effect = new THREE.OculusRiftEffect( renderer, {
		HMD: {
        hResolution: WIDTH,
		vResolution: HEIGHT,
		hScreenSize: 0.12576,
		vScreenSize: 0.07074,
		interpupillaryDistance: 0.0635,
		lensSeparationDistance: 0.0635,
		eyeToScreenDistance: 0.041,
		distortionK : [1.0, 0.22, 0.24, 0.0],
		chromaAbParameter: [ 0.996, -0.004, 1.014, 0.0]
        //chromaAbParameter: [ 0, 0, 1.0, 0.0]
        }
    });
	//effect.setSize( WIDTH, HEIGHT);
    //effect.setClearColor(0xffffff, 1);

    window.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.x = 10;
    camera.position.y = 10;
    camera.position.z = 10;
    camera.lookAt(scene.position);

    window.addEventListener('resize', function () {
        WIDTH = window.innerWidth;
        HEIGHT= window.innerHeight;

        renderer.setSize( WIDTH, HEIGHT );
        effect.setSize( WIDTH, HEIGHT );

        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    }, false);

    //var effect = new THREE.AsciiEffect( renderer );
    //effect.setSize(WIDTH, HEIGHT);
    //$('#output').append(effect.domElement);
    $('#output').append(renderer.domElement);

    var axisHelper = new THREE.AxisHelper( 20 );
    scene.add( axisHelper );

    var oX = cube.worldToLocal(new THREE.Vector3(1,0,0));
    var oY = cube.worldToLocal(new THREE.Vector3(0,1,0));
    var oZ = cube.worldToLocal(new THREE.Vector3(0,0,1));

    (function render() {
        window.requestAnimationFrame(render);
        //renderer.render(scene, camera);
        effect.render(scene, camera);
    })()
});

