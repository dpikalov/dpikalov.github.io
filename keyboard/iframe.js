var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}


$(function () {
    var WIDTH = window.innerWidth;
    var HEIGHT= window.innerHeight;

    var rendererCSS	= new THREE.CSS3DRenderer();
    rendererCSS.setSize( window.innerWidth, window.innerHeight );
    rendererCSS.domElement.style.position	= 'absolute';
    rendererCSS.domElement.style.top	= 0;
    rendererCSS.domElement.style.margin	= 0;
    rendererCSS.domElement.style.padding	= 0;
    document.body.appendChild( rendererCSS.domElement );

    var element	= document.createElement('iframe')
    element.src = 'http://d3.ru'
    element.style.width = '1280px';
    element.style.height = '640px';

    var objectCSS 	= new THREE.CSS3DObject( element );
    window.objectCSS	= objectCSS
	objectCSS.scale.multiplyScalar(/*1/63.5*/1/50)
	scene.add( objectCSS );

    //
    var plane = new THREE.Mesh( 
        new THREE.PlaneGeometry(),
        new THREE.MeshBasicMaterial({ wireframe: true/*, opacity:0, blending:THREE.NoBlending*/ })
    );
    scene.add(plane);
//    objectCSS.rotation.z = 0.3 * Math.PI;
//    objectCSS.rotation.x = 0.2 * Math.PI;
var xAxis = new THREE.Vector3(1,0,0);
rotateAroundWorldAxis(objectCSS, new THREE.Vector3(1,0,0), 33* Math.PI / 180);
rotateAroundWorldAxis(objectCSS, new THREE.Vector3(0,0,1), 55* Math.PI / 180);

    objectCSS.position.x =-16;
    objectCSS.position.y = 16;
    objectCSS.position.z =-1;

    window.addEventListener('resize', function () {
        WIDTH = window.innerWidth;
        HEIGHT= window.innerHeight;
        rendererCSS.setSize( WIDTH, HEIGHT );
    }, false);

    (function render() {
        window.requestAnimationFrame(render);
        rendererCSS.render( scene, camera );
    })();
});
