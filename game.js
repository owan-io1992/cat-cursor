// 游戏状态
let gameState = {
    character: null,
    screen: 'character-creation',
    startTime: null,
    destructionProgress: 0,
    health: 100
};

// 品种数据（基于真实猫咪性格特征）
const breedData = {
    persian: {
        name: '波斯貓',
        personality: '优雅、冷静、高傲',
        baseStats: { power: 3, speed: 2, defense: 4 }
    },
    siamese: {
        name: '暹羅貓',
        personality: '活泼、聪明、好动',
        baseStats: { power: 4, speed: 5, defense: 2 }
    },
    british: {
        name: '英國短毛貓',
        personality: '温和、稳重、友善',
        baseStats: { power: 3, speed: 3, defense: 5 }
    },
    maine: {
        name: '緬因貓',
        personality: '强壮、独立、勇敢',
        baseStats: { power: 5, speed: 3, defense: 4 }
    }
};

// 毛色数据（基于毛色与性格的关联）
const colorData = {
    orange: {
        name: '橘色',
        personality: '贪吃、友好、懒散',
        traits: ['大胃王', '热情', '贪玩']
    },
    black: {
        name: '黑色',
        personality: '神秘、独立、聪明',
        traits: ['夜视', '敏捷', '神秘']
    },
    white: {
        name: '白色',
        personality: '优雅、纯洁、高贵',
        traits: ['优雅', '治愈', '魅力']
    },
    gray: {
        name: '灰色',
        personality: '冷静、稳重、智慧',
        traits: ['智慧', '冷静', '策略']
    }
};

// 技能池
const skillPool = {
    // 攻击类技能
    attack: [
        { name: '貓爪連擊', type: 'attack', damage: 15, cooldown: 1000, description: '快速揮出多段爪擊' },
        { name: '尾巴鞭擊', type: 'attack', damage: 20, cooldown: 1500, description: '用尾巴進行強力攻擊' },
        { name: '貓咪飛踢', type: 'attack', damage: 25, cooldown: 2000, description: '跳躍後進行飛踢攻擊' },
        { name: '撕咬', type: 'attack', damage: 30, cooldown: 2500, description: '用尖牙進行致命撕咬' },
        { name: '旋風爪', type: 'attack', damage: 18, cooldown: 1200, description: '旋轉身體進行範圍攻擊' }
    ],
    // 特殊类技能
    special: [
        { name: '貓叫聲波', type: 'special', effect: 'stun', cooldown: 3000, description: '發出超聲波震暈敵人' },
        { name: '隱身術', type: 'special', effect: 'invisible', cooldown: 5000, description: '短暫隱身躲避攻擊' },
        { name: '治癒舔舐', type: 'special', effect: 'heal', value: 20, cooldown: 4000, description: '舔舐傷口恢復生命' },
        { name: '貓咪衝刺', type: 'special', effect: 'dash', cooldown: 2000, description: '快速向前衝刺' },
        { name: '九條命', type: 'special', effect: 'revive', cooldown: 10000, description: '受到致命傷害時復活' }
    ],
    // 破坏类技能
    destruction: [
        { name: '地震爪', type: 'destruction', damage: 40, cooldown: 3000, description: '重擊地面造成地震' },
        { name: '破壞光線', type: 'destruction', damage: 35, cooldown: 2500, description: '發射破壞性能量光線' },
        { name: '爆炸貓球', type: 'destruction', damage: 45, cooldown: 3500, description: '滾成球狀造成爆炸' },
        { name: '毀滅之爪', type: 'destruction', damage: 50, cooldown: 4000, description: '釋放毀滅性的爪擊' },
        { name: '終極破壞', type: 'destruction', damage: 60, cooldown: 5000, description: '最強破壞技能' }
    ]
};

let recordsCache = [];
let controlsPanelTimer = null;
const uiElements = {
    skillHotbar: null,
    controlsPanel: null,
    controlsToggle: null
};

