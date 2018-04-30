"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var runAnimation = true;

var points = [];
var colors = [];

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

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


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

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var Elbow = 1;
var Shoulder = 2;
var UpperArm = 3;


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


//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
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

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );



    document.getElementById("start").onclick = function () {
    	runAnimation = true;
    	if(runAnimation) requestAnimFrame(render);
    }
    document.getElementById("stop").onclick = function () {
    	runAnimation = false;
    	if(runAnimation) requestAnimFrame(render);
    }


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

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    render();
}

//----------------------------------------------------------------------------


function torso() {
    var s = scale4(BASE_X, BASE_HEIGHT, BASE_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function upperArm() {
    var s = scale4(UPPER_ARM_X, UPPER_ARM_HEIGHT, UPPER_ARM_Z);
    var instanceMatrix = mult(translate(0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}
//-----------------------------------------------------------------------------
function lowerArm() {
    var s = scale4(lower_ARM_X, lower_ARM_HEIGHT, lower_ARM_Z);
    var instanceMatrix = mult(translate( 0, 0.5 * lower_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function head()
{
    var s = scale4(HEAD_X, HEAD_HEIGHT, HEAD_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * HEAD_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function Upperleg()
{
    var s = scale4(UPPER_LEG_X, UPPER_LEG_Y, UPPER_LEG_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * UPPER_LEG_Y, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------
function lowerLeg()
{
    var s = scale4(LOWER_LEG_X, LOWER_LEG_Y, LOWER_LEG_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_LEG_Y, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------
function foot()
{
    var s = scale4(FOOT_X, FOOT_Y, FOOT_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * FOOT_Y, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function joint()
{
    var s = scale4(JOINT_X, JOINT_Y, JOINT_Z);
    var instanceMatrix = mult( translate( 0.0, 0.5 * JOINT_Y, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


var rotateVal = 2.0;

var render = function() {



    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	var viewer = lookAt(eye, at, up);

	 modelViewMatrix  = translate(0.0, -6, 0.0);
    modelViewMatrix = mult(viewer,rotate(theta[Base], 0, 1, 0 ));
    torso();
	
	 //Head
	 var beforeHead = modelViewMatrix;
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(0, 50 , 50, 1 ));
    head();
    
    modelViewMatrix = beforeHead;
	 //Left-Arm
    if (theta[Shoulder] > 40 && rotateVal > 0){
    	rotateVal = -rotateVal;
	 }
	 else if (theta[Shoulder] < -40 && rotateVal < 0){
	 	rotateVal = -rotateVal;
	 }
	 theta[Shoulder] += rotateVal;
    modelViewMatrix  = mult(modelViewMatrix, translate(BASE_X/2, BASE_HEIGHT*3/4, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[Shoulder], 1, 0, 0) );
    joint();
    
    modelViewMatrix  = mult(modelViewMatrix, translate(UPPER_ARM_X/2, -UPPER_ARM_HEIGHT*3/4, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 1, 0, 0) );
    upperArm();
    var afterLeftArm = modelViewMatrix;
    
    
    modelViewMatrix = beforeHead;
    //Right Arm
    modelViewMatrix  = mult(modelViewMatrix, translate(-BASE_X/2, BASE_HEIGHT*3/4, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-theta[Shoulder], 1, 0, 0) );
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
    modelViewMatrix  = mult(modelViewMatrix, translate(BASE_X*0.3, -UPPER_LEG_Y, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    Upperleg();
    var upperLeftLeg = modelViewMatrix;
    
        //UpperRightLeg
    modelViewMatrix = beforeHead;
    modelViewMatrix  = mult(modelViewMatrix, translate(-BASE_X*0.3, -UPPER_LEG_Y, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    Upperleg();
    var upperRightLeg = modelViewMatrix;


	//LowerLeftLeg
	modelViewMatrix = upperLeftLeg;
	modelViewMatrix  = mult(modelViewMatrix, translate(0, -LOWER_LEG_Y, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    lowerLeg();
    var lowerLeftLeg = modelViewMatrix;
    	//LowerRightLeg
	modelViewMatrix = upperRightLeg;
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
    //requestAnimFrame(render);
    
      if (flying) {
    // move viewer ahead
    eye[0] += fdx;
    eye[1] += fdy;
    eye[2] += fdz;
    at[0]  += fdx;
    at[1]  += fdy;
    at[2]  += fdz;
    flying = false;
    if (eye[2] < -1.0) flying = false;
    
    
  }
  if(right){
  eye[0] += .1;
  at[0]  += .1;
  right = false;
  }
  if(left)
  {
  eye[0] -= .05;
  at[0]  -= .05;
  left = false;
  }

  if (runAnimation || flying || right) {
    requestAnimFrame(render);
  }
}
