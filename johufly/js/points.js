/**
 * Global object containing all verticies for the game graphics,
 * see. polygondraw.html
 */
var Points = {

	ASTEROIDS: [
		[-4, -2, -2, -4, 0, -2, 2, -4, 4, -2, 3, 0, 4, 2, 1, 4, -2, 4, -4, 2, -4, -2],
		[-3, 0, -4, -2, -2, -4, 0, -3, 2, -4, 4, -2, 2, -1, 4, 1, 2, 4, -1, 3, -2, 4, -4, 2, -3, 0],
		[-2, 0, -4, -1, -1, -4, 2, -4, 4, -1, 4, 1, 2, 4, 0, 4, 0, 1, -2, 4, -4, 1, -2, 0],
		[-1, -2, -2, -4, 1, -4, 4, -2, 4, -1, 1, 0, 4, 2, 2, 4, 1, 3, -2, 4, -4, 1, -4, -2, -1, -2],
		[-4, -2, -2, -4, 2, -4, 4, -2, 4, 2, 2, 4, -2, 4, -4, 2, -4, -2]
	],

	SHIPSIMPLE: [9, 0, -3, -7, -1, 0, -3, 7, 9, 0],
	CRATE: [0, 0, 4, 0, 4, 6, 0, 6, 0, 0],
	SHIP: [9, 0, -3, 7, -2, 5, -2, 0, -2, -4, -3, -6, 9, 0],
	FLAMES: [-2, 0, -3, -1, -5, 0, -3, 1, -2, 0],
	HP: [0, 0, 4, 0, 2, 0, 2, 6, 4, 6, 0, 6],
	
	
	WALL: [
		[0, 0, 4, 0, 4, 6, 0, 6, 0, 0],
		[0, 0, 0, 6, 2, 6, 4, 4, 4, 2, 2, 0, 0, 0],
		[0, 0, 2, 6, 4, 0, 0, 0]
		
	],

	LETTERS: [
		[0, 6, 0, 2, 2, 0, 4, 2, 4, 4, 0, 4, 4, 4, 4, 6], //A
		[0, 3, 0, 6, 2, 6, 3, 5, 3, 4, 2, 3, 0, 3, 0, 0, 2, 0, 3, 1, 3, 2, 2, 3], //B
		[4, 0, 0, 0, 0, 6, 4, 6], //C
		[0, 0, 0, 6, 2, 6, 4, 4, 4, 2, 2, 0, 0, 0], //D
		[4, 0, 0, 0, 0, 3, 3, 3, 0, 3, 0, 6, 4, 6], //E
		[4, 0, 0, 0, 0, 3, 3, 3, 0, 3, 0, 6], //F
		[4, 2, 4, 0, 0, 0, 0, 6, 4, 6, 4, 4, 2, 4], //G
		[0, 0, 0, 6, 0, 3, 4, 3, 4, 0, 4, 6], //H
		[0, 0, 4, 0, 2, 0, 2, 6, 4, 6, 0, 6], //I
		[4, 0, 4, 6, 2, 6, 0, 4], //J
		[3, 0, 0, 3, 0, 0, 0, 6, 0, 3, 3, 6], //K
		[0, 0, 0, 6, 4, 6], //L
		[0, 6, 0, 0, 2, 2, 4, 0, 4, 6], //M
		[0, 6, 0, 0, 4, 6, 4, 0], //N
		[0, 0, 4, 0, 4, 6, 0, 6, 0, 0], //O
		[0, 6, 0, 0, 4, 0, 4, 3, 0, 3], //P
		[0, 0, 0, 6, 2, 6, 3, 5, 4, 6, 2, 4, 3, 5, 4, 4, 4, 0, 0, 0], //Q
		[0, 6, 0, 0, 4, 0, 4, 3, 0, 3, 1, 3, 4, 6], //R
		[4, 0, 0, 0, 0, 3, 4, 3, 4, 6, 0, 6], //S
		[0, 0, 4, 0, 2, 0, 2, 6], //T
		[0, 0, 0, 6, 4, 6, 4, 0], //U
		[0, 0, 2, 6, 4, 0], //V
		[0, 0, 0, 6, 2, 4, 4, 6, 4, 0], //W
		[0, 0, 4, 6, 2, 3, 4, 0, 0, 6], //X
		[0, 0, 2, 2, 4, 0, 2, 2, 2, 6], //Y
		[0, 0, 4, 0, 0, 6, 4, 6]//Z
	],

	NUMBERS: [
		[0, 0, 0, 6, 4, 6, 4, 0, 0, 0], //0
		[2, 0, 2, 6], //1
		[0, 0, 4, 0, 4, 3, 0, 3, 0, 6, 4, 6], //2
		[0, 0, 4, 0, 4, 3, 0, 3, 4, 3, 4, 6, 0, 6], //3
		[0, 0, 0, 3, 4, 3, 4, 0, 4, 6], //4
		[4, 0, 0, 0, 0, 3, 4, 3, 4, 6, 0, 6], //5
		[0, 0, 0, 6, 4, 6, 4, 3, 0, 3], //6
		[0, 0, 4, 0, 4, 6], //7
		[0, 3, 4, 3, 4, 6, 0, 6, 0, 0, 4, 0, 4, 3], //8
		[4, 3, 0, 3, 0, 0, 4, 0, 4, 6], //9
	]

}
