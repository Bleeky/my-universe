

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



function CelestialBody(type, name, texturePath, radius, distance, speed, inclination, mass) {
    var physics = {};
    var geometry = new THREE.SphereGeometry(radius, 32, 16);
    var texturePlanet = THREE.ImageUtils.loadTexture(texturePath);

    if (type == "Star") {
        var material = new THREE.MeshLambertMaterial({ color: 0xff3300, specular: 0x555555, map: texturePlanet, emissive: 0xffffff});
        this.Sphere = new THREE.Mesh(geometry, material);
        this.Sphere.position.set(0, 0, 0);
    }
    else {
        var material = new THREE.MeshLambertMaterial({ map: texturePlanet });
        this.Sphere = new THREE.Mesh(geometry, material);
        this.Sphere.position.set(Math.cos(inclination / 180 * Math.PI) * distance,
            Math.sin(inclination / 180 * Math.PI) * distance, 0);
    }
    this.Sphere.physics = physics;
    this.Sphere.physics.name = name;
    this.Sphere.physics.type = type;
    this.Sphere.physics.mass = mass;

    if (type != "Star") {
        this.Sphere.physics.vel = new THREE.Vector3(0, 0, speed);
        this.Sphere.physics.trail = createTrail(Math.cos(inclination / 180 * Math.PI) * distance,
            Math.sin(inclination / 180 * Math.PI) * distance, 0);
        scene.add(this.Sphere.physics.trail);
    }

    scene.add(this.Sphere);
}

CelestialBody.prototype = {
    constructor: CelestialBody,
    updateVelocity:function (star) {
        var velocity = new THREE.Vector3();
        var speed;
        for(var i = 0; i < STEPS_PER_FRAME; i++) {
            speed = getAcceleration(getDistance(star.Sphere.position, this.Sphere.position) * METERS_PER_UNIT, star.Sphere.physics.mass) * SEC_PER_STEP;
            velocity.subVectors(star.Sphere.position, this.Sphere.position).setLength(speed / METERS_PER_UNIT);
            this.Sphere.physics.vel.add(velocity);

            this.Sphere.position.x += this.Sphere.physics.vel.x * SEC_PER_STEP;
            this.Sphere.position.y += this.Sphere.physics.vel.y * SEC_PER_STEP;
            this.Sphere.position.z += this.Sphere.physics.vel.z * SEC_PER_STEP;

            if (i % STEPS_PER_FRAME === 0) {
                leaveTrail(this.Sphere);
            }
        }
    }
}



//function init() {
    var scene = new THREE.Scene();
    var camera = createCamera();
    scene.add(camera);
    camera.lookAt(scene.position);

    var scale = 200;

// All units are in GigaMeters !

    Sun = new CelestialBody('Star', 'Sun', './Textures/sun.jpg', 0.6955 * scale, 0, 0, 0, 3.988435e30);
    Jupiter = new CelestialBody('Standard', 'Jupiter', './Textures/jupiter.jpg', 0.069173 * scale, 792.5, 1.3e-5, 1.3053, 1.89813e27);
    Saturn = new CelestialBody('Rings', 'Saturn', './Textures/saturn.jpg', 0.057316 * scale, 1490, 9.64e-6, 2.48446, 5.98319e26);
    Earth = new CelestialBody('Standard', 'Earth', './Textures/earth.jpg', 0.0063674447 * scale, 900, 1.38e-5, 5e-5, 5.9721986e24);

    var ambientLight = new THREE.PointLight(0xffffff, 2);
    ambientLight.position.set(0, 0, 0);
    scene.add(ambientLight);

    var renderer = createRenderer();

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    animate();
//}




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
    Jupiter.updateVelocity(Sun);
    Earth.updateVelocity(Sun);
    Saturn.updateVelocity(Sun);
    //Sun.rotateY(-0.001);
    renderer.render(scene, camera);
}

init();
