(function() {    
        var cubeWidget = function (settings) {
        var self = this;
        var three = THREE;
        var titleElement = $('<h2 class="section-title"></h2>');
        var cubeElement = $('<div id="WebGLCanvas"></div>');

        var gaugeObject;
        var rendered = false;
        
        var prevX = 0;
        var prevY = 0;
        var prevZ = 0;
        
        //if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
        var stats;
        var camera, controls, scene, renderer;
        var cubeMesh;
        
        var paneWidth = 300;
        var paneHeight = 180;

        var currentSettings = settings;
        
        /**
         * Initialze the scene.
         */
        function initializeScene(material) {
            
            // difference.
            renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            
            /* TODO - add browser detection */
            /*
            if(Detector.webgl){
                renderer = new THREE.WebGLRenderer({antialias:true});

                        // If its not supported, instantiate the canvas renderer to support all non WebGL browsers
            } else {
                renderer = new THREE.CanvasRenderer();
            }
            */
            
            // Set the background color of the renderer to white
            renderer.setClearColor(0xffffff, 1);

            // Get the size of the inner window (content area) to create a full size renderer
            canvasWidth =  paneWidth - 30;
            canvasHeight = paneHeight - 30;

            // Set the renderers size to the content areas size
            renderer.setSize(canvasWidth, canvasHeight);

            // Get the DIV element from the HTML document by its ID and append the renderers DOM
            // object to it
            document.getElementById("WebGLCanvas").appendChild(renderer.domElement);

            // Create the scene, in which all objects are stored (e. g. camera, lights,
            // geometries, ...)
            scene = new THREE.Scene();

            
            camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 100);
            camera.position.set(0, 0, 10);
            camera.lookAt(scene.position);
            scene.add(camera);

            // Create the cube
            // Parameter 1: Width
            // Parameter 2: Height
            // Parameter 3: Depth
            var cubeGeometry = new THREE.CubeGeometry(2.0, 3.2, .2);
            
            
            // Define six colored materials
            var cubeMaterials = [
            new THREE.MeshBasicMaterial({
                color: 0x00FFFF
            }),
            new THREE.MeshBasicMaterial({
                color: 0x00FF00
            }),
            new THREE.MeshBasicMaterial({
                color: 0x0000FF
            }),
            new THREE.MeshBasicMaterial({
                color: 0x0000FF
            }),
            new THREE.MeshBasicMaterial({
                color: 0xFF0000
            }),
            //material,
            new THREE.MeshBasicMaterial({
                color: 0xCCCCCC
            })];

            // Create a MeshFaceMaterial, which allows the cube to have different materials on
            // each face
            var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);

            cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cubeMesh.position.set(0.0, 0.0, 4.0);
            scene.add(cubeMesh);
        }
        
        function rotateCube(x, y, z) {

            if (currentSettings["device_type"] == "Phone") {
                cubeMesh.rotation.x = x / 180 * 3.14159
                cubeMesh.rotation.y = y / 180 * 3.14159;
                //cubeMesh.rotation.y = (z<180) ? (y / 180 * 3.14159) : (-y / 180 * 3.14159);
                //cubeMesh.rotation.z = z / 180 * 3.14159
            } else {
                cubeMesh.rotation.y = (z>0) ? (x * 3.14159 / 2) : ( (3.14159/2) + ((1-x)*3.14159/2)) ;
                cubeMesh.rotation.x = (z>0) ? (-y * 3.14159 / 2) : ( (3.14159*3/2) + ((1+y)*3.14159/2)) ;
            }

        }
        
        function animateScene() {

            // Define the function, which is called by the browser supported timer loop. If the
            // browser tab is not visible, the animation is paused. So 'animateScene()' is called
            // in a browser controlled loop.
            requestAnimationFrame(animateScene);

            // Map the 3D scene down to the 2D screen (render the frame)
            renderScene();
        }
        
        function renderScene() {
            renderer.render(scene, camera);
        }
        
        /** Future revision: add custom LauchPad board texture to top face **/
        function initializeTextures() {
            /*
            var loader = new THREE.TextureLoader();
            // load a resource
            loader.load(
                // resource URL
                'https://thingproxy.freeboard.io/fetch/https://www.dropbox.com/s/r1e3odi1e2mjv6y/TI-Launchpad.gif?dl=1',
                // Function when resource is loaded
                function ( texture ) {
                    // do something with the texture
                    var material = new THREE.MeshBasicMaterial( {
                        map: texture
                     } );
                    initializeScene(material);
                    animateScene();

                },
                // Function called when download progresses
                function ( xhr ) {
                    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                },
                // Function called when download errors
                function ( xhr ) {
                    console.log( 'An error happened' );
                }
            );
            */
            initializeScene();
            animateScene();
        }

        this.render = function (element) {
            rendered = true;
            $(element).append(titleElement).append($('<div class="gauge-widget-wrapper"></div>').append(cubeElement));
            initializeTextures();
        }

        this.onSettingsChanged = function (newSettings) {
            if (newSettings.min_value != currentSettings.min_value || newSettings.max_value != currentSettings.max_value || newSettings.units != currentSettings.units) {
                currentSettings = newSettings;
            }
            else {
                currentSettings = newSettings;
            }

            titleElement.html(newSettings.title);
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            
            switch (settingName) {
                case 'x_val' :
                    rotateCube(newValue, prevY, prevZ);
                    prevX = newValue ;
                    break ;
                case 'y_val' :
                    rotateCube(prevX, newValue, prevZ);
                    prevY = newValue;
                    break;
                case 'z_val' :
                    rotateCube(prevX, prevY, newValue);
                    prevZ = newValue;
                    break;
            }
        }

        this.onDispose = function () {
        }

        this.getHeight = function () {
            return 3;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "3dcube",
        display_name: "3d Cube",
        "external_scripts" : [
            "https://cdnjs.cloudflare.com/ajax/libs/three.js/r78/three.min.js"
        ],
        settings: [
            {
                name: "title",
                display_name: "Title",
                type: "text"
            },
            {   name: "device_type",
                display_name: "Device Type",
                "type": "option",
                "options": [
                    "Phone",
                    "TI-Launchpad-CC3200"
                ],
            "default_value": "Phone"
            },
            {
                name: "x_val",
                display_name: "X Value",
                type: "calculated"
            },
            {
                name: "y_val",
                display_name: "Y Value",
                type: "calculated"
            },
            {
                name: "z_val",
                display_name: "Z Value",
                type: "calculated"
            }            
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new cubeWidget(settings));
        }
    });
    
}());