// 根据品种和毛色生成技能
function generateSkills(breed, color) {
    const skills = [];
    const breedInfo = breedData[breed];
    const colorInfo = colorData[color];
    
    // 根据品种性格选择技能类型偏好
    let typePreferences = [];
    if (breedInfo.personality.includes('优雅') || breedInfo.personality.includes('冷静')) {
        typePreferences = ['special', 'destruction', 'attack'];
    } else if (breedInfo.personality.includes('活泼') || breedInfo.personality.includes('好动')) {
        typePreferences = ['attack', 'special', 'destruction'];
    } else if (breedInfo.personality.includes('强壮') || breedInfo.personality.includes('勇敢')) {
        typePreferences = ['attack', 'destruction', 'special'];
    } else {
        typePreferences = ['attack', 'special', 'destruction'];
    }
    
    // 根据毛色特质调整优先级
    if (colorInfo.traits.includes('敏捷') || colorInfo.traits.includes('夜视')) {
        typePreferences = ['attack', 'special', 'destruction'];
    } else if (colorInfo.traits.includes('智慧') || colorInfo.traits.includes('策略')) {
        typePreferences = ['special', 'destruction', 'attack'];
    } else if (colorInfo.traits.includes('治愈') || colorInfo.traits.includes('魅力')) {
        typePreferences = ['special', 'attack', 'destruction'];
    }
    
    const usedSkills = new Set();
    const selectedTypes = new Set();
    
    // 确保选择3种不同的技能，尽量覆盖不同类型
    for (let i = 0; i < 3; i++) {
        let type = typePreferences[i % typePreferences.length];
        
        // 如果这个类型已经选过，尝试其他类型
        if (selectedTypes.has(type) && selectedTypes.size < 3) {
            for (const prefType of typePreferences) {
                if (!selectedTypes.has(prefType)) {
                    type = prefType;
                    break;
                }
            }
        }
        
        const availableSkills = skillPool[type].filter(s => !usedSkills.has(s.name));
        if (availableSkills.length > 0) {
            const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
            skills.push(skill);
            usedSkills.add(skill.name);
            selectedTypes.add(type);
        } else {
            // 如果当前类型没有可用技能，从其他类型选择
            for (const fallbackType of ['attack', 'special', 'destruction']) {
                const fallbackSkills = skillPool[fallbackType].filter(s => !usedSkills.has(s.name));
                if (fallbackSkills.length > 0) {
                    const skill = fallbackSkills[Math.floor(Math.random() * fallbackSkills.length)];
                    skills.push(skill);
                    usedSkills.add(skill.name);
                    selectedTypes.add(fallbackType);
                    break;
                }
            }
        }
    }
    
    return skills;
}

function renderSkillHotbar(skills = []) {
    if (!uiElements.skillHotbar) return;
    uiElements.skillHotbar.innerHTML = skills.map((skill, index) => `
        <div class="skill-slot" data-skill-slot="${index}">
            <div class="skill-cooldown"></div>
            <div class="skill-key">[${index + 1}]</div>
            <div class="skill-name">${skill.name}</div>
            <div class="skill-desc">${skill.description}</div>
        </div>
    `).join('');
}

function updateSkillHotbar(player) {
    if (!player || !uiElements.skillHotbar) return;
    player.skills.forEach((skill, index) => {
        const slot = uiElements.skillHotbar.querySelector(`[data-skill-slot="${index}"]`);
        if (!slot) return;
        const cooldownFill = slot.querySelector('.skill-cooldown');
        const remaining = Math.max(0, player.skillCooldowns[index] || 0);
        const ratio = skill.cooldown ? (remaining / skill.cooldown) : 0;
        cooldownFill.style.height = `${Math.min(100, ratio * 100)}%`;
        slot.classList.toggle('cooldown', remaining > 0);
    });
}

