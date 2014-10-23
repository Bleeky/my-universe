<html>
<head>
    <title>MyUniverse</title>
    <style>canvas { width: 100%; height: 100% }</style>
</head>
<body>

<div id="canvas">

</div>

<script src="three.min.js"></script>

<script>
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 200000;

    var G = 6.67384e-11;
    var G = 6.67384e-11; // m3 kg-1 s-2
    var SEC_PER_STEP = 8;
    var STEPS_PER_FRAME = 10000;
    var METERS_PER_UNIT = 1000000000;
    var MAX_TRAIL_VERTICES = 400;
    var MIN_GHOST_DISTANCE = 100;
    var GHOST_DISTANCE_SCALE = 80;
    var MAX_GHOST_OPACITY = 0.15;
    var PAUSED = false;

    function getAcceleration(distance, starMass) {
        return G * starMass / (Math.pow(distance, 2));
    }

    function createCamera() {
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.position.set(0, 600, 0);
        return camera;
    }

    function createRenderer() {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        var container = document.getElementById("canvas");
        container.appendChild(renderer.domElement);
        return renderer;
    }

    function getDistance(v1, v2) {
        var x = v1.x - v2.x;
        var y = v1.y - v2.y;
        var z = v1.z - v2.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    function updateVelocity(planet, star) {
        var vel = new THREE.Vector3();
        var speed;
        for(var i=0; i < STEPS_PER_FRAME; i++) {
            speed = getAcceleration(getDistance(star.position, planet.position) * METERS_PER_UNIT, star.astro.mass) * SEC_PER_STEP;
            vel.subVectors(star.position, planet.position).setLength(speed / METERS_PER_UNIT);
            planet.astro.vel.add(vel);

            planet.position.x += planet.astro.vel.x * SEC_PER_STEP;
            planet.position.y += planet.astro.vel.y * SEC_PER_STEP;
            planet.position.z += planet.astro.vel.z * SEC_PER_STEP;

        }
    }

    var scene = new THREE.Scene();
    var camera = createCamera();
    scene.add(camera);
    camera.lookAt(scene.position);


    astro = {};
    var geometry = new THREE.SphereGeometry(5, 32, 16);
    var texture = THREE.ImageUtils.loadTexture('1.jpg');
    var material = new THREE.MeshLambertMaterial({ map: texture });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(Math.cos(1 / 180 * Math.PI) * 80,
        Math.sin(1 / 180 * Math.PI) * 80, 0);
    sphere.astro = astro;
    sphere.astro.mass = 3.30104e23;
    sphere.astro.vel = new THREE.Vector3(0, 0, 4.74e-5);
    scene.add(sphere);

    var textureJupiter = THREE.ImageUtils.loadTexture('jupiter.jpg');
    astro = {};
    var geometry = new THREE.SphereGeometry(35, 32, 16);
    var material = new THREE.MeshLambertMaterial({ map: textureJupiter });
    var planet = new THREE.Mesh(geometry, material);
    planet.position.set(Math.cos(1 / 180 * Math.PI) * 100,
        Math.sin(1 / 180 * Math.PI) * 100, 0);
    planet.astro = astro;
    planet.astro.mass = 6.30104e23;
    planet.astro.vel = new THREE.Vector3(0, 0, 4.74e-5);
    scene.add(planet);

    var textureSun = THREE.ImageUtils.loadTexture('texture_sun.jpg');
    astro = {};
    var geometry = new THREE.SphereGeometry(20, 32, 16);
    var material = new THREE.MeshLambertMaterial({ color: 0xff3300, specular: 0x555555, map: textureSun, emissive: 0xffffff});
    var star = new THREE.Mesh(geometry, material);
    star.position.set(0, 0, 0);
    star.astro = astro;
    star.astro.mass = 1.988435e30;
    scene.add(star);

    var ambientLight = new THREE.PointLight(0xCCCCCC, 2);
    ambientLight.position.set(0, 0, 0);
    scene.add(ambientLight);

    var renderer = createRenderer();


    function render() {
//        ambientLight.position.set(planet.position.x, planet.position.y, planet.position.z);
        renderer.render(scene, camera);
        star.rotateX(0.1);
        star.rotateY(0.1);
        star.rotateZ(0.1);
        planet.rotateX(0.1);
        planet.rotateY(0.1);
        planet.rotateZ(0.1);
        updateVelocity(sphere, star);
        updateVelocity(planet, star);
        requestAnimationFrame(render);
    }
    render();
</script>
</body>
</html>