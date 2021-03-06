

var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 30000;

var G = 6.67384e-11;
var SEC_PER_STEP = 4;
var STEPS_PER_FRAME = 5000;
var METERS_PER_UNIT = 1000000000;
var MAX_TRAIL_VERTICES = 50000;


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
    var trailMaterial = new THREE.LineBasicMaterial({ color: 0xa0ff0f});
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
    }

    this.Sphere.physics = physics;
    this.Sphere.physics.name = name;
    this.Sphere.physics.type = type;
    this.Sphere.physics.mass = mass;
    this.Sphere.physics.inclination = inclination;
    this.Sphere.physics.distance = distance;
    this.Sphere.physics.speed = speed;
    this.Sphere.physics.radius = radius;
    this.orbiting = null;

    this.Sphere.physics.vel = new THREE.Vector3(0, 0, speed);
    this.Sphere.physics.trail = createTrail(Math.cos(inclination / 180 * Math.PI) * distance,
        Math.sin(inclination / 180 * Math.PI) * distance, 0);
}

CelestialBody.prototype = {
    constructor: CelestialBody,
    updateVelocity:function () {
        var velocity = new THREE.Vector3();
        var speed;
        for(var i = 0; i < STEPS_PER_FRAME; i++) {
            speed = getAcceleration(getDistance(this.orbiting.Sphere.position, this.Sphere.position) * METERS_PER_UNIT, this.orbiting.Sphere.physics.mass) * SEC_PER_STEP;
            velocity.subVectors(this.orbiting.Sphere.position, this.Sphere.position).setLength(speed / METERS_PER_UNIT);
            this.Sphere.physics.vel.add(velocity);

            this.Sphere.position.x += this.Sphere.physics.vel.x * SEC_PER_STEP;
            this.Sphere.position.y += this.Sphere.physics.vel.y * SEC_PER_STEP;
            this.Sphere.position.z += this.Sphere.physics.vel.z * SEC_PER_STEP;

            if (i % STEPS_PER_FRAME === 0) {
                leaveTrail(this.Sphere);
            }
        }
    },
    setOrbiting:function(Orbiting) {
        this.orbiting = Orbiting;
        this.Sphere.position.set(Math.cos(this.Sphere.physics.inclination / 180 * Math.PI) * this.Sphere.physics.distance,
            Math.sin(this.Sphere.physics.inclination / 180 * Math.PI) * this.Sphere.physics.distance, 0);
    }
}

function System() {
    this.Components = [];
    this.renderer = createRenderer();
    this.scene = new THREE.Scene();
    this.camera = createCamera();
    this.scene.add(this.camera);
    this.camera.lookAt(this.scene.position);
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    var ambientLight = new THREE.PointLight(0xffffff, 2);
    ambientLight.position.set(0, 0, 0);
    this.scene.add(ambientLight);
    this.focused = null;
    this.focusVec = new THREE.Vector3();
}

System.prototype = {
    constructor: System,
    addCelestialBody:function(CelestialBody, orbiting) {
        CelestialBody.setOrbiting(orbiting);
        if (CelestialBody.orbiting != null) {
            this.scene.add(CelestialBody.Sphere.physics.trail);
        }
        this.scene.add(CelestialBody.Sphere);
        this.Components.push(CelestialBody);
    },
    removeCelestialBody:function(name) {
        for (var i = 0; i < this.Components.length; i++) {
            if (this.Components[i].Sphere.physics.name == name) {
                this.scene.remove(this.Components[i].Sphere);
                if (this.Components[i].orbiting != null)
                    this.scene.remove(this.Components[i].Sphere.physics.trail);
                this.Components.slice(i, 1);
            }
        }
    },
    updateSystem:function() {
        this.focusVec.copy(this.focused.Sphere.position);
        for (var i = 0; i < this.Components.length; i++) {
            if (this.Components[i].orbiting != null)
                this.Components[i].updateVelocity();
        }
        this.focusVec.subVectors(this.focused.Sphere.position, this.focusVec);
        this.camera.position.add(this.focusVec);
        this.controls.target.copy(this.focused.Sphere.position);
    },
    setFocused:function(focused) {
        if (this.focused != null) {
            this.focusVec = new THREE.Vector3();
            this.focusVec.subVectors(focused.Sphere.position, this.focused.Sphere.position);
            this.camera.position.add(this.focusVec);
        }
        this.focused = focused;
        this.camera.lookAt(this.focused.Sphere.position);
    }
}

    var scale = 200;

