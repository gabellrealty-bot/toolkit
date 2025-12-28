 // ========================= CORE SETUP =========================
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const logEl = document.getElementById('log');
    const startWaveBtn = document.getElementById('startWaveBtn');
    const placeLucinaBtn = document.getElementById('placeLucinaBtn');
    const placeNeonBtn = document.getElementById('placeNeonBtn');
    const placeHelenaBtn = document.getElementById('placeHelenaBtn');
    const placeRosaBtn = document.getElementById('placeRosaBtn');
    const WIDTH = canvas.width, HEIGHT = canvas.height, TILE_SIZE = 50;
    function log(message) { logEl.textContent = message; }

    // ========================= GAME STATE =========================
    const gameState = {
      running: true, frame: 0,
      emotionalResonance: 120, oocyteCount: 0,
      fatigueLevel: 0, paradoxClarity: 0,
      towers: [], enemies: [], projectiles: [], npcs: [],
      placingTowerType: null,
      path: [
        { x: 40,  y: 260, zone: 'Entry' },
        { x: 160, y: 260, zone: 'Consent Bay' },
        { x: 260, y: 180, zone: 'Genome Lab' },
        { x: 400, y: 180, zone: 'Genome Lab' },
        { x: 520, y: 260, zone: 'Drift Chamber' },
        { x: 650, y: 340, zone: 'Navigation Dome' },
        { x: 830, y: 340, zone: 'Arden Core' }
      ],
      waveNumber: 0
    };
    function snapToGrid(x,y){return{ x:Math.floor(x/TILE_SIZE)*TILE_SIZE+TILE_SIZE/2, y:Math.floor(y/TILE_SIZE)*TILE_SIZE+TILE_SIZE/2};}
    function distance(a,b){const dx=a.x-b.x,dy=a.y-b.y;return Math.sqrt(dx*dx+dy*dy);}

    
	// ========================= TOWER CLASS =========================
