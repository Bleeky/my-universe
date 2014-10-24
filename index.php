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
    var SEC_PER_STEP = 18;
    var STEPS_PER_FRAME = 10000;
    var METERS_PER_UNIT = 1000000000;
    var MAX_TRAIL_VERTICES = 500;


    function createCamera() {
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.position.set(0, 4500, 0);
        return camera;
    }

    function createRenderer() {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        var container = document.getElementById("canvas");
        container.appendChild(renderer.domElement);
        return renderer;
    }
    function getAcceleration(distance, starMass) {
        return G * starMass / (Math.pow(distance, 2));
    }
    function getDistance(v1, v2) {
        var x = v1.x - v2.x;
        var y = v1.y - v2.y;
        var z = v1.z - v2.z;
        return Math.sqrt(x * x + y * y + z * z);
    }
    function leaveTrail(sphere) {
        sphere.physics.trail.geometry.vertices.unshift(new THREE.Vector3().copy(sphere.position));
        sphere.physics.trail.geometry.vertices.length = MAX_TRAIL_VERTICES;
        sphere.physics.trail.geometry.verticesNeedUpdate = true;
    }
    function createTrail(x, y, z) {
        var trailGeometry = new THREE.Geometry();
        for (var i = 0; i < MAX_TRAIL_VERTICES; i++) {
            trailGeometry.vertices.push(new THREE.Vector3(x, y, z));
        }
        var trailMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00});
        return new THREE.Line(trailGeometry, trailMaterial);
    }
    function calculateVelocity(planet, star) {
        var velocity = new THREE.Vector3();
        var speed;
        for(var i = 0; i < STEPS_PER_FRAME; i++) {
            speed = getAcceleration(getDistance(star.position, planet.position) * METERS_PER_UNIT, star.physics.mass) * SEC_PER_STEP;
            velocity.subVectors(star.position, planet.position).setLength(speed / METERS_PER_UNIT);
            planet.physics.vel.add(velocity);

            planet.position.x += planet.physics.vel.x * SEC_PER_STEP;
            planet.position.y += planet.physics.vel.y * SEC_PER_STEP;
            planet.position.z += planet.physics.vel.z * SEC_PER_STEP;

            if (i % STEPS_PER_FRAME === 0) {
                leaveTrail(planet);
            }
        }
    }

    function CreatePlanet(type, name, texturePath, radius, distance, speed, inclination, mass) {
        var texturePlanet = THREE.ImageUtils.loadTexture(texturePath);
        var physics = {};
        var geometry = new THREE.SphereGeometry(radius, 32, 16);
        var material = new THREE.MeshLambertMaterial({ map: texturePlanet });
        var Planet = new THREE.Mesh(geometry, material);
        Planet.position.set(Math.cos(inclination / 180 * Math.PI) * distance,
            Math.sin(inclination / 180 * Math.PI) * distance, 0);
        Planet.physics = physics;
        Planet.physics.name = name;
        Planet.physics.type = type;
        Planet.physics.mass = mass;
        if (Planet.physics.type == "Standard" || Planet.physics.type == "Rings") {
            Planet.physics.vel = new THREE.Vector3(0, 0, speed);
            Planet.physics.trail = createTrail(Math.cos(inclination / 180 * Math.PI) * distance,
                Math.sin(inclination / 180 * Math.PI) * distance, 0);
            scene.add(Planet.physics.trail);
        }

        if (Planet.physics.type == "Rings") {
            var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            var geometry = new THREE.RingGeometry(1000, 1100, 32);


            var circle = new THREE.Mesh(geometry, material);
            Planet.physics.rings = circle;
            Planet.physics.rings.position.set(0, 0, 0);
            scene.add(Planet.physics.rings);
        }

        scene.add(Planet);
        return (Planet);
    }

    var scene = new THREE.Scene();

    var camera = createCamera();
    scene.add(camera);
    camera.lookAt(scene.position);

    scale = 200;
    // All units are in GigaMeters !

    var JupiterRadius = 0.069173 * scale;
    var JupiterDistance = 792.5;
    var JupiterSpeed = 1.3e-5;
    var JupiterInclination = 1.3053;
    var JupiterMass = 1.89813e27;

    var SunRadius = 0.6955 * scale;
    var SunMass = 3.988435e30;

    var SaturnRadius = 0.057316 * scale;
    var SaturnDistance = 1490;
    var SaturnSpeed = 9.64e-6;
    var SaturnInclination = 2.48446;
    var SaturnMass = 5.98319e26;

    var textureSun = THREE.ImageUtils.loadTexture('texture_sun.jpg');
    var physics = {};
    var geometry = new THREE.SphereGeometry(SunRadius, 32, 16);
    var material = new THREE.MeshLambertMaterial({ color: 0xff3300, specular: 0x555555, map: textureSun, emissive: 0xffffff});
    var Sun = new THREE.Mesh(geometry, material);
    Sun.position.set(0, 0, 0);
    Sun.physics = physics;
    Sun.physics.mass = SunMass;
    scene.add(Sun);

    Jupiter = CreatePlanet('Standard', 'Jupiter', 'jupiter.jpg', 0.069173 * scale, 792.5, 1.3e-5, 1.3053, 1.89813e27);
    Saturn = CreatePlanet('Rings', 'Saturn', 'saturn.jpg', 0.057316 * scale, 1490, 9.64e-6, 2.48446, 5.98319e26);


    var ambientLight = new THREE.PointLight(0xCCCCCC, 2);
    ambientLight.position.set(0, 0, 0);
    scene.add(ambientLight);


    var renderer = createRenderer();


    function render() {

        calculateVelocity(Jupiter, Sun);
        calculateVelocity(Saturn, Sun);

        Sun.rotateY(-0.01);

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
</script>
</body>
</html>