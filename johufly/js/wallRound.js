/**
 * wallRound class, extends Polygon see polygon.js
   REMAINS UNFINISHED AND CAUSES ERRORS IF USED
 */
var wallRound = Polygon.extend({

		/**
		 * Bounds for the wallRound
		 */
		maxX: null,
		maxY: null,

		/**
		 * Constructor
		 *
		 * @param  {Array<number>} p list of verticies
		 * @param  {number}        s scalefactor, size of wallRound
		 * @param  {number}        x start x coordinate
		 * @param  {number}        y start y coordinate
		 */
		init: function (p, s, x, y) {
			this._super(p); // call super constructor

			// position vars
			this.x = x;
			this.y = y;

			// scale the wallRound to the specified size
			this.size = s;
			this.scale(s);
		},

		/**
		 * Useful point in polygon check, taken from:
		 * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
		 *
		 * @param  {number}  x test x coordinate
		 * @param  {number}  y test y coordinate
		 * @return {Boolean}   result from check
		 *
		 * @override Polygon.hasPoint
		 */
		hasPoint: function (x, y) {
			return this._super(this.x, this.y, x, y);
		},

		/**
		 * Draw the wallRound with an augmented drawing context
		 *
		 * @param  {context2d} ctx augmented drawing conext
		 */
		draw: function (ctx) {
			ctx.drawPolygon(this, this.x, this.y);
		}
	});