class Tower {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.range = 100;
    this.fireRate = 1;
    this.cooldown = 0;
  }

  update(dt) {
    this.cooldown -= dt;
    if (this.cooldown <= 0) {
      const target = gameState.enemies.find(e => distance(this, e) < this.range);
      if (target) {
        gameState.projectiles.push(new Projectile(this.x, this.y, target));
        this.cooldown = 1 / this.fireRate;
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);

    // Color by tower type
    switch (this.type) {
      case 'Lucina': ctx.fillStyle = '#66ccff'; break;   // light blue
      case 'Neon': ctx.fillStyle = '#ff33cc'; break;     // magenta
      case 'Helena': ctx.fillStyle = '#ffff66'; break;   // yellow
      case 'Rosa': ctx.fillStyle = '#ff6666'; break;     // red
      case 'Maria': ctx.fillStyle = '#66ff66'; break;    // green
      case 'Sieta': ctx.fillStyle = '#9933ff'; break;    // purple
      case 'Bessy': ctx.fillStyle = '#ff9933'; break;    // orange
      default: ctx.fillStyle = '#cccccc';                // grey fallback
    }

    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }
}

	
	
	
	// ========================= CLASSES =========================
    class Enemy {
      constructor(path, speed, maxHp, type = 'Entropy Fragment') {
        this.path = path; this.speed = speed; this.maxHp = maxHp;
        this.hp = maxHp; this.type = type;
        this.segmentIndex = 0; this.pos = { x: path[0].x, y: path[0].y };
        this.radius = 14; this.reachedEnd = false;
      }
      update(dt) {
        if (this.reachedEnd) return;
        const target = this.path[this.segmentIndex + 1];
        if (!target) { this.reachedEnd = true; gameState.fatigueLevel += 7; log('Arden Core grazed by intrusion: fatigue spike logged.'); return; }
        const dx = target.x - this.pos.x, dy = target.y - this.pos.y;
        const len = Math.sqrt(dx*dx+dy*dy);
        if (len < 1) { this.segmentIndex++; return; }
        this.pos.x += (dx/len)*this.speed*dt; this.pos.y += (dy/len)*this.speed*dt;
      }
      draw(ctx) {
        ctx.save(); ctx.translate(this.pos.x,this.pos.y);
        ctx.beginPath(); ctx.fillStyle='#b3447a'; ctx.arc(0,0,this.radius,0,Math.PI*2); ctx.fill();
        const hpRatio=this.hp/this.maxHp;
        ctx.fillStyle='#222'; ctx.fillRect(-16,-22,32,4);
        ctx.fillStyle='#6cf'; ctx.fillRect(-16,-22,32*hpRatio,4);
        ctx.restore();
      }
    }

    class Tower {
      constructor(x,y,type='Lucina'){ this.pos={x,y}; this.type=type;
        if(type==='Lucina'){this.range=150;this.fireRate=1.0;}
        else if(type==='Neon'){this.range=130;this.fireRate=1.4;}
        else if(type==='Helena'){this.range=120;this.fireRate=0.6;}
        else if(type==='Rosa'){this.range=140;this.fireRate=0.8;}
        else{this.range=120;this.fireRate=1.0;}
        this.cooldown=0;
      }
      update(dt){ this.cooldown-=dt;
        if(this.cooldown<=0){
          const target=gameState.enemies.find(e=>!e.reachedEnd&&distance(e.pos,this.pos)<=this.range);
          if(target){ this.shoot(target); this.cooldown=1/this.fireRate; }
        }
      }
      shoot(target){
        let color='#fff',effect='damage';
        if(this.type==='Lucina'){color='#88aaff';effect='paradox';log('Lucina engages: Paradox Collapse ripples.');}
        else if(this.type==='Neon'){color='#4ffae3';effect='stun';log('Neon sings: Telepathic stun echoes.');}
        else if(this.type==='Helena'){color='#ffcc66';effect='gforce';log('Helena fires: G-force shockwave.');}
        else if(this.type==='Rosa'){color='#a0ff7a';effect='entropy';log('Rosa responds: Entropy freeze field.');}
        gameState.projectiles.push(new Projectile(this.pos.x,this.pos.y,target,color,effect));
      }
      draw(ctx){
        ctx.save(); ctx.translate(this.pos.x,this.pos.y);
        ctx.beginPath(); ctx.strokeStyle='rgba(120,180,255,0.12)'; ctx.arc(0,0,this.range,0,Math.PI*2); ctx.stroke();
        ctx.beginPath();
        if(this.type==='Lucina')ctx.fillStyle='#88aaff';
        else if(this.type==='Neon')ctx.fillStyle='#4ffae3';
        else if(this.type==='Helena')ctx.fillStyle='#ffcc66';
        else if(this.type==='Rosa')ctx.fillStyle='#a0ff7a';
        else ctx.fillStyle='#ccc';
        ctx.arc(0,0,12,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle='#050608'; ctx.arc(0,0,6,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }

      class Projectile {
      constructor(x, y, target, color = '#fff', effect = 'damage') {
        this.pos = { x, y };
        this.target = target;
        this.speed = 260;
        this.radius = 4;
        this.color = color;
        this.effect = effect;
        this.dead = false;
      }
      update(dt) {
        if (!this.target || this.target.reachedEnd || this.target.hp <= 0) {
          this.dead = true;
          return;
        }
        const dx = this.target.pos.x - this.pos.x;
        const dy = this.target.pos.y - this.pos.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len < this.radius + this.target.radius) {
          this.onHit();
          this.dead = true;
          return;
        }
        this.pos.x += (dx/len)*this.speed*dt;
        this.pos.y += (dy/len)*this.speed*dt;
      }
      onHit() {
        if (this.effect === 'paradox') {
          this.target.hp -= 28;
          gameState.paradoxClarity += 1;
        } else if (this.effect === 'stun') {
          this.target.hp -= 10;
          this.target.speed *= 0.7;
          gameState.emotionalResonance += 1;
        } else if (this.effect === 'gforce') {
          this.target.hp -= 15;
          gameState.emotionalResonance -= 1;
          gameState.fatigueLevel += 0.5;
          gameState.enemies.forEach(e => {
            if (!e.reachedEnd && distance(e.pos, this.target.pos) < 90) {
              e.hp -= 8;
            }
          });
        } else if (this.effect === 'entropy') {
          this.target.hp -= 12;
          this.target.speed *= 0.8;
          gameState.fatigueLevel = Math.max(0, gameState.fatigueLevel - 1);
        } else if (this.effect === 'dimensional') {
          this.target.hp -= 35;
          gameState.paradoxClarity += 2;
        } else if (this.effect === 'drone') {
          this.target.hp -= 8;
          gameState.emotionalResonance += 0.5;
        } else {
          this.target.hp -= 15;
        }
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ========================= INPUT HANDLERS =========================
    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!gameState.placingTowerType) return;
      const snapped = snapToGrid(x, y);
      let newTower;
      if (gameState.placingTowerType === 'Sieta') newTower = new SietaTower(snapped.x, snapped.y);
      else if (gameState.placingTowerType === 'Bessy') newTower = new BessyTower(snapped.x, snapped.y);
      else newTower = new Tower(snapped.x, snapped.y, gameState.placingTowerType);
      gameState.towers.push(newTower);
      log(`${gameState.placingTowerType} installed at node (${snapped.x}, ${snapped.y}).`);
      gameState.emotionalResonance -= 8;
      gameState.placingTowerType = null;
    });
    placeLucinaBtn.addEventListener('click',()=>{gameState.placingTowerType='Lucina';log('Placement mode: Lucina.');});
    placeNeonBtn.addEventListener('click',()=>{gameState.placingTowerType='Neon';log('Placement mode: Neon.');});
    placeHelenaBtn.addEventListener('click',()=>{gameState.placingTowerType='Helena';log('Placement mode: Helena.');});
    placeRosaBtn.addEventListener('click',()=>{gameState.placingTowerType='Rosa';log('Placement mode: Rosa.');});
    startWaveBtn.addEventListener('click',()=>{startWave();});

    // ========================= WAVE LOGIC =========================
    function startWave() {
      gameState.waveNumber++;
      const level = levels[gameState.waveNumber % levels.length];
      log(`Level ${gameState.waveNumber}: ${level.name}. Unlocks: ${level.unlocks.join(", ")}`);
      const count = 3 + gameState.waveNumber;
      const baseSpeed = 40 + gameState.waveNumber * 2;
      const baseHp = 60 + gameState.waveNumber * 10;
      for (let i=0;i<count;i++) {
        setTimeout(()=>{gameState.enemies.push(new Enemy(gameState.path, baseSpeed, baseHp, level.enemyType));}, i*900);
      }
      if (level.unlocks.includes("Rosa") || level.unlocks.includes("Maria")) unlockNPCs();
    }

    // ========================= RENDERING =========================
    function drawGrid(){ctx.save();ctx.strokeStyle='rgba(255,255,255,0.04)';for(let x=0;x<WIDTH;x+=TILE_SIZE){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,HEIGHT);ctx.stroke();}for(let y=0;y<HEIGHT;y+=TILE_SIZE){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WIDTH,y);ctx.stroke();}ctx.restore();}
    function drawPath(){ctx.save();ctx.strokeStyle='rgba(180,110,255,0.45)';ctx.lineWidth=16;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(gameState.path[0].x,gameState.path[0].y);for(let i=1;i<gameState.path.length;i++){ctx.lineTo(gameState.path[i].x,gameState.path[i].y);}ctx.stroke();ctx.font='11px system-ui';ctx.fillStyle='rgba(240,230,210,0.9)';gameState.path.forEach(p=>{if(p.zone)ctx.fillText(p.zone,p.x-30,p.y-20);});ctx.restore();}
    function drawHUD(){ctx.save();ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,WIDTH,44);ctx.fillStyle='#f0e6d2';ctx.font='12px system-ui';ctx.fillText(`Wave: ${gameState.waveNumber}`,10,16);ctx.fillText(`Resonance: ${gameState.emotionalResonance}`,10,30);ctx.fillText(`Fatigue: ${gameState.fatigueLevel.toFixed(1)}`,260,16);ctx.fillText(`Paradox: ${gameState.paradoxClarity}`,260,30);ctx.restore();}

    // ========================= MAIN LOOP =========================
    let lastTime=performance.now();
    function gameLoop(ts){const dt=(ts-lastTime)/1000;lastTime=ts;gameState.frame++;update(dt);render();if(gameState.running)requestAnimationFrame(gameLoop);}
    function update(dt){gameState.enemies.forEach(e=>e.update(dt));gameState.enemies=gameState.enemies.filter(e=>e.hp>0&&!e.reachedEnd);gameState.towers.forEach(t=>t.update(dt));gameState.projectiles.forEach(p=>p.update(dt));gameState.projectiles=gameState.projectiles.filter(p=>!p.dead);if(gameState.npcs){gameState.npcs.forEach(n=>n.update(dt));}gameState.fatigueLevel=Math.max(0,gameState.fatigueLevel-dt*0.15);}
    function render(){ctx.clearRect(0,0,WIDTH,HEIGHT);drawGrid();drawPath();gameState.towers.forEach(t=>t.draw(ctx));gameState.enemies.forEach(e=>e.draw(ctx));gameState.projectiles.forEach(p=>p.draw(ctx));if(gameState.npcs){gameState.npcs.forEach(n=>n.draw(ctx));}drawHUD();}
    requestAnimationFrame(gameLoop);

    // ========================= LEVELS =========================
    const levels = [
      { name: "Consent Bay Breach Test", unlocks: ["Lucina"], enemyType: "Entropy Fragment" },
      { name: "Genome Lab Distortion", unlocks: ["Neon"], enemyType: "Paradox Beast" },
      { name: "Drift Chamber Echo Surge", unlocks: ["Bessy"], enemyType: "Rogue Archetype" },
      { name: "Navigation Dome Paradox Bloom", unlocks: ["Rosa","Maria"], enemyType: "Mixed" },
      { name: "Arden Core Threshold", unlocks: ["Sieta"], enemyType: "Entropy Leviathan" }
    ];

    // ========================= NEW TOWERS =========================
    class SietaTower extends Tower {
      constructor(x,y){ super(x,y,"Sieta"); this.range=200; this.fireRate=0.5; }
      shoot(target){
        gameState.projectiles.push(new Projectile(this.pos.x,this.pos.y,target,"#ff66ff","dimensional"));
        log("Sieta fires: Dimensional Slice pierces corridors.");
      }
    }

    class BessyTower extends Tower {
      constructor(x,y){ super(x,y,"Bessy"); this.range=100; this.fireRate=0.8; }
      shoot(target){
        gameState.projectiles.push(new Projectile(this.pos.x,this.pos.y,target,"#66ffaa","drone"));
        log("Bessy deploys: Fabrication drone assists.");
      }
    }

