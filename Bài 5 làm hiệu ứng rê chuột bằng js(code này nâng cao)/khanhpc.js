(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  // Controls
  const effectSelect = document.getElementById('effectSelect');
  const colorPicker = document.getElementById('colorPicker');
  const sizeSlider = document.getElementById('sizeSlider');
  const intensitySlider = document.getElementById('intensitySlider');
  const speedSlider = document.getElementById('speedSlider');
  const spreadSlider = document.getElementById('spreadSlider');
  const resetBtn = document.getElementById('resetBtn');

  let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
  let isMoving = false;

  // Parameters
  let effectType = effectSelect.value;
  let lightColor = colorPicker.value;
  let lightSize = parseInt(sizeSlider.value, 10);
  let lightIntensity = parseFloat(intensitySlider.value);
  let effectSpeed = parseFloat(speedSlider.value);
  let effectSpread = parseInt(spreadSlider.value, 10);

  // Utility function
  function hexToRGBA(hex, alpha) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c = hex.substring(1).split('');
      if(c.length === 3){
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x'+c.join('');
      return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return `rgba(64,196,255,${alpha})`;
  }

  // Base class for effects with common methods
  class BaseEffect {
    setColor(c) { this.color = c; }
    setSize(s) { this.size = s; }
    setIntensity(i) { this.intensity = i; }
    setSpeed(sp) { this.speed = sp; }
    setSpread(spd) { this.spread = spd; }
    reset() {}
    update(){}
    draw(){}
  }

  // 1. WaterLight Effect
  class WaterLightEffect extends BaseEffect {
    constructor(){
      super();
      this.points = [];
      this.maxPoints = 35;
      this.color = lightColor;
      this.size = lightSize;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
      this.spread = effectSpread;
    }
    update(){
      if(isMoving) {
        this.points.push({x: mouse.x, y: mouse.y, age:0});
        if(this.points.length > this.maxPoints) this.points.shift();
      } else if(this.points.length) {
        this.points.shift();
      }
      this.points.forEach(p => p.age++);
    }
    draw(ctx){
      if(this.points.length < 2) return;
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      const len = this.points.length;
      for(let i=0; i<len-1; i++){
        let p0 = this.points[i];
        let t = i/(len-1);
        let alpha = (1 - t) * this.intensity * 0.8;
        let size = this.size * (1 - t * 0.9);
        let grad = ctx.createRadialGradient(p0.x, p0.y, size*0.1, p0.x, p0.y, size);
        grad.addColorStop(0, hexToRGBA(this.color, alpha));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(p0.x, p0.y, size, size*0.6, Math.sin(p0.age * 0.1 * this.speed) * 0.5, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.strokeStyle = hexToRGBA(this.color, this.intensity*0.6);
      ctx.lineWidth = this.size*0.35;
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for(let i=1; i<len; i++){
        let midX = (this.points[i].x + this.points[i-1].x)/2;
        let midY = (this.points[i].y + this.points[i-1].y)/2;
        ctx.quadraticCurveTo(this.points[i-1].x, this.points[i-1].y, midX, midY);
      }
      ctx.stroke();
      ctx.restore();
    }
    setSize(size) {
      super.setSize(size);
      this.maxPoints = Math.min(70, Math.floor(size / 1.5) + 25);
    }
  }

  // 2. Glowing Orb Effect
  class GlowingOrbEffect extends BaseEffect {
    constructor(){
      super();
      this.x = mouse.x;
      this.y = mouse.y;
      this.color = lightColor;
      this.size = lightSize;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
      this.phase = 0;
    }
    update() {
      this.x += (mouse.x - this.x) * 0.15;
      this.y += (mouse.y - this.y) * 0.15;
      this.phase += 0.05 * this.speed;
    }
    draw(ctx){
      ctx.save();
      const pulse = 0.7 + 0.3 * Math.sin(this.phase);
      const radius = this.size * pulse;
      let grad = ctx.createRadialGradient(this.x, this.y, radius*0.1, this.x, this.y, radius);
      grad.addColorStop(0, hexToRGBA(this.color, this.intensity));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = hexToRGBA(this.color, this.intensity*1.0);
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius*0.3, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 3. Ripple Effect
  class RippleEffect extends BaseEffect {
    constructor(){
      super();
      this.x = mouse.x;
      this.y = mouse.y;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.ripples = [];
      this.maxRipples = 6;
      this.speed = effectSpeed;
      this.spread = effectSpread;
    }
    update(){
      this.x += (mouse.x - this.x) * 0.25;
      this.y += (mouse.y - this.y) * 0.25;
      if(isMoving && this.ripples.length < this.maxRipples){
        this.ripples.push({
          x: this.x + (Math.random() - 0.5)*this.spread*0.2,
          y: this.y + (Math.random() - 0.5)*this.spread*0.2,
          radius: 0, maxRadius: this.spread,
          opacity: this.intensity
        });
      }
      for(let i=this.ripples.length-1; i>=0; i--){
        let r = this.ripples[i];
        r.radius += 2 * this.speed;
        r.opacity -= 0.015 * this.speed;
        if(r.opacity <= 0) this.ripples.splice(i, 1);
      }
    }
    draw(ctx){
      ctx.save();
      this.ripples.forEach(r => {
        const grad = ctx.createRadialGradient(r.x, r.y, r.radius*0.4, r.x, r.y, r.radius);
        grad.addColorStop(0, hexToRGBA(this.color, r.opacity * 0.8));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI*2);
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  // 4. Star Trail Effect
  class StarTrailEffect extends BaseEffect {
    constructor(){
      super();
      this.stars = [];
      this.maxStars = 70;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.size = lightSize;
      this.speed = effectSpeed;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX) * 0.2;
      this.mouseY += (mouse.y - this.mouseY) * 0.2;
      if(this.stars.length < this.maxStars){
        this.stars.push({
          x: this.mouseX,
          y: this.mouseY,
          vx: (Math.random()-0.5)*2*this.speed,
          vy: (Math.random()-0.5)*2*this.speed,
          radius: Math.random()*(this.size/4)+1,
          alpha: 1,
          life: 60+Math.random()*60,
        });
      }
      for(let i=this.stars.length-1; i>=0; i--){
        const s = this.stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 1/s.life;
        s.life -= 1;
        if(s.alpha <= 0 || s.life <= 0) this.stars.splice(i, 1);
      }
    }
    draw(ctx){
      ctx.save();
      ctx.fillStyle = hexToRGBA(this.color, this.intensity);
      this.stars.forEach(s => {
        ctx.globalAlpha = s.alpha * this.intensity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  // 5. Firefly Effect
  class FireflyEffect extends BaseEffect {
    constructor(){
      super();
      this.fireflies = [];
      this.maxFireflies = 40;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.size = lightSize / 3;
      this.speed = effectSpeed;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.spread = effectSpread;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX) * 0.25;
      this.mouseY += (mouse.y - this.mouseY) * 0.25;
      if(this.fireflies.length < this.maxFireflies){
        this.fireflies.push({
          x: this.mouseX + (Math.random()-0.5)*this.spread,
          y: this.mouseY + (Math.random()-0.5)*this.spread,
          vx: (Math.random()-0.5)*0.5*this.speed,
          vy: (Math.random()-0.5)*0.5*this.speed,
          radius: Math.random()*this.size*0.6 + this.size*0.4,
          alpha: Math.random(),
          flickerSpeed: 0.02 + Math.random()*0.05
        });
      }
      for(let i=this.fireflies.length-1; i>=0; i--){
        const f = this.fireflies[i];
        f.x += f.vx;
        f.y += f.vy;
        f.alpha += (Math.random()-0.5)*f.flickerSpeed;
        f.alpha = Math.min(1, Math.max(0.1, f.alpha));
        const dx = f.x - this.mouseX;
        const dy = f.y - this.mouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist > this.spread){
          f.vx = -f.vx;
          f.vy = -f.vy;
        }
      }
    }
    draw(ctx){
      ctx.save();
      this.fireflies.forEach(f => {
        ctx.fillStyle = hexToRGBA(this.color, f.alpha * this.intensity);
        ctx.beginPath();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // 6. Laser Effect
  class LaserEffect extends BaseEffect {
    constructor(){
      super();
      this.beams = [];
      this.maxBeams = 20;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
      this.size = lightSize;
      this.spread = effectSpread;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX) * 0.25;
      this.mouseY += (mouse.y - this.mouseY) * 0.25;
      if(this.beams.length < this.maxBeams){
        this.beams.push({
          x: this.mouseX + (Math.random()-0.5)*this.spread,
          y: this.mouseY + (Math.random()-0.5)*this.spread,
          length: this.size + Math.random()*this.size,
          speed: 5 + Math.random()*10*this.speed,
          alpha: this.intensity,
          angle: Math.random()*Math.PI*2,
        });
      }
      for(let i=this.beams.length-1; i>=0; i--){
        const b = this.beams[i];
        b.x += Math.cos(b.angle)*b.speed;
        b.y += Math.sin(b.angle)*b.speed;
        b.alpha -= 0.015 * this.speed;
        if(b.alpha <= 0) this.beams.splice(i,1);
      }
    }
    draw(ctx){
      ctx.save();
      ctx.lineCap = 'round';
      this.beams.forEach(b => {
        const x1 = b.x, y1 = b.y;
        const x2 = b.x - Math.cos(b.angle)*b.length;
        const y2 = b.y - Math.sin(b.angle)*b.length;
        const grad = ctx.createLinearGradient(x1,y1,x2,y2);
        grad.addColorStop(0, hexToRGBA(this.color,b.alpha));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.size * 0.15;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size*0.5;
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  // 7. Fireworks Effect
  class FireworksEffect extends BaseEffect {
    constructor(){
      super();
      this.particles = [];
      this.maxParticles = 120;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
      this.size = lightSize;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.cooldown = 0;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      this.cooldown -= 1;
      if(isMoving && this.cooldown <= 0){
        for(let i=0; i<20; i++){
          const angle = Math.random()*Math.PI*2;
          const speed = 2 + Math.random()*4 * this.speed;
          this.particles.push({
            x: this.mouseX,
            y: this.mouseY,
            vx: Math.cos(angle)*speed,
            vy: Math.sin(angle)*speed,
            radius: (Math.random()*this.size*0.3) + 1,
            alpha: this.intensity,
            life: 40 + Math.random()*40
          });
        }
        this.cooldown = 45;
      }
      for(let i=this.particles.length-1; i>=0; i--){
        let p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.alpha -= 0.02*this.speed;
        p.life -= 1;
        if(p.alpha <=0 || p.life<=0) this.particles.splice(i,1);
      }
    }
    draw(ctx){
      ctx.save();
      this.particles.forEach(p=>{
        const grad = ctx.createRadialGradient(p.x, p.y, p.radius*0.2, p.x, p.y, p.radius);
        grad.addColorStop(0, hexToRGBA(this.color, p.alpha));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // 8. Neon Pulse
  class NeonPulseEffect extends BaseEffect {
    constructor(){
      super();
      this.x = mouse.x;
      this.y = mouse.y;
      this.color = lightColor;
      this.size = lightSize;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
      this.phase = 0;
    }
    update(){
      this.x += (mouse.x - this.x)*0.18;
      this.y += (mouse.y - this.y)*0.18;
      this.phase += 0.07*this.speed;
    }
    draw(ctx){
      ctx.save();
      const glowRadius = this.size*1.4 + Math.sin(this.phase)*this.size*0.6;
      const coreRadius = this.size*0.6;
      let grad = ctx.createRadialGradient(this.x,this.y,coreRadius*0.4,this.x,this.y,glowRadius);
      grad.addColorStop(0, hexToRGBA(this.color,this.intensity));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x,this.y,glowRadius,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle = hexToRGBA(this.color,this.intensity);
      ctx.beginPath();
      ctx.arc(this.x,this.y,coreRadius,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 9. Comet Tail
  class CometTailEffect extends BaseEffect {
    constructor(){
      super();
      this.trail = [];
      this.maxTrail = 20;
      this.color = lightColor;
      this.size = lightSize;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
    }
    update(){
      this.trail.push({x: mouse.x, y: mouse.y, life: 1});
      if(this.trail.length > this.maxTrail) this.trail.shift();
      this.trail.forEach(p=> {
        p.life -= 0.04 * this.speed;
      });
      this.trail = this.trail.filter(p => p.life > 0);
    }
    draw(ctx){
      ctx.save();
      for(let i=0; i<this.trail.length; i++){
        let p = this.trail[i];
        const alpha = p.life * this.intensity;
        const size = this.size * (p.life);
        let grad = ctx.createRadialGradient(p.x, p.y, size*0.1, p.x, p.y, size);
        grad.addColorStop(0, hexToRGBA(this.color, alpha));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // 10. Electric Sparks
  class ElectricSparksEffect extends BaseEffect {
    constructor(){
      super();
      this.sparks = [];
      this.maxSparks = 40;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.size = lightSize;
      this.speed = effectSpeed;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.spread = effectSpread;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      if(this.sparks.length < this.maxSparks){
        this.sparks.push({
          x:this.mouseX + (Math.random()-0.5)*this.spread,
          y:this.mouseY + (Math.random()-0.5)*this.spread,
          angle:Math.random()*Math.PI*2,
          length:this.size * (0.5 + Math.random()*1.5),
          life: 20 + Math.random()*30,
          alpha:this.intensity,
          speed:this.speed * (1+Math.random()),
        });
      }
      for(let i=this.sparks.length-1; i>=0; i--){
        const s = this.sparks[i];
        s.life--;
        s.alpha -= 0.05 * this.speed;
        if(s.life <=0 || s.alpha <= 0) this.sparks.splice(i,1);
      }
    }
    draw(ctx){
      ctx.save();
      ctx.strokeStyle = hexToRGBA(this.color, this.intensity);
      ctx.lineCap = 'round';
      this.sparks.forEach(s => {
        ctx.beginPath();
        ctx.strokeStyle = hexToRGBA(this.color, s.alpha);
        const x1 = s.x;
        const y1 = s.y;
        const x2 = x1 + Math.cos(s.angle)*s.length;
        const y2 = y1 + Math.sin(s.angle)*s.length;
        ctx.lineWidth = this.size * 0.1;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 0.4;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  // 11. Galaxy Swirl
  class GalaxySwirlEffect extends BaseEffect {
    constructor(){
      super();
      this.particles = [];
      this.maxParticles = 100;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.size = lightSize;
      this.speed = effectSpeed;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.angle = 0;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      this.angle += 0.01 * this.speed;
      while(this.particles.length < this.maxParticles){
        this.particles.push({
          angle: Math.random()*Math.PI*2,
          radius: this.size + Math.random()*this.size*2,
          speed: 0.02 + Math.random()*0.03,
          size: Math.random()*2 + 1,
          alpha: this.intensity
        });
      }
      this.particles.forEach(p=>{
        p.angle += p.speed * this.speed;
        p.alpha -= 0.001 * this.speed;
        if(p.alpha < 0) p.alpha = this.intensity;
      });
    }
    draw(ctx){
      ctx.save();
      this.particles.forEach(p=>{
        const x = this.mouseX + Math.cos(p.angle+this.angle)*p.radius;
        const y = this.mouseY + Math.sin(p.angle+this.angle)*p.radius;
        ctx.fillStyle = hexToRGBA(this.color, p.alpha);
        ctx.beginPath();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 0.6;
        ctx.arc(x, y, p.size, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
    }
    reset(){
      this.particles = [];
    }
  }

  // 12. Bubble Rise
  class BubbleRiseEffect extends BaseEffect {
    constructor(){
      super();
      this.bubbles = [];
      this.maxBubbles = 80;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.size = lightSize;
      this.speed = effectSpeed;
      this.spread = effectSpread;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      while(this.bubbles.length < this.maxBubbles){
        this.bubbles.push({
          x: this.mouseX + (Math.random()-0.5)*this.spread,
          y: this.mouseY + this.spread/2 + Math.random()*this.spread,
          radius: Math.random()*this.size*0.3 + 2,
          vy: 0.5 + Math.random()*1 * this.speed,
          alpha: this.intensity,
          life: 100 + Math.random()*100
        });
      }
      for(let i=this.bubbles.length-1; i>=0; i--) {
        const b = this.bubbles[i];
        b.y -= b.vy;
        b.life -= 1 * this.speed;
        b.alpha -= 0.003 * this.speed;
        if(b.life <= 0 || b.alpha <= 0) {
          this.bubbles.splice(i,1);
        }
      }
    }
    draw(ctx){
      ctx.save();
      this.bubbles.forEach(b=>{
        const grad = ctx.createRadialGradient(b.x, b.y, b.radius*0.3, b.x, b.y, b.radius);
        grad.addColorStop(0, hexToRGBA(this.color, b.alpha*0.6));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // 13. Laser Sweep
  class LaserSweepEffect extends BaseEffect {
    constructor(){
      super();
      this.lines = [];
      this.maxLines = 10;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
      this.size = lightSize;
      this.spread = effectSpread;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      if(this.lines.length < this.maxLines){
        this.lines.push({
          x: this.mouseX - this.spread/2,
          y: this.mouseY + (Math.random() -0.5)*this.spread,
          length: this.size*2,
          speed: 4*this.speed,
          alpha: this.intensity,
        });
      }
      for(let i=this.lines.length-1; i>=0; i--){
        let l = this.lines[i];
        l.x += l.speed;
        l.alpha -= 0.02 * this.speed;
        if(l.alpha <= 0 || l.x > this.mouseX + this.spread/2 + this.size*2){
          this.lines.splice(i,1);
        }
      }
    }
    draw(ctx){
      ctx.save();
      ctx.lineCap = 'round';
      this.lines.forEach(l => {
        const grad = ctx.createLinearGradient(l.x, l.y, l.x + l.length, l.y);
        grad.addColorStop(0, hexToRGBA(this.color, l.alpha));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.size * 0.2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 0.7;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x + l.length, l.y);
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  // 14. Aurora Wave
  class AuroraWaveEffect extends BaseEffect {
    constructor(){
      super();
      this.time = 0;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
      this.size = lightSize;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.spread = effectSpread;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX) * 0.25;
      this.mouseY += (mouse.y - this.mouseY) * 0.25;
      this.time += 0.02 * this.speed;
    }
    draw(ctx){
      ctx.save();
      const waves = 3;
      for(let i=0; i<waves; i++){
        const yOffset = this.mouseY + (Math.sin(this.time*2 + i*2) * this.spread/3);
        const amplitude = this.size * 0.7;
        ctx.beginPath();
        for(let x=0; x<width; x+=3){
          const y = yOffset + Math.sin(x * 0.02 + this.time*3 + i*5) * amplitude;
          if(x===0) ctx.moveTo(x,y);
          else ctx.lineTo(x,y);
        }
        const alpha = this.intensity * 0.25;
        ctx.strokeStyle = hexToRGBA(this.color, alpha);
        ctx.lineWidth = this.size * 0.15;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 1.6;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // 15. Spiral Glow
  class SpiralGlowEffect extends BaseEffect {
    constructor(){
      super();
      this.particles = [];
      this.maxParticles = 100;
      this.color = lightColor;
      this.speed = effectSpeed;
      this.size = lightSize;
      this.intensity = lightIntensity;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.angle = 0;
    }
    update() {
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      this.angle += 0.03 * this.speed;

      while(this.particles.length < this.maxParticles){
        this.particles.push({
          spirala: Math.random()*Math.PI*8,
          radius: Math.random()*this.size*2,
          speed: 0.03 + Math.random()*0.04,
          size: 1 + Math.random()*1,
          alpha: this.intensity
        });
      }

      this.particles.forEach(p => {
        p.spirala += p.speed * this.speed;
        p.alpha -= 0.002 * this.speed;
        if(p.alpha < 0) p.alpha = this.intensity;
      });
    }
    draw(ctx) {
      ctx.save();
      this.particles.forEach(p => {
        const x = this.mouseX + Math.cos(p.spirala) * p.radius;
        const y = this.mouseY + Math.sin(p.spirala) * p.radius;
        ctx.fillStyle = hexToRGBA(this.color, p.alpha);
        ctx.beginPath();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 0.6;
        ctx.arc(x, y, p.size, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
    }
    reset(){
      this.particles = [];
    }
  }

  // 16. Plasma Arcs
  class PlasmaArcsEffect extends BaseEffect {
    constructor(){
      super();
      this.arcs = [];
      this.maxArcs = 30;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.size = lightSize;
      this.speed = effectSpeed;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.spread = effectSpread;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      if(this.arcs.length < this.maxArcs){
        this.arcs.push({
          x: this.mouseX + (Math.random()-0.5)*this.spread,
          y: this.mouseY + (Math.random()-0.5)*this.spread,
          angle: Math.random()*Math.PI*2,
          radius: this.size * (0.6 + Math.random()),
          length: Math.random() * Math.PI*0.8 + Math.PI*0.4,
          rotationSpeed: 0.01 + Math.random()*0.04,
          alpha: this.intensity
        });
      }
      for(let i=this.arcs.length-1; i>=0; i--){
        const arc = this.arcs[i];
        arc.angle += arc.rotationSpeed * this.speed;
        arc.alpha -= 0.004 * this.speed;
        if(arc.alpha <= 0) this.arcs.splice(i,1);
      }
    }
    draw(ctx){
      ctx.save();
      ctx.lineWidth = this.size*0.15;
      ctx.strokeStyle = hexToRGBA(this.color, this.intensity);
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.size*0.5;
      this.arcs.forEach(arc=>{
        ctx.beginPath();
        ctx.globalAlpha = arc.alpha * this.intensity;
        ctx.arc(arc.x, arc.y, arc.radius, arc.angle, arc.angle + arc.length);
        ctx.stroke();
      });
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  // 17. Twinkle Stars
  class TwinkleStarsEffect extends BaseEffect {
    constructor(){
      super();
      this.stars = [];
      this.maxStars = 80;
      this.color = lightColor;
      this.size = lightSize;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.spread = effectSpread;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      while(this.stars.length < this.maxStars){
        this.stars.push({
          x: this.mouseX + (Math.random()-0.5)*this.spread,
          y: this.mouseY + (Math.random()-0.5)*this.spread,
          radius: 1 + Math.random()*this.size*0.3,
          alpha: 0.5 + Math.random()*0.5,
          flickerSpeed: 0.01 + Math.random()*0.05,
          flickerDir: Math.random() >0.5 ? 1 : -1
        });
      }
      this.stars.forEach(s=>{
        s.alpha += s.flickerSpeed * s.flickerDir * this.speed;
        if(s.alpha > 1) {
          s.alpha = 1;
          s.flickerDir = -1;
        }
        else if(s.alpha < 0.1){
          s.alpha = 0.1;
          s.flickerDir = 1;
        }
      });
    }
    draw(ctx){
      ctx.save();
      this.stars.forEach(s=>{
        ctx.fillStyle = hexToRGBA(this.color, s.alpha * this.intensity);
        ctx.beginPath();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size*0.8;
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
    }
    reset(){
      this.stars = [];
    }
  }

  // 18. Glowing Butterfly
  class GlowingButterflyEffect extends BaseEffect {
    constructor(){
      super();
      this.particles = [];
      this.maxParticles = 40;
      this.color = lightColor;
      this.size = lightSize;
      this.intensity = lightIntensity;
      this.speed = effectSpeed;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.spread = effectSpread;
      this.time = 0;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      this.time += 0.02 * this.speed;

      while(this.particles.length < this.maxParticles){
        this.particles.push({
          baseAngle: Math.random()*Math.PI*2,
          radius: this.size * (0.8 + Math.random()*1),
          size: this.size * (0.3 + Math.random()*0.7),
          alpha: this.intensity,
          wingPhase: Math.random()*Math.PI*2,
          x: 0,
          y: 0,
        });
      }

      this.particles.forEach(p=>{
        p.wingPhase += 0.06 * this.speed;
        p.alpha = this.intensity * (0.6 + 0.4*Math.sin(p.wingPhase * 3));
        p.x = this.mouseX + Math.cos(p.baseAngle + this.time)*p.radius + Math.sin(p.wingPhase)*p.size*0.5;
        p.y = this.mouseY + Math.sin(p.baseAngle + this.time)*p.radius;
      });
    }
    draw(ctx){
      ctx.save();
      this.particles.forEach(p=>{
        ctx.fillStyle = hexToRGBA(this.color, p.alpha);
        ctx.beginPath();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 0.9;
        // simplified glowing wing shape: ellipse with pulsation in wingPhase
        const wingSpread = p.size * (0.7 + 0.3 * Math.sin(p.wingPhase*5));
        ctx.ellipse(p.x, p.y, wingSpread*0.6, wingSpread*0.3, Math.sin(p.wingPhase), 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
    }
    reset(){
      this.particles = [];
    }
  }

  // 19. Ripple Circles
  class RippleCirclesEffect extends BaseEffect {
    constructor(){
      super();
      this.circles = [];
      this.maxCircles = 10;
      this.color = lightColor;
      this.intensity = lightIntensity;
      this.size = lightSize;
      this.speed = effectSpeed;
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      this.spread = effectSpread;
      this.cooldown = 0;
    }
    update(){
      this.mouseX += (mouse.x - this.mouseX)*0.3;
      this.mouseY += (mouse.y - this.mouseY)*0.3;
      this.cooldown -= 1;
      if(isMoving && this.cooldown <= 0){
        this.circles.push({
          x: this.mouseX + (Math.random()-0.5)*this.spread*0.3,
          y: this.mouseY + (Math.random()-0.5)*this.spread*0.3,
          radius: this.size * 0.5,
          maxRadius: this.size * 3,
          opacity: this.intensity,
          growth: 1.5*this.speed
        });
        this.cooldown = 25;
      }
      for(let i=this.circles.length-1; i>=0; i--){
        const c = this.circles[i];
        c.radius += c.growth;
        c.opacity -= 0.025 * this.speed;
        if(c.opacity <= 0) this.circles.splice(i,1);
      }
    }
    draw(ctx){
      ctx.save();
      this.circles.forEach(c=>{
        const grad = ctx.createRadialGradient(c.x, c.y, c.radius*0.2, c.x, c.y, c.radius);
        grad.addColorStop(0, hexToRGBA(this.color, c.opacity));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.size * 0.15;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI*2);
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  // All effects mapping
  const effectsMap = {
    waterLight: WaterLightEffect,
    glowingOrb: GlowingOrbEffect,
    ripple: RippleEffect,
    starTrail: StarTrailEffect,
    firefly: FireflyEffect,
    laser: LaserEffect,
    fireworks: FireworksEffect,
    neonPulse: NeonPulseEffect,
    cometTail: CometTailEffect,
    electricSparks: ElectricSparksEffect,
    galaxySwirl: GalaxySwirlEffect,
    bubbleRise: BubbleRiseEffect,
    laserSweep: LaserSweepEffect,
    auroraWave: AuroraWaveEffect,
    spiralGlow: SpiralGlowEffect,
    plasmaArcs: PlasmaArcsEffect,
    twinkleStars: TwinkleStarsEffect,
    glowingButterfly: GlowingButterflyEffect,
    rippleCircles: RippleCirclesEffect,
  };

  // Effect instance & switcher
  let currentEffect = null;
  function switchEffect(type){
    if(currentEffect) currentEffect.reset();
    const EffectClass = effectsMap[type] || WaterLightEffect;
    currentEffect = new EffectClass();
    currentEffect.setColor(lightColor);
    currentEffect.setSize(lightSize);
    currentEffect.setIntensity(lightIntensity);
    currentEffect.setSpeed(effectSpeed);
    currentEffect.setSpread(effectSpread);
  }

  // Resize canvas
  function resize(){
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width*dpr;
    canvas.height = height*dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr,dpr);
  }

  // Mouse & touch events
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isMoving = true;
  });
  window.addEventListener('touchmove', e=>{
    if(e.touches.length>0){
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      isMoving = true;
    }
  }, {passive:true});
  window.addEventListener('mouseout', ()=>isMoving = false);
  window.addEventListener('touchend', ()=>isMoving = false);

  // Controls events
  effectSelect.addEventListener('change', e=>{
    effectType = e.target.value;
    switchEffect(effectType);
  });
  colorPicker.addEventListener('input', e=>{
    lightColor = e.target.value;
    currentEffect.setColor(lightColor);
  });
  sizeSlider.addEventListener('input', e=>{
    lightSize = parseInt(e.target.value, 10) || 40;
    currentEffect.setSize(lightSize);
  });
  intensitySlider.addEventListener('input', e=>{
    lightIntensity = parseFloat(e.target.value) || 0.65;
    currentEffect.setIntensity(lightIntensity);
  });
  speedSlider.addEventListener('input', e=>{
    effectSpeed = parseFloat(e.target.value) || 1;
    currentEffect.setSpeed(effectSpeed);
  });
  spreadSlider.addEventListener('input', e=>{
    effectSpread = parseInt(e.target.value, 10) || 80;
    currentEffect.setSpread(effectSpread);
  });
  resetBtn.addEventListener('click', ()=>{
    colorPicker.value = '#40c4ff';
    sizeSlider.value = 40;
    intensitySlider.value = 0.65;
    speedSlider.value = 1;
    spreadSlider.value = 80;
    effectSelect.value = 'waterLight';
    effectType = 'waterLight';
    lightColor = '#40c4ff';
    lightSize = 40;
    lightIntensity = 0.65;
    effectSpeed = 1;
    effectSpread = 80;
    switchEffect(effectType);
  });

  // Animate loop
  function animate(){
    ctx.clearRect(0,0,width,height);
    if(currentEffect){
      currentEffect.update();
      currentEffect.draw(ctx);
    }
    requestAnimationFrame(animate);
  }

  // Initialize
  resize();
  switchEffect(effectType);
  animate();

})();