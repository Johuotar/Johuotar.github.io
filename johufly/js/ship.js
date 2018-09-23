/**
 * Ship class, extends Polygon see polygon.js
 */
var Ship = Polygon.extend({

		/**
		 * Bounds for the ship
		 */
		maxX: null,
		maxY: null,

		/**
		 * Constructor
		 *
		 * @param  {Array<number>} p  list of ship verticies
		 * @param  {Array<number>} pf list of flames verticies
		 * @param  {number}        s  scalefactor, size of ship
		 * @param  {number}        x  start x coordinate
		 * @param  {number}        y  start y coordinate
		 */
		init: function (p, pf, s, x, y) {
			this._super(p); // call super constructor

			// create, init and scale flame polygon
			this.flames = new Polygon(pf);
			this.flames.scale(s);

			// visual flags
			this.drawFlames = false;
			this.visible = true;
			this.drawTractorbeam = false;

			// position vars
			this.x = x;
			this.y = y;

			// scale the ship to the specified size
			this.scale(s);

			// facing direction
			this.angle = 0;

			// velocity
			this.vel = {
				x: 0,
				y: 0
			}

			// hitpoints AKA hp
			this.hp = 50;

			// max hitpoints AKA maxhp
			this.maxhp = 50;
			
			// tractorbeam
			this.tractorbeamLength = 80;

			// gravity and weight of carried object
			this.gravity = 0.015;
			this.weight = 0.0;

			//cooldown
			this.fireSpeed = 20;
			this.fireCooldown = 0;
			
			// acceleration
			this.acceleration = 0.095;

			//angle is random when firing second firetype
			this.angleshift = Math.random() - 0.4
			this.angleshift *= Math.floor(Math.random() * 2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases

			// ammo
			this.ammo = 200;
			
			// max ammo AKA maxammo
			this.maxammo = 200;

		},

		/**
		 * Returns whether ship is colling with poly
		 * Could be removed if the overridden collide func in polygon class is improved to work with ships. 21.9.2018
		 * Javascript has no overloading, so the last one overrides the previous function
		 * @param  {Asteroid} astr asteroid to test
		 * @return {Boolean}       result from test
		 */
		
		collide: function (astr) {
			// don't test if not visible
			if (!this.visible) {
				return false;
			}
			// don't test if the object no longer exists, bullet destroyed it etc
			if (astr == null) {
				return false;
				console.log("collide function target was null, return false");
			}
			for (var i = 0, len = this.points.length - 2; i < len; i += 2) {
				var x = this.points[i] + this.x;
				var y = this.points[i + 1] + this.y;

				if (astr.hasPoint(x, y)) {
					return true;
				}
			}
			return false;
		},
		
		/**
		 * Returns whether ship's tractorbeam is colliding with object
		 *
		 * @param  {obj} object to test
		 * @return {Boolean}       result from test
		 */
		tractorbeam: function (obj) {
			if ( this.drawTractorbeam == true) {
				// don't test if not visible or if the object no longer exists, bullet destroyed it etc
				if (!this.visible || obj == null) {
					console.log("Tractor beam func beam returned false because testable object was null or ship was not visible.");
					this.weight = 0.0;
					return false;
				}
				if (obj.hasPoint(this.x , this.y + this.tractorbeamLength)) {
					this.weight = 0.030;
					return obj;
				}
				this.weight = 0.0;
			}
			return false;
		},

		/**
		 * Create and return bullet with arguments from current
		 * direction and position
		 *
		 * @return {Bullet} the initated bullet
		 */
		shoot: function () {
			this.ammo--;
			var b = new Bullet(this.points[0] + this.x, this.points[1] + this.y, this.angle);
			b.maxX = this.maxX;
			b.maxY = this.maxY;
			return b;
		},

		shoot2: function () {
			this.ammo--;
			var b = new Bullet(this.points[0] + this.x, this.points[1] + this.y, this.angle + this.angleshift);
			//angle of bullets changes
			this.angleshift = Math.random() - 0.4
				this.angleshift *= Math.floor(Math.random() * 2) == 1 ? 1 : -1; // 50% chance of minus sign
			b.maxX = this.maxX;
			b.maxY = this.maxY;
			return b;
		},

		/**
		 * Update the velocity of the bullet depending on facing
		 * direction
		 */
		addVel: function () {
			// length of veloctity vector estimated with pythagoras
			// theorem, i.e.
			// 		a*a + b*b = c*c
			if (this.vel.x * this.vel.x + this.vel.y * this.vel.y < 20 * 20) {
				this.vel.x += this.acceleration * Math.cos(this.angle);
				this.vel.y += this.acceleration * Math.sin(this.angle);
			}
			this.drawFlames = true;
		},

		/**
		 * Rotate the ship and flame polygon clockwise
		 *
		 * @param  {number} theta angle to rotate with
		 *
		 * @override Polygon.rotate
		 */
		rotate: function (theta) {
			this._super(theta);
			this.flames.rotate(theta);
			this.angle += theta;
		},

		/**
		 * Decrease velocity and update ship position
		 */
		update: function () {
			//update cooldown
			this.fireCooldown++;

			// update position
			this.x += this.vel.x;
			this.y += this.vel.y;

			this.vel.x *= 0.99;
			this.vel.y *= 0.99;

			//ship falls by its gravity
			if (this.visible) {
				this.vel.y += this.gravity + this.weight;
			}

			/*
			// keep within sane bounds NOTE: IRRELEVANT AS OF 20.9.2018
			if (this.x > this.maxX) {
			this.x = this.maxX;
			this.vel.x = 0;
			} else if (this.x < 0) {
			this.x = 0;
			this.vel.x = 0;
			}
			if (this.y > this.maxY) {
			this.y = this.maxY
			this.vel.y = 0;
			} else if (this.y < 0) {
			this.y = 0;
			this.vel.y = 0;
			}*/
		},

		/**
		 * Draw the ship with an augmented drawing context
		 *
		 * @param  {context2d} ctx augmented drawing context
		 */
		draw: function (ctx) {
			if (!this.visible) {
				return;
			}
			ctx.drawPolygon(this, this.x, this.y);
			if (this.drawFlames) {
				ctx.strokeStyle = 'red';
				ctx.drawPolygon(this.flames, this.x, this.y);
				this.drawFlames = false;
			}
			if (this.drawTractorbeam) {
				ctx.strokeStyle = 'white';
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(this.x, this.y + this.tractorbeamLength);
				ctx.stroke();
			}
			
		}
	});