// All units are in GigaMeters !


    /*
    Creating a CelestialBody :
    CelestialBody = new CelestialBody(Type, Name, TexturePath, Radius, DistanceFromGravitationalCenter, Speed, InclinationFromTheGravitationalCenter, Mass);
    */
    SolarSystem = new System();
    Sun = new CelestialBody('Star', 'Sun', './Textures/sun.jpg', 0.6955 * scale / 10, 0, 0, 0, 3.988435e30);
    Mercury = new CelestialBody('Rock', 'Mercury', './Textures/mercury.jpg', 0.0024397 * scale, 68.2, 4.74e-5, 7.00487, 3.30104e23);
    Venus = new CelestialBody('Rock', 'Venus', './Textures/venus.jpg', 0.0060519 * scale, 108.8, 3.5e-5, 3.39471, 4.86732e24);
    Earth = new CelestialBody('Rock', 'Earth', './Textures/earth.jpg', 0.0063674447 * scale, 147.1, 2.963e-5, 5e-5, 5.9721986e24);
    Mars = new CelestialBody('Rock', 'Mars', './Textures/mars.jpg', 0.003386 * scale, 227.94, 0.0000228175, 1.85, 6.41693e23);
    Jupiter = new CelestialBody('Gas', 'Jupiter', './Textures/jupiter.jpg', 0.069173 * scale, 792.5, 1.3e-5, 1.3053, 1.89813e27);
    Saturn = new CelestialBody('Gas/Rings', 'Saturn', './Textures/saturn.jpg', 0.057316 * scale, 1490, 9.64e-6, 2.48446, 5.98319e26);
    Uranus = new CelestialBody('Gas/Rings', 'Uranus', './Textures/uranus.jpg', 0.025266 * scale, 2870.99, 6.509e-6, 0.76, 8.68103e25);
    Neptune = new CelestialBody('Gas', 'Neptune', './Textures/neptune.jpg', 0.024553 * scale, 4504, 5.449e-6, 1.76, 1.0241e26);

    //Unknown = new CelestialBody('Gas/Rings', 'Unknown', './Textures/earth.jpg', 0.17316 * scale, 1290, 10.64e-6, 50.48446, 15.98319e26);
    //UnknownSatelite = new CelestialBody('Rock', 'Satelite', './Textures/earth.jpg', 0.0043674447 * scale, 1320, 10.64e-6, 50.48446, 0.000000000021986e24);

    /*
    Adding a CelestialBody to the system :
    System.AddCelestialBody(BodyToAdd, GravitationalCenterOfTheNewBody);
    */
    SolarSystem.addCelestialBody(Sun, null);
    SolarSystem.addCelestialBody(Mercury, Sun);
    SolarSystem.addCelestialBody(Venus, Sun);
    SolarSystem.addCelestialBody(Earth, Sun);
    SolarSystem.addCelestialBody(Mars, Sun);
    SolarSystem.addCelestialBody(Jupiter, Sun);
    SolarSystem.addCelestialBody(Saturn, Sun);
    SolarSystem.addCelestialBody(Uranus, Sun);
    SolarSystem.addCelestialBody(Neptune, Sun);

    //SolarSystem.addCelestialBody(Unknown, Sun);
    //SolarSystem.addCelestialBody(UnknownSatelite, Unknown);

    SolarSystem.setFocused(Sun);

    animate();


document.getElementById("focus").onchange = function(e) {
    for (var i = 0; i < SolarSystem.Components.length; i++) {
        if (SolarSystem.Components[i].Sphere.physics.name == this.value)
            SolarSystem.setFocused(SolarSystem.Components[i]);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    SolarSystem.renderer.setSize( window.innerWidth, window.innerHeight );
    SolarSystem.updateSystem();
}
function animate() {
    render();
    requestAnimationFrame(animate);
    SolarSystem.controls.update();
}
function render() {
    SolarSystem.updateSystem();
    SolarSystem.renderer.render(SolarSystem.scene, SolarSystem.camera);
}
