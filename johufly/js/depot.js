/**
 * supply Depot class, extends Polygon see polygon.js
 */
var Depot = Polygon.extend({

		/**
		 * Bounds for the depot
		 */
		maxX: null,
		maxY: null,

		/**
		 * Constructor
		 *
		 * @param  {Array<number>} p list of verticies
		 * @param  {number}        s scalefactor, size of depot
		 * @param  {number}        x start x coordinate
		 * @param  {number}        y start y coordinate
		 */
		init: function (p, s, x, y) {
			this._super(p); // call super constructor

			// position vars
			this.x = x;
			this.y = y;

			// scale the depot to the specified size
			this.size = s;
			this.scale(s);

			// Set rotation angle used in each update
			//this.rotAngle = 0.02 * (Math.random() * 2 - 1);

			// starts with no velocity
			this.vel = {
				x: 0,
				y: 0
			}

			// gravity
			this.gravity = 0.015;
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
		 * Translate and rotate the depot
		 */
		update: function () {
			// update position
			this.x += this.vel.x;
			this.y += this.vel.y;

			this.vel.x *= 0.99;
			this.vel.y *= 0.99;

			// falls by its gravity
			this.vel.y += this.gravity;

			/*
			// keep within bounds
			if (this.x > this.maxX) {
			this.x = 0;
			} else if (this.x < 0) {
			this.x = this.maxX;
			}
			if (this.y > this.maxY) {
			this.y = 0;
			} else if (this.y < 0) {
			this.y = this.maxY;
			}*/
			// Don't rotate depots for now
			//this.rotate(this.rotAngle);
		},

		/**
		 * Draw the depot with an augmented drawing context
		 *
		 * @param  {context2d} ctx augmented drawing conext
		 */
		draw: function (ctx) {
			ctx.drawPolygon(this, this.x, this.y);
		}
	});
