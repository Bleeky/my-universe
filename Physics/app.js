

var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 30000;

var G = 6.67384e-11;
var SEC_PER_STEP = 4;
var STEPS_PER_FRAME = 10000;
var METERS_PER_UNIT = 1000000000;
var MAX_TRAIL_VERTICES = 500;


function createCamera() {
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(0, 4500, 0);
    return camera;
}
function createTrail(x, y, z) {
    var trailGeometry = new THREE.Geometry();
    for (var i = 0; i < MAX_TRAIL_VERTICES; i++) {
        trailGeometry.vertices.push(new THREE.Vector3(x, y, z));
    }
    var trailMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00});
    return new THREE.Line(trailGeometry, trailMaterial);
}
function createRenderer() {
    var renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    var container = document.getElementById('container');
    container.appendChild( renderer.domElement );
    window.addEventListener('resize', onWindowResize, false );
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

    Planet.physics.vel = new THREE.Vector3(0, 0, speed);
    Planet.physics.trail = createTrail(Math.cos(inclination / 180 * Math.PI) * distance,
        Math.sin(inclination / 180 * Math.PI) * distance, 0);
    scene.add(Planet.physics.trail);


//        var geometry = new THREE.TextGeometry(name, {size: 1, height: 10, font: 'optimer', weight: 'normal' });
//        var material = new THREE.THREE.MeshBasicMaterial({ color: 0xffff00 });
//        var text = new THREE.Mesh(geometry, material);
//        text.position.set(Math.cos(inclination / 180 * Math.PI) * distance,
//            Math.sin(inclination / 180 * Math.PI) * distance, 0);
//        scene.add(text);

    scene.add(Planet);
    return (Planet);
}

var scene = new THREE.Scene();
var camera = createCamera();
scene.add(camera);
camera.lookAt(scene.position);

controls = new THREE.OrbitControls(camera);

var scale = 200;
// All units are in GigaMeters !

var SunRadius = 0.6955 * scale;
var SunMass = 3.988435e30;

var textureSun = THREE.ImageUtils.loadTexture('./Textures/sun.jpg');
var physics = {};
var geometry = new THREE.SphereGeometry(SunRadius, 32, 16);
var material = new THREE.MeshLambertMaterial({ color: 0xff3300, specular: 0x555555, map: textureSun, emissive: 0xffffff});
var Sun = new THREE.Mesh(geometry, material);
Sun.position.set(0, 0, 0);
Sun.physics = physics;
Sun.physics.mass = SunMass;
scene.add(Sun);

Jupiter = CreatePlanet('Standard', 'Jupiter', './Textures/jupiter.jpg', 0.069173 * scale, 792.5, 1.3e-5, 1.3053, 1.89813e27);
Saturn = CreatePlanet('Rings', 'Saturn', './Textures/saturn.jpg', 0.057316 * scale, 1490, 9.64e-6, 2.48446, 5.98319e26);
Earth = CreatePlanet('Standard', 'Earth', './Textures/earth.jpg', 0.0063674447 * scale, 900, 1.38e-5, 5e-5, 5.9721986e24);

var ambientLight = new THREE.PointLight(0xffffff, 2);
ambientLight.position.set(0, 0, 0);
scene.add(ambientLight);

var renderer = createRenderer();


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}
function animate() {
    render();
    requestAnimationFrame(animate);
    controls.update();
}
function render() {
    calculateVelocity(Jupiter, Sun);
    calculateVelocity(Saturn, Sun);
    calculateVelocity(Earth, Sun);
    Sun.rotateY(-0.001);
    renderer.render(scene, camera);
}
animate();