// ========================= INPUT HANDLERS =========================
bessyAbilityBtn.addEventListener('click', () => {
  canvas.addEventListener('click', function handler(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spawn Bessy tower at click
    const bessy = new Tower(x, y, 'Bessy');
    gameState.towers.push(bessy);
    log('Bessy surges: Fabrication node deployed.');

    // Ability effect: damage all enemies in range
    gameState.enemies.forEach(enemy => {
      if (distance(bessy, enemy) < bessy.range) {
        enemy.hp -= 30; // fabrication surge damage
      }
    });

    // Remove this click handler after one use
    canvas.removeEventListener('click', handler);
  });
});

    // ========================= SPECIAL ABILITIES =========================
    document.getElementById("sietaAbilityBtn").addEventListener("click",()=>{
      log("Sieta’s Dimensional Fold activated!");
      gameState.enemies.forEach(e=>{
        e.segmentIndex=0; e.pos={...gameState.path[0]}; e.speed*=0.5;
      });
    });

    document.getElementById("bessyAbilityBtn").addEventListener("click",()=>{
      log("Bessy’s Fabrication Surge activated!");
      gameState.fatigueLevel=Math.max(0,gameState.fatigueLevel-5);
      gameState.emotionalResonance+=20;
      for(let i=0;i<3;i++){ gameState.towers.push(new BessyTower(100+50*i,400)); }
    });

    // ========================= NPC DEFENDERS =========================
    class NPC {
      constructor(name,color,path){
        this.name=name; this.color=color; this.path=path;
        this.segmentIndex=0; this.pos={...path[0]}; this.speed=30;
      }
      update(dt){
        const target=this.path[this.segmentIndex+1]; if(!target) return;
        const dx=target.x-this.pos.x, dy=target.y-this.pos.y;
        const len=Math.sqrt(dx*dx+dy*dy);
        if(len<1){this.segmentIndex++;return;}
        this.pos.x+=(dx/len)*this.speed*dt; this.pos.y+=(dy/len)*this.speed*dt;
        if(this.name==="Rosa"){
          gameState.enemies.forEach(e=>{ if(distance(e.pos,this.pos)<80) e.speed*=0.95; });
        }
        if(this.name==="Maria"){
          gameState.towers.forEach(t=>{ if(distance(t.pos,this.pos)<80) gameState.paradoxClarity+=0.01; });
        }
      }
      draw(ctx){
        ctx.save(); ctx.translate(this.pos.x,this.pos.y);
        ctx.fillStyle=this.color; ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill();
        ctx.fillStyle="#fff"; ctx.fillText(this.name,-15,-15);
        ctx.restore();
      }
    }
    function unlockNPCs(){
      gameState.npcs=[
        new NPC("Rosa","#a0ff7a",gameState.path),
        new NPC("Maria","#ff99cc",gameState.path.slice().reverse())
      ];
    }

const bg = new Image();
bg.src = 'siteplan.png';

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw background map first
  ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);

  // Then overlay game elements
  drawGrid();
  drawPath();
  gameState.towers.forEach(t => t.draw(ctx));
  gameState.enemies.forEach(e => e.draw(ctx));
  gameState.projectiles.forEach(p => p.draw(ctx));
  if (gameState.npcs) gameState.npcs.forEach(n => n.draw(ctx));
  drawHUD();
}
