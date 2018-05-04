"use strict";

var canvas, gl, program;

var numDivisions = 5;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var runAnimation = true;

var points = [];
var normals = [];
var texCoords = [];

var groundPosition = 0;
var count = 0;
var num = 0;

var isGroundLoc;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// parameters for colors, lighting properties and material properties
const darkGray  = vec4(0.3, 0.3, 0.3, 1.0);
const white     = vec4(1.0, 1.0, 1.0, 1.0);
const red       = vec4(0.9, 0.0, 0.0, 1.0);
const green     = vec4(0.0, 0.8, 0.0, 1.0);

const lightAmb  = darkGray;
const lightDiff = white;
const lightSpec = white;

var lightX = 5.0;
var lightY = 4.0;
var lightZ = 2.0;
var lightPos  = vec4(lightX, lightY, lightZ, 1.0);

const robotAmb  = white;
const robotDiff = white;
const robotSpec = white;
const robotShin = 500.0;

const groundAmb   = white;
const groundDiff  = white;
const groundSpec  = white;
const groundShin  = 150.0;

const wallAmb   = white;
const wallDiff  = white;
const wallSpec  = white;
const wallShin  = 150.0;

// uniform variables
var light_position;
var ambient_product;
var diffuse_product;
var specular_product;
var shininess;


// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT      = 4.0;
var BASE_X           = 4.0;
var BASE_Z				= 1.5;
var HEAD_HEIGHT 		= 1.0;
var HEAD_X 				= 1.5;
var HEAD_Z				= .75;
var LOWER_X 			= 0.5;
var UPPER_ARM_X 		= 1;
var UPPER_ARM_HEIGHT = 2.0;
var UPPER_ARM_Z		= 1;
var lower_ARM_X 		= .75;
var lower_ARM_HEIGHT = 2.5;
var lower_ARM_Z		= .75;

var JOINT_X				= .25;
var JOINT_Y				= .25;
var JOINT_Z				= .25;

var UPPER_LEG_X		= 1.15;
var UPPER_LEG_Y		= 2.0;
var UPPER_LEG_Z		= 1.15;

var LOWER_LEG_X		= 1.05;
var LOWER_LEG_Y		= 2.0;
var LOWER_LEG_Z		= 1.05;

var FOOT_X  			= 1.5;
var FOOT_Y 				= .45;
var FOOT_Z				= 1.5;

var GROUND_X			= 36;
var GROUND_Y			= .1;
var GROUND_Z 			= 36;

var WALL_X				= 1;
var WALL_Y				= 16;
var WALL_Z				= 5;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;
var normalLoc;     // uniform location of the normal matrix

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var Elbow = 1;
var Joint = 2;
var UpperArm = 3;

var change;
var theta= [ 0, -45.0, 0, 0];
var turnHead = false;

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;


//Moving Viewer
const initViewerDist  =  4.0;
const minViewerDist   =  2.0;
const maxViewerDist   = 10.0;
const maxOffsetRatio  =  1.0;
const deltaViewerDist =  0.25;
const deltaOffset     =  0.1;
var   eye             = vec3(2.5, 0.0, initViewerDist);
const at              = vec3(0.0, -1.0, 0.0);
const up              = vec3(0.0, 1.0, 0.0);

var   flying          = false;
var right = false;
var left = false;
const flyDelta        = 0.01;
var   fdx, fdy, fdz;
const startEye        = vec3(0.0, 0.0, initViewerDist);
const startAt         = vec3(0.0, 0.0, 0.0);


// Texture parameters and variables
var metalTexture;
var grassTexture;
var brickTexture;
// declarations from included script
   // metal                  // array of texels
   // metalHeight = 256      // height of this texture
   // metalWidth  = 256      // width of this texture

//----------------------------------------------------------------------------


var bezier = function(u) {
    var b =new Array(4);
    var a = 1-u;
    b[3] = a*a*a;
    b[2] = 3*a*a*u;
    b[1] = 3*a*u*u;
    b[0] = u*u*u;
    return b;
}


/**
 * Configure the texture used in this program from
 * imageTexImg created elsewhere.
 */
