import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as p5 from 'p5';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'p5test';
  @ViewChild('canvas', {static: true}) canvas: ElementRef;

  private p5;
  private particleSystem;

  ngOnInit() {
    this.createCanvas();
  }

  private createCanvas = () => {
    console.log('creating canvas');
    this.p5 = new p5(this.drawing);
  }

  private drawing = (p: any) => {
    let systems;
    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight).parent(this.canvas);
      systems = [];
    };

    p.center = { x: 0, y: 0 };

    p.draw = () => {
      p.background(51);
      p.background(0);
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < systems.length; i++) {
        systems[i].run();
        systems[i].addParticle();
      }
      if (systems.length === 0) {
        p.fill(255);
        p.textAlign(p.CENTER);
        p.textSize(32);
        p.text('click mouse to add particle systems', p.width / 2, p.height / 2);
      }
    };

    const Particle = function(position) {
      this.acceleration = p.createVector(0, 0.05);
      this.velocity = p.createVector(p.random(-1, 1), p.random(-1, 0));
      this.position = position.copy();
      this.lifespan = 255.0;
    };

    const ParticleSystem = function particleSystem(position) {
      this.origin = position.copy();
      this.particles = [];
    };

    ParticleSystem.prototype.addParticle = function () {
      let particle;
      // Add either a Particle or CrazyParticle to the system
      if (p.int(p.random(0, 2)) === 0) {
        particle = new Particle(this.origin);
      } else {
        particle = new CrazyParticle(this.origin);
      }
      this.particles.push(particle);
    };

    p.mousePressed = () => {
      this.particleSystem = new ParticleSystem(p.createVector(p.mouseX, p.mouseY));
      systems.push(this.particleSystem);
    };

    Particle.prototype.run = function() {
      this.update();
      this.display();
    };

    Particle.prototype.update = function() {
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.lifespan -= 2;
    };

    Particle.prototype.display = function display() {
      p.stroke(200, this.lifespan);
      p.strokeWeight(2);
      p.fill(127, this.lifespan);
      p.ellipse(this.position.x, this.position.y, 12, 12);
    };

    Particle.prototype.isDead = function isDead() {
      if (this.lifespan < 0) {
        return true;
      } else {
        return false;
      }
    };

    ParticleSystem.prototype.run = function run() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const part = this.particles[i];
        part.run();
        if (part.isDead()) {
          this.particles.splice(i, 1);
        }
      }
    };

    // A subclass of Particle

    function CrazyParticle(origin) {
      Particle.call(this, origin);
      this.theta = 0.0;
    }

    CrazyParticle.prototype = Object.create(Particle.prototype); // See note below

    CrazyParticle.prototype.constructor = CrazyParticle;

    CrazyParticle.prototype.update = function() {
      Particle.prototype.update.call(this);
      this.theta += (this.velocity.x * this.velocity.mag()) / 10.0;
    };

    CrazyParticle.prototype.display = function() {
      Particle.prototype.display.call(this);
      p.push();
      p.translate(this.position.x, this.position.y);
      p.rotate(this.theta);
      p.stroke(255, this.lifespan);
      p.line(0, 0, 25, 0);
      p.pop();
    };
  }
}
