<html>
<head>
    <title>MyUniverse</title>
</head>
<body>

<div id="model">
    <div id="container" style="position: absolute; left: 0px; top: 0px; z-index: 0;">
    </div>

    <div id="speed" style="right: 0px; z-index: 1; position: absolute; color: red; font-family: Helvetica, sans-serif;">
        <label for="focus" style="color: #f00;">Focus camera on:</label>
        <select id="focus">
            <option selected value="-1">Sun</option>
        </select>
    </div>
</div>

<script src="Physics/typeface.js"></script>
<script src="Physics/helvetiker_regular.typeface.js"></script>
<script src="Physics/three.min.js"></script>
<script src="https://dl.dropboxusercontent.com/u/3587259/Code/Threejs/OrbitControls.js"></script>

<script src="Physics/app.js"></script>


</body>
</html>