function configureTexture() {
    metalTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, metalTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, metalWidth, metalHeight,
                  0, gl.RGBA, gl.UNSIGNED_BYTE, metal);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR);

    grassTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, grassTextureResizeWidth, grassTextureResizeHeight,
                  0, gl.RGBA, gl.UNSIGNED_BYTE, grassTextureResize);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR);

	brickTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, brickTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, brickTextWidth, brickTextWidth,
                  0, gl.RGBA, gl.UNSIGNED_BYTE, brickText);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
                     gl.NEAREST_MIPMAP_LINEAR);
}

/**
 * Returns the vec3 normal vector of the three specified points
 */
function triangleNormal(p1, p2, p3) {
  var v1 = vec3(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
  var v2 = vec3(p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]);
  return normalize(cross(v1, v2));
}


function quad(  a,  b,  c,  d ) {
    var normalVec1 = triangleNormal(vertices[a],vertices[b],vertices[c]);
    var normalVec2 = triangleNormal(vertices[a],vertices[c],vertices[d]);

    points.push(vertices[a]);
    normals.push(normalVec1);
    texCoords.push(vec2(0.0, 1.0));
    points.push(vertices[b]);
    normals.push(normalVec1);
    texCoords.push(vec2(0.0, 0.0));
    points.push(vertices[c]);
    normals.push(normalVec1);
    texCoords.push(vec2(1.0, 0.0));
    points.push(vertices[a]);
    normals.push(normalVec2);
    texCoords.push(vec2(0.0, 1.0));
    points.push(vertices[c]);
    normals.push(normalVec2);
    texCoords.push(vec2(1.0, 0.0));
    points.push(vertices[d]);
    normals.push(normalVec2);
    texCoords.push(vec2(1.0, 1.0));
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.7, 0.7, 0.7, 1.0 );
    gl.enable( gl.DEPTH_TEST );



    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    // Initialize textures
    initmetal();
    initgrassTextureResize();
	initbrickText();

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    /****** Note the change to 3 for the second parameter ******/
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    /****** Note the change to 2 for the second parameter ******/
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    // Configure textures and send them to the GPU
    configureTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, metalTexture);
    gl.uniform1i(gl.getUniformLocation(program, "imageTexture"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);
    gl.uniform1i(gl.getUniformLocation(program, "grassTexture"), 1);


    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, brickTexture);
    gl.uniform1i(gl.getUniformLocation(program, "brickTexture"), 2);
    isGroundLoc        = gl.getUniformLocation(program, "isGround");



    document.getElementById("start").onclick = function () {
      if(!runAnimation){
        runAnimation = true;
    	   if(runAnimation) requestAnimFrame(render);
       }
    };
    document.getElementById("stop").onclick = function () {
    	runAnimation = false;
    	if(runAnimation) requestAnimFrame(render);
    };
    document.getElementById("-lightX").onclick = function () {
      lightX -= 1.0;
      lightPos  = vec4(lightX, lightY, lightZ, 1.0);
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("+lightX").onclick = function () {
      lightX += 1.0;
      lightPos  = vec4(lightX, lightY, lightZ, 1.0);
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("-lightY").onclick = function () {
      lightY -= 1.0;
      lightPos  = vec4(lightX, lightY, lightZ, 1.0);
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("+lightY").onclick = function () {
      lightY += 1.0;
      lightPos  = vec4(lightX, lightY, lightZ, 1.0);
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("-lightZ").onclick = function () {
      lightZ -= 1.0;
      lightPos  = vec4(lightX, lightY, lightZ, 1.0);
      if (!runAnimation) requestAnimFrame(render);
    };
    document.getElementById("+lightZ").onclick = function () {
      lightZ += 1.0;
      lightPos  = vec4(lightX, lightY, lightZ, 1.0);
      if (!runAnimation) requestAnimFrame(render);
    };


	    document.onkeydown = checkKey;
    function checkKey(e) {
    	e = e || window.event();
    	if(e.keyCode == '38') //forward
    	{
     		 flying    = true;
     		 var dvx   = at[0] - eye[0];
     		 var dvy   = at[1] - eye[1];
     		 var dvz   = at[2] - eye[2];
     		 var vDist = Math.sqrt(dvx*dvx + dvy*dvy + dvz*dvz);
     		 fdx       = flyDelta * dvx / vDist;
     		 fdy       = flyDelta * dvy / vDist;
     		 fdz       = flyDelta * dvz / vDist;
     		 requestAnimFrame(render);
 	 		 }

 	 	if(e.keyCode == '40')//backward
 	 	{
 	 	    flying    = true;
     		 var dvx   = at[0] + eye[0];
     		 var dvy   = at[1] + eye[1];
     		 var dvz   = at[2] + eye[2];
     		 var vDist = Math.sqrt(dvx*dvx + dvy*dvy + dvz*dvz);
     		 fdx       = flyDelta * dvx / vDist;
     		 fdy       = flyDelta * dvy / vDist;
     		 fdz       = flyDelta * dvz / vDist;
     		 requestAnimFrame(render);
 	 	}
 	 	if(e.keyCode == '39')//right
 	 	{

 	 	 	 right    = true;
     		 var dvx   = at[0] + eye[0];
     		 var dvy   = at[1] + eye[1];
     		 var dvz   = at[2] + eye[2];
     		 var vDist = Math.sqrt(dvx*dvx + dvy*dvy + dvz*dvz);
     		 fdx       = flyDelta * dvx / vDist;
     		 fdy       = flyDelta * dvy / vDist;
     		 fdz       = flyDelta * dvz / vDist;
     		 requestAnimFrame(render);
 	 	}
 	 	if(e.keyCode == '37')//left
 	 	{
 	 	 	 left    = true;
     		 var dvx   = at[0] + eye[0];
     		 var dvy   = at[1] + eye[1];
     		 var dvz   = at[2] + eye[2];
     		 var vDist = Math.sqrt(dvx*dvx + dvy*dvy + dvz*dvz);
     		 fdx       = flyDelta * dvx / vDist;
     		 fdy       = flyDelta * dvy / vDist;
     		 fdz       = flyDelta * dvz / vDist;
     		 requestAnimFrame(render);
 	 	}
		 }


    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    normalLoc        = gl.getUniformLocation(program, "normal_mat");
    ambient_product  = gl.getUniformLocation(program, "ambient_product");
    diffuse_product  = gl.getUniformLocation(program, "diffuse_product");
    specular_product = gl.getUniformLocation(program, "specular_product");
    shininess        = gl.getUniformLocation(program, "shininess");
    light_position   = gl.getUniformLocation(program, "light_position");

    render();
}
//----------------------------------------------------------------------------
function terrian()
{
 var s = scale4(GROUND_X, GROUND_Y, GROUND_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  groundAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, groundDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, groundSpec));
    gl.uniform1f(shininess, groundShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
//----------------------------------------------------------------------------


function torso() {
    var s = scale4(BASE_X, BASE_HEIGHT, BASE_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  robotAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, robotDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, robotSpec));
    gl.uniform1f(shininess, robotShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function upperArm() {
    var s = scale4(UPPER_ARM_X, UPPER_ARM_HEIGHT, UPPER_ARM_Z);
    var instanceMatrix = mult(translate(0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  robotAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, robotDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, robotSpec));
    gl.uniform1f(shininess, robotShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
//-----------------------------------------------------------------------------
function lowerArm() {
    var s = scale4(lower_ARM_X, lower_ARM_HEIGHT, lower_ARM_Z);
    var instanceMatrix = mult(translate( 0, 0.5 * lower_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  robotAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, robotDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, robotSpec));
    gl.uniform1f(shininess, robotShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function head()
{
    var s = scale4(HEAD_X, HEAD_HEIGHT, HEAD_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * HEAD_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  robotAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, robotDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, robotSpec));
    gl.uniform1f(shininess, robotShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function Upperleg()
{
    var s = scale4(UPPER_LEG_X, UPPER_LEG_Y, UPPER_LEG_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * UPPER_LEG_Y, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  robotAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, robotDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, robotSpec));
    gl.uniform1f(shininess, robotShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------
function lowerLeg()
{
    var s = scale4(LOWER_LEG_X, LOWER_LEG_Y, LOWER_LEG_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_LEG_Y, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  robotAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, robotDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, robotSpec));
    gl.uniform1f(shininess, robotShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------
function foot()
{
    var s = scale4(FOOT_X, FOOT_Y, FOOT_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * FOOT_Y, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  robotAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, robotDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, robotSpec));
    gl.uniform1f(shininess, robotShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function joint()
{
    var s = scale4(JOINT_X, JOINT_Y, JOINT_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * JOINT_Y, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  robotAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, robotDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, robotSpec));
    gl.uniform1f(shininess, robotShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function wall()
{
    var s = scale4(WALL_X, WALL_Y, WALL_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * WALL_Y, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    var normalMat = normalMatrix(t, true); // true makes it return 3 X 3
    gl.uniformMatrix3fv(normalLoc, false, flatten(normalMat));

    // set up star lighting properties
    gl.uniform4fv(ambient_product,  mult(lightAmb,  wallAmb));
    gl.uniform4fv(diffuse_product,  mult(lightDiff, wallDiff));
    gl.uniform4fv(specular_product, mult(lightSpec, wallSpec));
    gl.uniform1f(shininess, wallShin);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
//----------------------------------------------------------------------------


var rotateVal = 2.0;

var render = function() {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  projectionMatrix = ortho(-10, 10, -10, 10, -20, 40);
  gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

  gl.uniform1f(isGroundLoc, 0);
	var viewer = lookAt(eye, at, up);

  gl.uniform4fv(light_position, lightPos);

	 modelViewMatrix  = mult(viewer,translate(0, 1, 1));
	 modelViewMatrix  = mult(modelViewMatrix,translate(0, -6, 0));
	 var ground = modelViewMatrix;
	 modelViewMatrix  = mult(modelViewMatrix,translate(0, 1, theta[Base]-30));
    modelViewMatrix = mult(modelViewMatrix,rotate(0, 0, 1, 0 ));

    torso();


	 //Head
	 var beforeHead = modelViewMatrix;
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(0, 50 , 50, 1 ));
    head();

    modelViewMatrix = beforeHead;
	 //Left-Arm
    modelViewMatrix  = mult(modelViewMatrix, translate(BASE_X/2, BASE_HEIGHT*3/4, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[Joint], 1, 0, 0) );
    joint();

    modelViewMatrix  = mult(modelViewMatrix, translate(UPPER_ARM_X/2, -UPPER_ARM_HEIGHT*3/4, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 1, 0, 0) );
    upperArm();
    var afterLeftArm = modelViewMatrix;


    modelViewMatrix = beforeHead;
    //Right Arm
    modelViewMatrix  = mult(modelViewMatrix, translate(-BASE_X/2, BASE_HEIGHT*3/4, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-theta[Joint], 1, 0, 0) );
    joint();

    modelViewMatrix  = mult(modelViewMatrix, translate(-UPPER_ARM_X/2, -UPPER_ARM_HEIGHT*3/4, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 1, 0, 0) );
    upperArm();
    var afterRightArm = modelViewMatrix;


    //LowerLeftArm
    modelViewMatrix = afterLeftArm;
    modelViewMatrix  = mult(modelViewMatrix, translate(0, -lower_ARM_HEIGHT*.6, lower_ARM_Z));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[Elbow], 1, 0, 0) );
    lowerArm();

        //lowerRightArm
    modelViewMatrix = afterRightArm;
    modelViewMatrix  = mult(modelViewMatrix, translate(0, -lower_ARM_HEIGHT*.6, lower_ARM_Z));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[Elbow], 1, 0, 0) );
    lowerArm();

    //UpperLeftLeg
    modelViewMatrix = beforeHead;
    modelViewMatrix  = mult(modelViewMatrix, translate(BASE_X/4, 0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-theta[Joint], 1, 0, 0) );
    joint();

    modelViewMatrix  = mult(modelViewMatrix, translate(0, -UPPER_LEG_Y*0.9, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    Upperleg();
    var upperLeftLeg = modelViewMatrix;



        //UpperRightLeg
    modelViewMatrix = beforeHead;
    modelViewMatrix  = mult(modelViewMatrix, translate(-BASE_X/4, 0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[Joint], 1, 0, 0) );
    joint();

    modelViewMatrix  = mult(modelViewMatrix, translate(0, -UPPER_LEG_Y*0.9, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    Upperleg();
    var upperRightLeg = modelViewMatrix;


	 //LowerLeftLeg
	 modelViewMatrix = upperLeftLeg;
    modelViewMatrix  = mult(modelViewMatrix, translate(0, 0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[Joint], 1, 0, 0) );
    joint();

	 modelViewMatrix  = mult(modelViewMatrix, translate(0, -LOWER_LEG_Y, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    lowerLeg();
    var lowerLeftLeg = modelViewMatrix;



    	//LowerRightLeg
	modelViewMatrix = upperRightLeg;
    modelViewMatrix  = mult(modelViewMatrix, translate(0, 0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-theta[Joint], 1, 0, 0) );
    joint();
	modelViewMatrix  = mult(modelViewMatrix, translate(0, -LOWER_LEG_Y, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    lowerLeg();
    var lowerRightLeg = modelViewMatrix;



    //LeftFoot
    modelViewMatrix = lowerLeftLeg;
    modelViewMatrix  = mult(modelViewMatrix, translate(0, -FOOT_Y, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    foot();

    //RightFoot
    modelViewMatrix = lowerRightLeg;
    modelViewMatrix  = mult(modelViewMatrix, translate(0, -FOOT_Y, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    foot();





    gl.uniform1f(isGroundLoc, 1);
    var offset1 = 0;
    var offset2 = 0;
    var offset3 = 0;

    //MIDDLE


    modelViewMatrix = ground;
    modelViewMatrix  = mult(modelViewMatrix, translate(0, -BASE_HEIGHT/2-UPPER_LEG_Y-LOWER_LEG_Y-FOOT_Y, groundPosition + offset1-(GROUND_Z/2)));
    modelViewMatrix  = mult(modelViewMatrix, rotate(0, 0, 0, 1) );
    terrian();
    //modelViewMatrix = beforeHead;
    //FRONT
    modelViewMatrix  = mult(modelViewMatrix, translate(0, 0, GROUND_Z));
    modelViewMatrix  = mult(modelViewMatrix, rotate(0, 0, 0, 1) );
    terrian();
    //BEHIND
    //modelViewMatrix = beforeHead;
    //modelViewMatrix  = mult(modelViewMatrix, translate(0, -BASE_HEIGHT/2-UPPER_LEG_Y-LOWER_LEG_Y-FOOT_Y, -GROUND_Z + (offset3*num) + groundPosition));
    //modelViewMatrix  = mult(modelViewMatrix, rotate(0, 0, 0, 1) );
    //terrian();
    //groundPosition = groundPosition - .15;

    //requestAnimFrame(render);
	//Wall
	gl.uniform1f(isGroundLoc, 2);
    modelViewMatrix = ground;
	var Y = -5;
	var rotatex = -20

    modelViewMatrix  = mult(modelViewMatrix, translate(-GROUND_X/2+5,Y, -25));
    modelViewMatrix  = mult(modelViewMatrix, rotate(rotatex, 0, 1, 0) );
    wall();
	var beforeWall = modelViewMatrix;
    modelViewMatrix  = mult(modelViewMatrix, translate(0,0, WALL_Z));

    wall();

    modelViewMatrix  = mult(modelViewMatrix, translate(0,0, WALL_Z));

    wall();

    modelViewMatrix  = mult(modelViewMatrix, translate(0,0, WALL_Z));

    wall();

	 modelViewMatrix= beforeWall;
    modelViewMatrix  = mult(modelViewMatrix, translate(0,0, -WALL_Z*1));

    wall();

    modelViewMatrix  = mult(modelViewMatrix, translate(0,0, -WALL_Z));

    wall();
    modelViewMatrix = ground;



  if (runAnimation) {
 theta[Base]+= 0.05;
     if(count==1120)
  {

  theta[Base] = 0;
  count = 0;
 }


 count = count + 1;
   if (theta[Joint] > 40 && rotateVal > 0){
     rotateVal = -rotateVal;
  }
  else if (theta[Joint] < -40 && rotateVal < 0){
   rotateVal = -rotateVal;
  }
  theta[Joint] += rotateVal;
    requestAnimFrame(render);
  }
}
