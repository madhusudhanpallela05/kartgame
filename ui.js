export class UI {
  constructor() {
    this.speedDisplay = document.getElementById('speedDisplay');
    this.lapTime = document.getElementById('lapTime');
    this.startTime = Date.now();
    
    // Ability UI elements
    this.boostAbility = document.getElementById('boostAbility');
    this.jumpAbility = document.getElementById('jumpAbility');
    this.shieldAbility = document.getElementById('shieldAbility');
    
    this.setupSpeedometer();
  }
  
  setupSpeedometer() {
    const canvas = document.getElementById('speedometer');
    canvas.width = 120;
    canvas.height = 120;
    this.ctx = canvas.getContext('2d');
    
    // Style the canvas
    canvas.style.position = 'absolute';
    canvas.style.bottom = '30px';
    canvas.style.right = '30px';
    canvas.style.border = '3px solid white';
    canvas.style.borderRadius = '50%';
    canvas.style.background = 'rgba(0,0,0,0.8)';
  }
  
  update(speed, abilities) {
    // Update speed display
    const mph = Math.round(speed * 2.237); // Convert to mph
    this.speedDisplay.textContent = mph;
    
    // Update lap time
    const elapsed = Date.now() - this.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    this.lapTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Update speedometer
    this.drawSpeedometer(speed);
    
    // Update ability indicators
    this.updateAbilityUI(abilities);
  }
  
  drawSpeedometer(speed) {
    const ctx = this.ctx;
    const centerX = 60;
    const centerY = 60;
    const radius = 45;
    
    // Clear canvas
    ctx.clearRect(0, 0, 120, 120);
    
    // Draw outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw speed marks
    for (let i = 0; i <= 12; i++) {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      const startX = centerX + Math.cos(angle) * (radius - 10);
      const startY = centerY + Math.sin(angle) * (radius - 10);
      const endX = centerX + Math.cos(angle) * (radius - 5);
      const endY = centerY + Math.sin(angle) * (radius - 5);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = i % 3 === 0 ? '#ffffff' : '#888888';
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.stroke();
    }
    
    // Draw speed needle
    const speedAngle = (speed / 25) * (3/4) * 2 * Math.PI - Math.PI / 2;
    const needleEndX = centerX + Math.cos(speedAngle) * (radius - 15);
    const needleEndY = centerY + Math.sin(speedAngle) * (radius - 15);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleEndX, needleEndY);
    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Draw speed text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    const mph = Math.round(speed * 2.237);
    ctx.fillText(mph.toString(), centerX, centerY + 25);
    ctx.font = '8px Arial';
    ctx.fillText('MPH', centerX, centerY + 35);
  }
  
  updateAbilityUI(abilities) {
    // Update boost indicator
    if (abilities.boost.active) {
      this.boostAbility.classList.add('active');
      this.boostAbility.textContent = 'BOOST ACTIVE!';
    } else if (abilities.boost.cooldown > 0) {
      this.boostAbility.classList.remove('active');
      this.boostAbility.textContent = `SHIFT - Boost (${Math.ceil(abilities.boost.cooldown)}s)`;
    } else {
      this.boostAbility.classList.remove('active');
      this.boostAbility.textContent = 'SHIFT - Speed Boost';
    }
    
    // Update jump indicator
    if (abilities.jump.cooldown > 0) {
      this.jumpAbility.textContent = `CTRL+SPACE - Jump (${Math.ceil(abilities.jump.cooldown)}s)`;
    } else {
      this.jumpAbility.textContent = 'CTRL+SPACE - Super Jump';
    }
    
    // Update shield indicator
    if (abilities.shield.active) {
      this.shieldAbility.classList.add('active');
      this.shieldAbility.textContent = 'SHIELD ACTIVE!';
    } else if (abilities.shield.cooldown > 0) {
      this.shieldAbility.classList.remove('active');
      this.shieldAbility.textContent = `E - Shield (${Math.ceil(abilities.shield.cooldown)}s)`;
    } else {
      this.shieldAbility.classList.remove('active');
      this.shieldAbility.textContent = 'E - Shield';
    }
  }
}