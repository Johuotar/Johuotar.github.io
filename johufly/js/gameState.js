/**
 * AsteroidSize constant, probably a bad place to declare it
 */
var AsteroidSize = 8;

/**
 * GameState class, celled when game start, handle game updating and
 * rendering
 */
var GameState = State.extend({

		/**
		 * Constructor
		 *
		 * @param  {Game} game manager for the state
		 */
		init: function (game) {
			this._super(game);

			// store canvas dimensions for later use
			this.canvasWidth = game.canvas.ctx.width;
			this.canvasHeight = game.canvas.ctx.height;

			// create ship object
			this.ship = new Ship(Points.SHIP, Points.FLAMES, 2, 0, 0);
			this.ship.maxX = this.canvasWidth;
			this.ship.maxY = this.canvasHeight;

			// score and lives variables
			this.lives = 3;

			this.gameOver = false;

			this.score = 0;
			this.lvl = 0;

			// create lifepolygon and rotate 45° counter clockwise
			this.lifepolygon = new Polygon(Points.SHIPSIMPLE);
			this.lifepolygon.scale(1);
			this.lifepolygon.rotate(-Math.PI / 2);

			// create hppolygon
			this.hppolygon = new Polygon(Points.HP);
			this.hppolygon.scale(0.75);
			
			// create ammopolygon
			this.ammopolygon = new Polygon(Points.AMMO);
			this.ammopolygon.scale(0.50);

			// generate asteroids and set ship position
			this.generateLvl();
			
			//sounds
			var soundExplosion = new Audio("js\\explosion.wav");
		},

		/**
		 * Create and initiate asteroids and bullets
		 */
		generateLvl: function () {
			// calculate the number of asteroid to create
			var num = Math.round(10 * Math.atan(this.lvl / 25)) + 3;
			
			// calculate the number of walls to create
			var num2 = Math.round(10 * Math.atan(this.lvl / 25)) + 1;

			// set ship position
			this.ship.x = this.canvasWidth / 2;
			this.ship.y = this.canvasHeight / 2;
			this.ship.rotate(-Math.PI / 2);
			
			this.ship.ammo = 200;
			this.ship.hp = this.ship.maxhp;

			// init bullet array
			this.bullets = [];
			
			// init wreckage parts array
			this.parts = [];
			
			// init container array
			this.containers = [];

			// dynamically create asteroids and push to array
			this.asteroids = [];
			
			for (var i = 0; i < num; i++) {
				// choose asteroid polygon randomly
				var n = Math.round(Math.random() * (Points.ASTEROIDS.length - 1));

				// set position close to edges of canvas
				var x = 0,
				y = 0;
				if (Math.random() > 0.5) {
					x = Math.random() * this.canvasWidth;
				} else {
					y = Math.random() * this.canvasHeight;
				}
				// actual creating of asteroid
				var astr = new Asteroid(Points.ASTEROIDS[n], AsteroidSize, x, y);
				astr.maxX = this.canvasWidth;
				astr.maxY = this.canvasHeight;
				// push to array
				this.asteroids.push(astr);
			}
			
			// create random walls dynamically and push to array
			this.walls = [];
			/*
			for (var i = 0; i < num2; i++) {
				// choose wall polygon randomly
				var n = Math.round(Math.random() * (Points.WALL.length - 1));
				
				// set position close to edges of canvas
				var x = 0,
				y = 0;
				if (Math.random() > 0.5) {
					x = Math.random() * this.canvasWidth;
					y = 80 * Math.random()
				} else {
					y = Math.random() * this.canvasHeight;
					x = 80 * Math.random()
				}
				// actual creating of wall
				var wall = new Wall(Points.WALL[n], 25, x, y);
				wall.maxX = this.canvasWidth;
				wall.maxY = this.canvasHeight;
				console.log(n, x, y);
				// push to array
				this.walls.push(wall);
			}
			*/
			// create the map border walls and push to the earlier wall array
			var x = 0,
			y = 0;
			// set position centered
			x = this.canvasWidth / 2;
			y = this.canvasHeight / 2;
			
			var currentlevel = 0;//TODO: make more than 2 maps
			if (Math.random() > 0.5) {
				currentlevel = 1;
			}
			// actual creating of map
			var map = new Wall(Points.MAPS[currentlevel], 20, x, y);
			map.maxX = this.canvasWidth;
			map.maxY = this.canvasHeight;
			console.log(x, y);
			// push to array
			this.walls.push(map);
			
			//create a container
			var container = new Container(Points.CRATE, 6, this.canvasWidth / 2 + 180, this.canvasHeight / 2 + 120);
			container.maxX = this.canvasWidth;
			container.maxY = this.canvasHeight;
			console.log("container at" + x, y)
			//push to containers array which holds containers
			this.containers.push(container);
			
		},

		/**
		 * @override State.handleInputs
		 *
		 * @param  {InputHandeler} input keeps track of all pressed keys
		 */
		handleInputs: function (input) {
			// only update ship orientation and velocity if it's visible
			if (!this.ship.visible) {
				if (input.isPressed("spacebar")) {
					// change state if game over
					if (this.gameOver) {
						this.game.nextState = States.END;
						this.game.stateVars.score = this.score;
						return;
					}
					this.respawn(this.ship);
				}
				return;
			}
			
			if (input.isDown("control")) {
				this.ship.drawTractorbeam = true;
			}
			else{
				this.ship.drawTractorbeam = false;
			}
			if (input.isDown("right")) {
				this.ship.rotate(0.06);
			}
			if (input.isDown("left")) {
				this.ship.rotate(-0.06);
			}
			if (input.isDown("up")) {
				this.ship.addVel();
			}
			
			if (input.isDown("shift") && this.ship.fireCooldown >= this.ship.fireSpeed && this.ship.ammo > 0) {
				this.bullets.push(this.ship.shoot2());
				this.ship.fireCooldown = this.ship.fireSpeed / 2;
			}

			if (input.isDown("spacebar") && this.ship.fireCooldown >= this.ship.fireSpeed && this.ship.ammo > 0) {
				this.bullets.push(this.ship.shoot());
				this.ship.fireCooldown = 0;
			}
		},
		
		/**
		 * destroy ship function
		 * spawns wreckage parts too
		 */
		destroy: function (destroyedShip) {
			
			if (destroyedShip == null) {
				return;
				console.log("Ship that was to be destroyed does not exists anymore. Was the function called twice?");
			}
			for (var i = 0; i < 6; i++) {
				var n = Math.round(Math.random() * (Points.PART.length - 1));
				var p = new Part(Points.PART[n], 3 ,destroyedShip.x, destroyedShip.y, destroyedShip.vel.x, destroyedShip.vel.y);
				this.parts.push(p);
				console.log("parts should have spawned by now to location x.y");
				console.log(p.x, p.y)
				p.maxX = this.maxX;
				p.maxY = this.maxY;
			}
			destroyedShip.visible = false;
			this.soundExplosion.play();
		},
		
		/**
		 * respawn ship function
		 * called soon after the ship goes boom
		 */
		respawn: function (respawningShip) {
			
			if (respawningShip == null) {
				return;
				console.log("Ship that was to be respawned does not exists anymore. Was the function called twice?");
			}
			
			respawningShip.x = this.canvasWidth / 2;
			respawningShip.y = this.canvasHeight / 2;
			respawningShip.vel = {
				x: 0,
				y: 0
			}
			respawningShip.rotate(-Math.PI / 2);
			this.ship.visible = true;
			this.lives--;
			this.ship.hp = this.ship.maxhp;
			this.ship.ammo = 200;
			if (this.lives <= 0) {
				this.gameOver = true;
			}
		},

		/**
		 * @override State.update
		 */
		update: function () {
			//iterate thru and update all containers
			for (var i = 0, len = this.containers.length; i < len; i++) {
				var a = this.containers[i];
				a.update();
			}
				// if ship collides with container
				if (this.ship.collide(a)) {
					if ( this.ship.ammo < 101){
						this.ship.ammo += 100;
					}
					if (this.ship.hp < 51) {
						this.ship.hp += 50;
					}
				}
				// if tractorbeam collides with container
				if (this.ship.tractorbeam(a) && this.ship.drawTractorbeam == true) {
					a.vel.x = this.ship.vel.x;
					a.vel.y = this.ship.vel.y;
				}
			
			// iterate thru and update all asteroids
			for (var i = 0, len = this.asteroids.length; i < len; i++) {
				var a = this.asteroids[i];
				a.update();

				// if ship collides to asteroid
				if (this.ship.collide(a)) {
					this.ship.hp--;
					if (this.ship.hp <= 0) {
						this.destroy(this.ship);
					}
				}
				// if tractorbeam collides with asteroid
				if (this.ship.tractorbeam(a) && this.ship.drawTractorbeam == true) {
					a.vel.x = this.ship.vel.x;
					a.vel.y = this.ship.vel.y;
				}

				// check if bullets hits the current asteroid
				for (var j = 0, len2 = this.bullets.length; j < len2; j++) {
					var b = this.bullets[j];

					if (a == null) {
						return;
						console.log("bullet asteroid hit check, target was null, skipped");
					}
					if (a.hasPoint(b.x, b.y)) {
						this.bullets.splice(j, 1);
						len2--;
						j--;

						// update score depending on asteroid size
						switch (a.size) {
						case AsteroidSize:
							this.score += 20;
							break;
						case AsteroidSize / 2:
							this.score += 50;
							break;
						case AsteroidSize / 4:
							this.score += 100;
							break;
						}

						// if asteroid splitted twice, then remove
						// else split in half
						if (a.size > AsteroidSize / 4) {
							for (var k = 0; k < 2; k++) {
								var n = Math.round(Math.random() * (Points.ASTEROIDS.length - 1));

								var astr = new Asteroid(Points.ASTEROIDS[n], a.size / 2, a.x, a.y);
								astr.maxX = this.canvasWidth;
								astr.maxY = this.canvasHeight;

								this.asteroids.push(astr);
								len++;
							}
						}
						this.asteroids.splice(i, 1);
						len--;
						i--;
					}
				}
			}

			// iterate thru and update all bullets
			for (var i = 0, len = this.bullets.length; i < len; i++) {
				var b = this.bullets[i];
				b.update();

				// remove bullet if removeflag is setted
				if (b.shallRemove) {
					this.bullets.splice(i, 1);
					len--;
					i--;
				}
			}
			
			// iterate thru and update all wreckage parts
			for (var i = 0, len = this.parts.length; i < len; i++) {
				var p = this.parts[i];
				p.update();

				// remove parts if removeflag is setted
				if (p.shallRemove) {
					this.parts.splice(i, 1);
					len--;
					i--;
				}
			}
			
			// update ship
			this.ship.update();

			// check if lvl completed
			if (this.asteroids.length === 0) {
				this.lvl++;
				this.generateLvl();
			}
			
			// iterate thru and update all walls
			for (var i = 0, len = this.walls.length; i < len; i++) {
				var a = this.walls[i];

				// if ship collides to wall
				if (this.ship.collide(a)) {
					this.ship.hp--;
					this.ship.vel = {
							x: this.ship.vel.x * -0.5,
							y: this.ship.vel.y * -0.5
						}
						this.ship.x += this.ship.vel.x * 2;
						this.ship.y += this.ship.vel.y * 2;
					if (this.ship.hp <= 0) {
						this.destroy(this.ship);
					}
				}
				
				// check if containers hits the walls
				for (var j = 0, len2 = this.containers.length; j < len2; j++) {
					var b = this.containers[j];
					if (b.collide(a)) {
						b.vel = {
							x: b.vel.x * -0.5,
							y: b.vel.y * -0.5
						}
						b.x += b.vel.x * 2;
						b.y += b.vel.y * 2;
						//j--;
						//i--;
					}
				}

				// check if bullets hits the walls
				for (var j = 0, len2 = this.bullets.length; j < len2; j++) {
					var b = this.bullets[j];

					if (a == null) {
						return;
						console.log("bullet wall hit check, target was null, skipped");
					}
					if (a.hasPoint(b.x, b.y)) {
						this.bullets.splice(j, 1);
						len2--;
						j--;
						i--;
					}
				}
				
				// check if asteroid hits the walls
				for (var j = 0, len3 = this.asteroids.length; j < len3; j++) {
					var c = this.asteroids[j];

					if (c == null || a == null) {
						return;
						console.log("asteroid wall hit check, either one was null, skipped");
					}
					if (a.hasPoint(c.x, c.y)) {// TODO: Asteroids should bounce off in right angle
						c.vel = {
							x: c.vel.x / -1,
							y: c.vel.y / -1
						}
						c.x += c.vel.x * 2;
						c.y += c.vel.y * 2;
						
						
						len3--;
						j--;
						i--;
					}
				}
				
				// check if wreckage part hits the walls
				for (var j = 0, len4 = this.parts.length; j < len4; j++) {
					var p = this.parts[j];

					if (p == null || a == null) {
						return;
						console.log("part wall hit check, target was null, skipped");
					}
					if (a.hasPoint(p.x, p.y)) {//remove the part
						this.parts.splice(j, 1);
						len3--;
						j--;
						i--;
					}
				}
			}
			
		},

		/**
		 * @override State.render
		 *
		 * @param  {context2d} ctx augmented drawing context
		 */
		render: function (ctx) {
			ctx.clearAll();
			
			ctx.save();
			ctx.translate(this.canvasWidth / 2 - this.ship.x, this.canvasHeight / 2 - this.ship.y);//camera follows ship effect
			
			// draw ship
			ctx.strokeStyle = 'yellow';
			this.ship.draw(ctx);
			
			// draw all wall pieces and map sections
			ctx.strokeStyle = 'white';
			for (var i = 0, len = this.walls.length; i < len; i++) {
				this.walls[i].draw(ctx);
			}
			// draw all asteroids
			ctx.strokeStyle = 'blue';
			for (var i = 0, len = this.asteroids.length; i < len; i++) {
				this.asteroids[i].draw(ctx);
			
			}// draw all bullets
			ctx.strokeStyle = 'red';
			for (var i = 0, len = this.bullets.length; i < len; i++) {
				this.bullets[i].draw(ctx);
			}
			// draw all wreckage parts
			ctx.strokeStyle = 'yellow';
			for (var i = 0, len = this.parts.length; i < len; i++) {
				this.parts[i].draw(ctx);
			}
			// draw all containers
			ctx.strokeStyle = 'yellow';
			for (var i = 0, len = this.containers.length; i < len; i++) {
				this.containers[i].draw(ctx);
			}
			
			ctx.restore();
			
			//Draw velocity and location for test purposes
			ctx.strokeStyle = 'white';
			ctx.strokeText(this.ship.vel.x, 10, 85);
			ctx.strokeText(this.ship.vel.y, 10, 100);
			ctx.strokeText(this.ship.x, 10, 115);
			ctx.strokeText(this.ship.y, 10, 130);
			
			// draw UI: score, extra lives, hp, ammo and game over message
			ctx.strokeStyle = 'green';
			
			ctx.vectorText(this.score, 3, 120, 20);
			
			for (var i = 0; i < this.ship.hp; i++) {
				ctx.drawPolygon(this.hppolygon, 20 + 5 * i, 50);
			}
			
			for (var i = 0; i < this.ship.ammo; i++) {
				ctx.drawPolygon(this.ammopolygon, 20 + 5 * i, 70);
			}
			
			for (var i = 0; i < this.lives; i++) {
				ctx.drawPolygon(this.lifepolygon, 20 + 15 * i, 35);
			}
			
			if (this.gameOver) {
				ctx.vectorText("Game Over", 4, null, null);
			}
			
		}
	});
