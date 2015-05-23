var abs  = Math.abs.bind (Math);
var sin  = Math.sin.bind (Math);
var cos  = Math.cos.bind (Math);
var sqrt = Math.sqrt.bind(Math);
var atan2= Math.atan2.bind(Math);

var POINTER_RADIUS = 1;
var KEY_BTN_SIZE = 2.0;
var RUN_FLIGHT = true;

var scene = new THREE.Scene();
var keyboard= undefined;

/**/
function createKey (ch) {
    var ret = new THREE.Mesh(
        new THREE.PlaneGeometry(KEY_BTN_SIZE, KEY_BTN_SIZE, 1, 1),
        new THREE.MeshBasicMaterial({color: 0xffffff, wireframe:false})
    );
    ret.name = ch;

    var txt = new THREE.Mesh(
        new THREE.TextGeometry(ch, { size: 0.5, height: 0.01, weight: 'bold' }),
        new THREE.MeshBasicMaterial({color: 0x888888, overdraw: true})
    );
    txt.position.set(-0.13, -0.13, 0);

    ret.add(txt);
    return ret;
}

/**/
function createKeyboard() {
    var keys = [
        "1234567890-=",
        "QWERTYUIOP[]",
        "ASDFGHJKL;'",
        "ZXCVBNM,./"
    ];

    var ret = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 10, 1, 1),
        new THREE.MeshBasicMaterial({color: 0x008800, wireframe:false})
    );

    for (var i=0; i < keys.length; i++) {
        var line = keys[i].split('');
        for (var j=0; j < line.length; j++) {
            var dx = (line.length / 2 - j) * KEY_BTN_SIZE * 1.1 - KEY_BTN_SIZE * 1.1 / 2;
            var dy = (keys.length / 2 - i) * KEY_BTN_SIZE * 1.1 - KEY_BTN_SIZE * 1.1 / 2;
            var key = createKey(line[j]);
            key.position.set(-dx, dy, 0.01);
            ret.add(key);
        }
    }
    ret.position.z = 0.1;
    ret.rotation.z = 0.30 * Math.PI;
    //ret.rotation.z =0.5*Math.PI;
    return ret;
}

function createFingersGroup () {
    var ret = new THREE.Object3D();
    for (var i=0; i<10; i++) {
        var finger = createFinger();
        ret.add(finger);
    }
    ret.name="fingers";
    return ret;
}

/**/
function createFinger (xyz) {
    return new THREE.Mesh(
        new THREE.SphereGeometry( POINTER_RADIUS, 32, 32),
        new THREE.MeshBasicMaterial( {color: 0xff0000, opacity: .7, transparent:true} )
    );
}

/**/
function findHovered(finger) {
    var v0 = finger.position.clone();
    v0.applyMatrix4( finger.matrixWorld );

    var closest = {key:null, dist: Infinity};
    var hovered = keyboard.children.filter(function (key) {
        var v1 = key.position.clone();
        v1.applyMatrix4( keyboard.matrixWorld );

        var dist = v0.distanceTo(v1);
        if (closest.dist > dist) {
            closest.key  = key;
            closest.dist = dist;
        }
    })

    if (closest.dist < POINTER_RADIUS*3)
        return closest.key;
}

/**/
function clearHovered (){
    keyboard.children.forEach(function (key) {
        key.material.color = new THREE.Color(0xffffff);
    });
}

/**/
function drawHovered (finger) {
    var key = findHovered(finger);
    if (key) {
        key.material.color = new THREE.Color(0x00ff00);
    }
}

function showStats() {
    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );
    return stats;
}


$(function () {
    THREE.ImageUtils.crossOrigin = '';
    var WIDTH = window.innerWidth;
    var HEIGHT= window.innerHeight;

    // 
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 100, 100),
        new THREE.MeshBasicMaterial({color: 0x888888, wireframe:true})
    );
    scene.add(plane);
    scene.rotation.x =-0.5*Math.PI;

    // Keyboard
    window.keyboard = createKeyboard();
    scene.add(keyboard);

    // Fingers group
    var fingersGroup = createFingersGroup();
    fingersGroup.position.set(-9,-7, 0);
    scene.add(fingersGroup);

    //
    scene.add(new THREE.AmbientLight(0xffffff));

    //
    var stats = showStats();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0xffffff, 1);

    var effect = new THREE.OculusRiftEffect(renderer);
	effect.setSize( WIDTH, HEIGHT);
    //effect.setClearColor(0xffffff, 1);

    window.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.x = 15;
    camera.position.y = 15;
    camera.position.z = 15;
    camera.lookAt(scene.position);

    window.addEventListener('resize', function () {
        WIDTH = window.innerWidth;
        HEIGHT= window.innerHeight;

        renderer.setSize( WIDTH, HEIGHT );
        effect.setSize( WIDTH, HEIGHT );

        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    }, false);

    $('#output').append(renderer.domElement);

    var axisHelper = new THREE.AxisHelper( 20 );
    scene.add( axisHelper );

    var a = 0;
    (function render() {
        window.requestAnimationFrame(render);
        stats.begin();
        clearHovered();

        var group  = scene.getObjectByName("fingers", true) || {};
        var fingers= group.children || [];
        fingers.forEach(function (finger, i) {
            drawHovered(finger);
            if (RUN_FLIGHT) {
                a += 0.003;
                finger.position.y = .7*sin(a) + 2*i;
                finger.position.x = i/5*.73*cos(a) + 1.5*i;
                finger.position.z = 0.5//1.5+.2*cos(a);
            }
        })

        renderer.render(scene, camera);
        //effect.render(scene, camera);
        stats.end();
    })();
});

$(function() {
    var fingersGroup = scene.getObjectByName("fingers", true);

    function updateFingerPosition (lmFinger, i) {
        var v = lmFinger.tipPosition;
        if (v) {
            var x = v[0] / 10;
            var z = v[1] / 10 - 5;
            var y = v[2] / 10;
            fingersGroup.add(createFinger(x, y, z));
        }
    }

    Leap.loop(function(frame) {
        scene.remove(fingersGroup.children);
        (frame.hands || []).forEach(function (hand) {
            (hand.fingers || []).forEach(createFingerPosition);
        })
    })
})
