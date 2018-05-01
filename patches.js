//
//  patches.js - Indices into patch control vertices (from vertices.h)
//
//    Each patch is a 4x4 Bezier patch, and there are 32 patches in the
//      Utah teapot.
//

var numTeapotPatches = 4;

var indices = new Array(numTeapotPatches);

    indices[0] = [
	0, 1, 2, 3,
	4, 5, 6, 7,
	8, 9, 10, 11,
	12, 13, 14, 15
    ];

indices[1] = [
	16, 17, 18, 19,
	20, 21, 22, 23,
	24, 25, 26, 27,
	28, 29, 30, 31
    
    
    ];
    indices[2] = [
	32,33,34,35,
	36,37,38,39,
	40,41,42,43,
	44,45,46,47    
    
    
    ];
    indices[3]=
    [
	48,49,50,51,
	52,53,54,55,
	56,57,58,59,
	60,61,62,63
    ];
    