function showControlsPanel(autoHide = false) {
    if (!uiElements.controlsPanel || !uiElements.controlsToggle) return;
    uiElements.controlsPanel.classList.remove('hidden');
    uiElements.controlsToggle.setAttribute('aria-expanded', 'true');
    if (controlsPanelTimer) {
        clearTimeout(controlsPanelTimer);
    }
    if (autoHide) {
        controlsPanelTimer = setTimeout(() => {
            hideControlsPanel();
        }, 5000);
    }
}

function hideControlsPanel() {
    if (!uiElements.controlsPanel || !uiElements.controlsToggle) return;
    uiElements.controlsPanel.classList.add('hidden');
    uiElements.controlsToggle.setAttribute('aria-expanded', 'false');
}

function toggleControlsPanel() {
    if (!uiElements.controlsPanel) return;
    const isHidden = uiElements.controlsPanel.classList.contains('hidden');
    if (isHidden) {
        showControlsPanel();
    } else {
        hideControlsPanel();
    }
}

// 初始化角色创建界面
function initCharacterCreation() {
    const breedOptions = document.querySelectorAll('.breed-option');
    const colorOptions = document.querySelectorAll('.color-option');
    const startBtn = document.getElementById('start-game-btn');
    
    let selectedBreed = null;
    let selectedColor = null;
    
    breedOptions.forEach(option => {
        option.addEventListener('click', () => {
            breedOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedBreed = option.dataset.breed;
            updateSkillsPreview();
        });
    });
    
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedColor = option.dataset.color;
            updateSkillsPreview();
        });
    });
    
    function updateSkillsPreview() {
        if (selectedBreed && selectedColor) {
            const skills = generateSkills(selectedBreed, selectedColor);
            const skillsList = document.getElementById('skills-list');
            const stats = breedData[selectedBreed].baseStats;
            const typeLabels = { attack: '攻擊', special: '特殊', destruction: '破壞' };
            const statsHtml = `
                <div class="stats-badge">力量 ${stats.power}</div>
                <div class="stats-badge">速度 ${stats.speed}</div>
                <div class="stats-badge">防禦 ${stats.defense}</div>
            `;
            const skillsHtml = skills.map(skill => 
                `<div class="skill-item">
                    <strong>${skill.name}</strong><br>
                    <small>${typeLabels[skill.type] || skill.type}</small><br>
                    <small>${skill.description}</small>
                </div>`
            ).join('');
            skillsList.innerHTML = statsHtml + skillsHtml;
            
            startBtn.disabled = false;
            gameState.character = {
                breed: selectedBreed,
                color: selectedColor,
                skills: skills,
                stats: breedData[selectedBreed].baseStats
            };
            renderSkillHotbar(skills);
        } else {
            startBtn.disabled = true;
        }
    }
    
    startBtn.addEventListener('click', () => {
        if (gameState.character) {
            switchScreen('game-screen');
            initGame();
            renderSkillHotbar(gameState.character.skills);
            showControlsPanel(true);
        }
    });
}

// 切换屏幕
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    gameState.screen = screenId;
    if (screenId !== 'game-screen') {
        hideControlsPanel();
    }
}

