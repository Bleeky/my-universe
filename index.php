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
    var SEC_PER_STEP = 8;
    var STEPS_PER_FRAME = 10000;
    var METERS_PER_UNIT = 1000000000;
    var MAX_TRAIL_VERTICES = 500;

    function getAcceleration(distance, starMass) {
        return G * starMass / (Math.pow(distance, 2));
    }

    function createCamera() {
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.position.set(0, 2000, 0);
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
    function leaveTrail(sphere) {
        sphere.astro.trail.geometry.vertices.unshift(new THREE.Vector3().copy(sphere.position));
        sphere.astro.trail.geometry.vertices.length = MAX_TRAIL_VERTICES;
        sphere.astro.trail.geometry.verticesNeedUpdate = true;
    }
    function createTrail(x, y, z) {
        var trailGeometry = new THREE.Geometry();
        for (i = 0; i < MAX_TRAIL_VERTICES; i++) {
            trailGeometry.vertices.push(new THREE.Vector3(x, y, z));
        }
        var trailMaterial = new THREE.LineBasicMaterial();
        return new THREE.Line(trailGeometry, trailMaterial);
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
            if (i % STEPS_PER_FRAME === 0) {
                leaveTrail(planet);
            }
        }
    }


    var scene = new THREE.Scene();

    var camera = createCamera();
    scene.add(camera);
    camera.lookAt(scene.position);

    scale = 200;
    // All units are in MegaMeters !

    var JupiterRadius = 0.069173 * scale;
    var JupiterDistance = 792.5;
    var JupiterSpeed = 1.3e-5;
    var JupiterInclination = 1.3053;
    var JupiterMass = 1.89813e27;

    var SunRadius = 0.6955 * scale;
    var SunMass = 3.988435e30;


    var textureJupiter = THREE.ImageUtils.loadTexture('jupiter.jpg');
    astro = {};
    var geometry = new THREE.SphereGeometry(JupiterRadius, 32, 16);
    var material = new THREE.MeshLambertMaterial({ map: textureJupiter });
    var Jupiter = new THREE.Mesh(geometry, material);
    Jupiter.position.set(Math.cos(JupiterInclination / 180 * Math.PI) * JupiterDistance,
        Math.sin(JupiterInclination / 180 * Math.PI) * JupiterDistance, 0);
    Jupiter.astro = astro;
    Jupiter.astro.mass = JupiterMass;
    Jupiter.astro.vel = new THREE.Vector3(0, 0, JupiterSpeed);
    Jupiter.astro.trail = createTrail(Math.cos(JupiterInclination / 180 * Math.PI) * JupiterDistance,
        Math.sin(JupiterInclination / 180 * Math.PI) * JupiterDistance, 0);
    scene.add(Jupiter);
    scene.add(Jupiter.astro.trail);

    var textureSun = THREE.ImageUtils.loadTexture('texture_sun.jpg');
    astro = {};
    var geometry = new THREE.SphereGeometry(SunRadius, 32, 16);
    var material = new THREE.MeshLambertMaterial({ color: 0xff3300, specular: 0x555555, map: textureSun, emissive: 0xffffff});
    var Sun = new THREE.Mesh(geometry, material);
    Sun.position.set(0, 0, 0);
    Sun.astro = astro;
    Sun.astro.mass = SunMass;
    scene.add(Sun);

    var ambientLight = new THREE.PointLight(0xCCCCCC, 2);
    ambientLight.position.set(0, 0, 0);
    scene.add(ambientLight);

    var texture = THREE.ImageUtils.loadTexture( 'stars.png' );
    var backgroundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2, 0),
        new THREE.MeshBasicMaterial({
            map: texture
        }));

    backgroundMesh .material.depthTest = false;
    backgroundMesh .material.depthWrite = false;

    // Create your background scene
    var backgroundScene = new THREE.Scene();
    var backgroundCamera = new THREE.Camera();
    backgroundScene .add(backgroundCamera );
    backgroundScene .add(backgroundMesh );


    var renderer = createRenderer();


    function render() {
        renderer.autoClear = false;
        renderer.clear();
        renderer.render(backgroundScene , backgroundCamera );
        renderer.render(scene, camera);
        updateVelocity(Jupiter, Sun);
        Sun.rotateY(-0.01);
        requestAnimationFrame(render);
    }
    render();
</script>
</body>
</html>