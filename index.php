<html>
<head>
    <title>MyUniverse</title>
    <script src="Physics/helvetiker_regular.typeface.js"></script>
</head>
<body>

<div id="model">
    <div id="container" style="position: absolute; left: 0px; top: 0px; z-index: 0;">
    </div>

    <div id="speed" style="right: 0px; z-index: 10; position: relative; color: red; font-family: Helvetica, sans-serif;">
        <label for="speedSlider">Speed</label>
        <input id="speedSlider" type="range" min="1000" max="50000" value="10000" />
        <label for="focus" style="color: white;">Focus camera on:</label>
        <select id="focus">
            <option value="-1">Sun</option>
            <option value="0">Saturn</option>
            <option value="1">Earth</option>
        </select>
    </div>
</div>

<script src="Physics/typeface.js"></script>
<script src="Physics/three.min.js"></script>
<script src="https://dl.dropboxusercontent.com/u/3587259/Code/Threejs/OrbitControls.js"></script>

<script src="Physics/app.js"></script>


</body>
</html>