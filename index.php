<html>
<head>
    <title>My first Three.js app</title>
    <style>canvas { width: 100%; height: 100% }</style>
</head>
<body>
<script src="three.min.js"></script>

<script>
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

//    var geometry = new THREE.BoxGeometry(1,1,1);
//    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//    var cube = new THREE.Mesh( geometry, material );
//    scene.add( cube );

    camera.position.z = 50;

    var geometry = new THREE.SphereGeometry(10, 32, 16);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var sphere = new THREE.Mesh(geometry, material);
    scene.add( sphere );

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();
</script>
</body>
</html>