// 游戏主类
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 600;
        
        this.camera = { x: 0, y: 0 };
        this.player = null;
        this.entities = [];
        this.terrain = [];
        this.particles = [];
        this.keys = {};
        
        this.lastTime = 0;
        this.destructionTarget = 0; // 将在 generateWorld 后计算
        this.destroyedCount = 0;
        
        this.setupEventListeners();
        this.generateWorld();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    generateWorld() {
        // 创建玩家
        this.player = new Player(100, 400, gameState.character);
        
        // 生成地形
        this.terrain = [];
        for (let i = 0; i < 50; i++) {
            const x = i * 200;
            const y = 450 + Math.sin(i * 0.3) * 50;
            this.terrain.push(new Terrain(x, y, 200, 150, 'ground'));
        }
        
        // 添加建筑物
        const buildings = [
            { x: 500, y: 300, w: 150, h: 150, type: 'house' },
            { x: 800, y: 250, w: 200, h: 200, type: 'tower' },
            { x: 1200, y: 350, w: 180, h: 100, type: 'house' },
            { x: 1600, y: 200, w: 250, h: 250, type: 'skyscraper' },
            { x: 2000, y: 300, w: 120, h: 150, type: 'house' },
            { x: 2400, y: 280, w: 300, h: 170, type: 'castle' },
            { x: 2800, y: 320, w: 160, h: 130, type: 'house' },
            { x: 3200, y: 250, w: 220, h: 200, type: 'tower' },
            { x: 3600, y: 300, w: 140, h: 150, type: 'house' },
            { x: 4000, y: 180, w: 280, h: 270, type: 'skyscraper' }
        ];
        
        buildings.forEach(b => {
            this.terrain.push(new Terrain(b.x, b.y, b.w, b.h, b.type));
        });
        
        // 生成生物
        this.entities = [];
        const creatures = [
            { x: 600, type: 'bird' },
            { x: 900, type: 'dog' },
            { x: 1300, type: 'bird' },
            { x: 1700, type: 'rabbit' },
            { x: 2100, type: 'bird' },
            { x: 2500, type: 'dog' },
            { x: 2900, type: 'rabbit' },
            { x: 3300, type: 'bird' },
            { x: 3700, type: 'squirrel' },
            { x: 4100, type: 'dog' }
        ];
        
        creatures.forEach(c => {
            this.entities.push(new Creature(c.x, 400, c.type));
        });
        
        // 计算需要破坏的目标总数（不包括地面）
        this.destructionTarget = this.terrain.filter(t => t.type !== 'ground').length + this.entities.length;
    }
    
    update(deltaTime) {
        // 更新玩家
        this.player.update(deltaTime, this.keys, this.terrain, this.entities);
        
        // 更新实体
        this.entities.forEach(entity => {
            entity.update(deltaTime, this.player);
        });
        
        // 更新粒子
        this.particles.forEach((particle, index) => {
            particle.update(deltaTime);
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // 检查碰撞和破坏
        this.checkDestruction();
        
        // 更新相机
        this.camera.x = this.player.x - this.canvas.width / 3;
        if (this.camera.x < 0) this.camera.x = 0;
        
        // 更新UI
        this.updateUI();
        
        // 检查胜利条件
        if (this.destroyedCount >= this.destructionTarget) {
            this.endGame();
        }
    }
    
    checkDestruction() {
        // 检查玩家攻击与地形/实体的碰撞
        if (this.player.attacking) {
            const attackBox = this.player.getAttackBox();
            
            // 检查地形
            this.terrain.forEach((terrain, index) => {
                if (terrain.type !== 'ground' && !terrain.destroyed) {
                    if (this.isColliding(attackBox, terrain)) {
                        terrain.takeDamage(this.player.attackDamage);
                        if (terrain.destroyed) {
                            this.destroyedCount++;
                            this.createDestructionParticles(
                                terrain.x + terrain.w / 2,
                                terrain.y + terrain.h / 2,
                                terrain.getParticleColor()
                            );
                        }
                    }
                }
            });
            
            // 检查生物
            this.entities.forEach((entity, index) => {
                if (!entity.destroyed) {
                    if (this.isColliding(attackBox, entity)) {
                        entity.takeDamage(this.player.attackDamage);
                        if (entity.destroyed) {
                            this.destroyedCount++;
                            this.createDestructionParticles(entity.x, entity.y, entity.getParticleColor());
                        }
                    }
                }
            });
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.w &&
               rect1.x + rect1.w > rect2.x &&
               rect1.y < rect2.y + rect2.h &&
               rect1.y + rect1.h > rect2.y;
    }
    
    createDestructionParticles(x, y, color = '255, 107, 107') {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    updateUI() {
        const destructionPercent = Math.floor((this.destroyedCount / this.destructionTarget) * 100);
        document.getElementById('destruction-percent').textContent = destructionPercent + '%';
        document.getElementById('destruction-fill').style.width = destructionPercent + '%';
        
        const healthPercent = gameState.health;
        document.getElementById('health-fill').style.width = healthPercent + '%';
        
        if (gameState.startTime) {
            const elapsed = Date.now() - gameState.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('time-display').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        updateSkillHotbar(this.player);
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 应用相机变换
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // 绘制地形
        this.terrain.forEach(terrain => {
            if (!terrain.destroyed) {
                terrain.render(this.ctx);
            }
        });
        
        // 绘制实体
        this.entities.forEach(entity => {
            if (!entity.destroyed) {
                entity.render(this.ctx);
            }
        });
        
        // 绘制玩家
        this.player.render(this.ctx);
        
        // 绘制粒子
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // 简单的背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.5, '#98d8c8');
        gradient.addColorStop(1, '#7fb069');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 云朵
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 5; i++) {
            const x = (this.camera.x * 0.2 + i * 300) % (this.canvas.width + 200) - 100;
            const y = 50 + i * 30;
            this.drawCloud(x, y);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y, 30, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    endGame() {
        const elapsed = Date.now() - gameState.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('final-time').textContent = timeString;
        
        // 保存记录
        saveRecord(timeString, gameState.character);
        
        switchScreen('game-over');
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        if (gameState.screen === 'game-screen') {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
}

// 玩家类
class Player {
    constructor(x, y, character) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.w = 40;
        this.h = 40;
        this.speed = 3 + (character.stats.speed || 0);
        this.jumpPower = -12;
        this.onGround = false;
        this.facing = 1; // 1 = right, -1 = left
        
        this.character = character;
        this.attacking = false;
        this.attackDamage = 20 + (character.stats.power || 0) * 5;
        this.attackCooldown = 0;
        this.skills = character.skills;
        this.skillCooldowns = {};
        
        this.animFrame = 0;
        this.animTimer = 0;
    }
    
    update(deltaTime, keys, terrain, entities) {
        // 水平移动
        this.vx = 0;
        if (keys['a'] || keys['arrowleft']) {
            this.vx = -this.speed;
            this.facing = -1;
        }
        if (keys['d'] || keys['arrowright']) {
            this.vx = this.speed;
            this.facing = 1;
        }
        
        // 跳跃
        if ((keys['w'] || keys['arrowup'] || keys[' ']) && this.onGround) {
            this.vy = this.jumpPower;
            this.onGround = false;
        }
        
        // 攻击
        if (keys['j'] && this.attackCooldown <= 0) {
            this.attacking = true;
            this.attackCooldown = 500;
            setTimeout(() => { this.attacking = false; }, 200);
        }
        
        // 技能
        if (keys['1'] && this.skills[0] && (!this.skillCooldowns[0] || this.skillCooldowns[0] <= 0)) {
            this.useSkill(0);
        }
        if (keys['2'] && this.skills[1] && (!this.skillCooldowns[1] || this.skillCooldowns[1] <= 0)) {
            this.useSkill(1);
        }
        if (keys['3'] && this.skills[2] && (!this.skillCooldowns[2] || this.skillCooldowns[2] <= 0)) {
            this.useSkill(2);
        }
        
        // 更新冷却
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        Object.keys(this.skillCooldowns).forEach(key => {
            if (this.skillCooldowns[key] > 0) {
                this.skillCooldowns[key] -= deltaTime;
            }
        });
        
        // 重力
        this.vy += 0.5;
        if (this.vy > 15) this.vy = 15;
        
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;
        
        // 碰撞检测
        this.onGround = false;
        terrain.forEach(t => {
            if (this.isColliding(t)) {
                if (this.vy > 0) {
                    this.y = t.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        });
        
        // 动画
        this.animTimer += deltaTime;
        if (this.animTimer > 200) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }
    }
    
    useSkill(skillIndex) {
        const skill = this.skills[skillIndex];
        if (!skill) return;
        
        this.skillCooldowns[skillIndex] = skill.cooldown;
        
        if (skill.type === 'attack' || skill.type === 'destruction') {
            this.attacking = true;
            this.attackDamage = (skill.damage || 20) + (this.character.stats.power || 0) * 5;
            setTimeout(() => { 
                this.attacking = false;
                this.attackDamage = 20 + (this.character.stats.power || 0) * 5;
            }, 300);
        } else if (skill.effect === 'heal') {
            gameState.health = Math.min(100, gameState.health + (skill.value || 20));
        } else if (skill.effect === 'dash') {
            this.x += this.facing * 100;
        }
    }
    
    getAttackBox() {
        return {
            x: this.x + (this.facing === 1 ? this.w : -30),
            y: this.y + 10,
            w: 30,
            h: 20
        };
    }
    
    isColliding(terrain) {
        return this.x < terrain.x + terrain.w &&
               this.x + this.w > terrain.x &&
               this.y < terrain.y + terrain.h &&
               this.y + this.h > terrain.y;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        if (this.facing === -1) {
            ctx.scale(-1, 1);
        }
        
        // 简单的像素风格猫咪
        const color = this.character.color;
        const colors = {
            orange: '#ff8c42',
            black: '#2c2c2c',
            white: '#f5f5f5',
            gray: '#888'
        };
        
        ctx.fillStyle = colors[color] || colors.orange;
        
        // 身体
        ctx.fillRect(-15, -10, 30, 25);
        
        // 头部
        ctx.fillRect(-12, -20, 24, 20);
        
        // 耳朵
        ctx.beginPath();
        ctx.moveTo(-8, -20);
        ctx.lineTo(-12, -30);
        ctx.lineTo(-4, -25);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(8, -20);
        ctx.lineTo(12, -30);
        ctx.lineTo(4, -25);
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(-6, -15, 3, 3);
        ctx.fillRect(3, -15, 3, 3);
        
        // 攻击效果
        if (this.attacking) {
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(15, -5);
            ctx.lineTo(35, -10);
            ctx.lineTo(30, 0);
            ctx.lineTo(35, 10);
            ctx.lineTo(15, 5);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// 地形类
class Terrain {
    constructor(x, y, w, h, type) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type;
        this.health = this.getHealthByType();
        this.maxHealth = this.health;
        this.destroyed = false;
    }
    
    getHealthByType() {
        const healthMap = {
            ground: 9999,
            house: 50,
            tower: 80,
            skyscraper: 120,
            castle: 150
        };
        return healthMap[this.type] || 50;
    }
    
    getParticleColor() {
        const colorMap = {
            house: '212, 165, 116',
            tower: '160, 160, 160',
            skyscraper: '112, 128, 144',
            castle: '139, 125, 107',
            ground: '139, 115, 85'
        };
        return colorMap[this.type] || '255, 107, 107';
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroyed = true;
        }
    }
    
    render(ctx) {
        if (this.type === 'ground') {
            ctx.fillStyle = '#8b7355';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = '#6b5b3d';
            for (let i = 0; i < this.w; i += 20) {
                ctx.fillRect(this.x + i, this.y, 1, this.h);
            }
            ctx.fillStyle = '#5c472f';
            ctx.fillRect(this.x, this.y - 10, this.w, 10);
        } else {
            // 建筑物
            const colors = {
                house: '#d4a574',
                tower: '#a0a0a0',
                skyscraper: '#708090',
                castle: '#8b7d6b'
            };
            
            ctx.fillStyle = colors[this.type] || '#d4a574';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            
            // 窗户
            ctx.fillStyle = '#87ceeb';
            const windowSize = 15;
            const spacing = 25;
            for (let i = 10; i < this.w - 10; i += spacing) {
                for (let j = 10; j < this.h - 10; j += spacing) {
                    const flicker = Math.random() > 0.8 ? '#ffc857' : '#87ceeb';
                    ctx.fillStyle = flicker;
                    ctx.fillRect(this.x + i, this.y + j, windowSize, windowSize);
                }
            }
            
            // 健康条
            if (this.health < this.maxHealth) {
                const barWidth = this.w;
                const barHeight = 5;
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(this.x, this.y - 10, barWidth * (this.health / this.maxHealth), barHeight);
                
                // 裂痕效果
                const damageRatio = 1 - (this.health / this.maxHealth);
                ctx.strokeStyle = `rgba(0, 0, 0, ${0.2 + damageRatio * 0.5})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x + this.w * 0.2, this.y);
                ctx.lineTo(this.x + this.w * 0.4, this.y + this.h * 0.5);
                ctx.lineTo(this.x + this.w * 0.3, this.y + this.h);
                ctx.moveTo(this.x + this.w * 0.7, this.y);
                ctx.lineTo(this.x + this.w * 0.6, this.y + this.h * 0.4);
                ctx.lineTo(this.x + this.w * 0.8, this.y + this.h);
                ctx.stroke();
            }
        }
    }
}

// 生物类
class Creature {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.w = 30;
        this.h = 30;
        this.health = this.getHealthByType();
        this.maxHealth = this.health;
        this.destroyed = false;
        this.vx = (Math.random() - 0.5) * 2;
        this.animFrame = 0;
        this.animTimer = 0;
    }
    
    getHealthByType() {
        const healthMap = {
            bird: 20,
            dog: 40,
            rabbit: 15,
            squirrel: 25
        };
        return healthMap[this.type] || 20;
    }
    
    getParticleColor() {
        const colorMap = {
            bird: '255, 107, 107',
            dog: '139, 115, 85',
            rabbit: '245, 245, 245',
            squirrel: '212, 165, 116'
        };
        return colorMap[this.type] || '255, 255, 255';
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroyed = true;
        }
    }
    
    update(deltaTime, player) {
        // 简单的AI：远离玩家
        if (Math.abs(this.x - player.x) < 200) {
            this.vx = this.x < player.x ? -1 : 1;
        }
        this.x += this.vx;
        
        this.animTimer += deltaTime;
        if (this.animTimer > 300) {
            this.animFrame = (this.animFrame + 1) % 2;
            this.animTimer = 0;
        }
    }
    
    render(ctx) {
        ctx.save();
        const colors = {
            bird: '#ff6b6b',
            dog: '#8b7355',
            rabbit: '#f5f5f5',
            squirrel: '#d4a574'
        };
        ctx.fillStyle = colors[this.type] || '#888';
        ctx.translate(this.x, this.y);
        
        if (this.type === 'bird') {
            ctx.beginPath();
            ctx.ellipse(10, 8, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(15, 6, 12, 4);
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(5, 6, 4, 4);
        } else if (this.type === 'dog') {
            ctx.fillRect(0, 10, 25, 15);
            ctx.fillRect(4, 0, 15, 12);
            ctx.fillStyle = '#f4a261';
            ctx.fillRect(18, 5, 6, 4);
        } else if (this.type === 'rabbit') {
            ctx.fillRect(6, 5, 16, 20);
            ctx.fillRect(2, -5, 6, 18);
            ctx.fillRect(20, -5, 6, 18);
            ctx.fillStyle = '#f8edeb';
            ctx.fillRect(10, 12, 8, 4);
        } else if (this.type === 'squirrel') {
            ctx.fillRect(0, 10, 18, 16);
            ctx.fillRect(4, -2, 12, 15);
            ctx.beginPath();
            ctx.fillStyle = '#c97c5d';
            ctx.arc(20, 10, 10, 0, Math.PI * 1.5);
            ctx.fill();
        }
        
        ctx.restore();
        
        // 健康条
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x, this.y - 8, this.w, 3);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x, this.y - 8, this.w * (this.health / this.maxHealth), 3);
        }
    }
}

// 粒子类
class Particle {
    constructor(x, y, color = '255, 107, 107') {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1000;
        this.maxLife = 1000;
        this.size = Math.random() * 5 + 2;
        this.color = color;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3; // 重力
        this.life -= deltaTime;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// 保存记录
function saveRecord(time, character) {
    let records = JSON.parse(localStorage.getItem('catDestructionRecords') || '[]');
    records.push({
        time: time,
        breed: breedData[character.breed].name,
        color: colorData[character.color].name,
        breedKey: character.breed,
        colorKey: character.color,
        date: new Date().toLocaleString('zh-TW')
    });
    
    // 按时间排序（最快在前）
    records.sort((a, b) => {
        const timeA = parseTime(a.time);
        const timeB = parseTime(b.time);
        return timeA - timeB;
    });
    
    // 只保留前10条
    records = records.slice(0, 10);
    recordsCache = records;
    
    localStorage.setItem('catDestructionRecords', JSON.stringify(records));
}

function parseTime(timeString) {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
}

// 显示记录
function showRecords() {
    const records = JSON.parse(localStorage.getItem('catDestructionRecords') || '[]');
    const recordsList = document.getElementById('records-list');
    recordsCache = records;
    
    if (records.length === 0) {
        recordsList.innerHTML = '<p>尚無破關紀錄</p>';
        return;
    }
    
    recordsList.innerHTML = records.map((record, index) => `
        <div class="record-item" data-record-index="${index}">
            <div class="record-time">#${index + 1} - ${record.time}</div>
            <div class="record-details">${record.breed} · ${record.color} · ${record.date}</div>
            <div class="record-actions">
                <button class="btn-secondary record-replay" data-record-index="${index}">使用此配置開局</button>
            </div>
        </div>
    `).join('');
    
    recordsList.querySelectorAll('.record-replay').forEach(button => {
        button.addEventListener('click', () => {
            const record = records[button.dataset.recordIndex];
            replayRecord(record);
        });
    });
}

function getKeyByName(data, value) {
    return Object.keys(data).find(key => data[key].name === value);
}

function replayRecord(record) {
    if (!record) return;
    const breedKey = record.breedKey || getKeyByName(breedData, record.breed);
    const colorKey = record.colorKey || getKeyByName(colorData, record.color);
    if (!breedKey || !colorKey) return;
    
    switchScreen('character-creation');
    requestAnimationFrame(() => {
        const breedOption = document.querySelector(`.breed-option[data-breed="${breedKey}"]`);
        const colorOption = document.querySelector(`.color-option[data-color="${colorKey}"]`);
        breedOption?.click();
        colorOption?.click();
        setTimeout(() => {
            document.getElementById('start-game-btn')?.click();
        }, 150);
    });
}

// 初始化游戏
function initGame() {
    gameState.startTime = Date.now();
    gameState.destructionProgress = 0;
    gameState.health = 100;
    
    const game = new Game();
    game.gameLoop(0);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    uiElements.skillHotbar = document.getElementById('skill-hotbar');
    uiElements.controlsPanel = document.getElementById('controls-panel');
    uiElements.controlsToggle = document.getElementById('controls-toggle');
    
    if (uiElements.controlsToggle) {
        uiElements.controlsToggle.addEventListener('click', toggleControlsPanel);
    }
    hideControlsPanel();
    
    initCharacterCreation();
    
    // 游戏结束按钮
    document.getElementById('play-again-btn').addEventListener('click', () => {
        switchScreen('character-creation');
        gameState.character = null;
    });
    
    // 查看记录按钮
    document.getElementById('view-records-btn').addEventListener('click', () => {
        showRecords();
        switchScreen('dashboard');
    });
    
    // 从主菜单查看记录
    document.getElementById('view-dashboard-btn').addEventListener('click', () => {
        showRecords();
        switchScreen('dashboard');
    });
    
    // 从记录返回主菜单
    document.getElementById('back-to-menu-btn').addEventListener('click', () => {
        switchScreen('character-creation');
    });
});

