// 合并最终版本（使用这个替换）
let player = {
  level:1,
  exp:0,
  expMax:100,
  hp:100, mp:50, gold:100,
  atk:10, def:5,
  inventory:[],
  weapon:null,
  armor:null
};

function updateExp(){
  levelText.innerText = "Lv." + player.level;
  let percent = (player.exp / player.expMax) * 100;
  expBar.style.width = percent + "%";
}

function gainExp(amount){
  player.exp += amount;

  while(player.exp >= player.expMax && player.level < 20){
    player.exp -= player.expMax;
    player.level++;
    player.expMax += 50;

    // 升级奖励
    player.hp += 20;
    player.atk += 5;
    player.def += 3;

    alert("升级！当前等级：" + player.level);
  }

  updateExp();
  updateHUD();
}

function updateHUD(){
  hp.innerText='HP:'+player.hp;
  mp.innerText='MP:'+player.mp;
  gold.innerText='Gold:'+player.gold;
  atk.innerText=' ATK:'+player.atk;
  def.innerText=' DEF:'+player.def;
}

function updateInventory(){
  items.innerHTML='';
  player.inventory.forEach(item=>{
    let li=document.createElement('li');
    li.innerText=item;
    li.onclick=()=>equip(item);
    items.appendChild(li);
  });
}

function equip(item){
  if(item.includes('剑')){
    player.weapon=item;
    player.atk=10 + (item==='木剑'?5:item==='铁剑'?10:20);
    weaponSlot.innerText=item;
  }
  if(item.includes('甲')){
    player.armor=item;
    player.def=5 + (item==='布甲'?5:item==='铁甲'?10:20);
    player.hp+=20;
    armorSlot.innerText=item;
  }
  updateHUD();
  updateCharacter();
}

function closeEquip(){
  document.getElementById("equipPanel").style.display = "none";
}

function updateCharacter(){
  let char='🙂';
  if(player.weapon) char='🗡️'+char;
  if(player.armor) char='🛡️'+char;
  character.innerText=char;
}

function openEquip(){
  document.getElementById("equipPanel").style.display = "block";
}

function buy(item,price){
  if(player.gold>=price){
    player.gold-=price;
    player.inventory.push(item);
    updateInventory();
    updateHUD();
  }
}

const MONSTER_DB = {
  forest: [
    { name: "史莱姆", minLevel: 1, maxLevel: 4, tier: "normal", hp: 55, atk: 8, def: 3, expBase: 14, goldBase: 8, dropTable: "forest_common" },
    { name: "哥布林", minLevel: 2, maxLevel: 5, tier: "normal", hp: 70, atk: 11, def: 4, expBase: 18, goldBase: 10, dropTable: "forest_common" },
    { name: "猫妖", minLevel: 4, maxLevel: 8, tier: "elite", hp: 120, atk: 18, def: 8, expBase: 32, goldBase: 16, dropTable: "forest_elite" },
    { name: "狐妖", minLevel: 5, maxLevel: 8, tier: "elite", hp: 140, atk: 20, def: 9, expBase: 36, goldBase: 18, dropTable: "forest_elite" }
  ],
  lava: [
    { name: "骷髅", minLevel: 9, maxLevel: 12, tier: "normal", hp: 220, atk: 28, def: 14, expBase: 70, goldBase: 30, dropTable: "lava_common" },
    { name: "僵尸", minLevel: 10, maxLevel: 13, tier: "normal", hp: 250, atk: 30, def: 16, expBase: 75, goldBase: 32, dropTable: "lava_common" },
    { name: "蝙蝠妖", minLevel: 11, maxLevel: 14, tier: "elite", hp: 330, atk: 42, def: 20, expBase: 110, goldBase: 45, dropTable: "lava_elite" },
    { name: "黑龙", minLevel: 18, maxLevel: 22, tier: "boss", hp: 700, atk: 78, def: 38, expBase: 260, goldBase: 120, dropTable: "lava_boss" }
  ]
};

const TIER_MULT = { normal: 1, elite: 1.6, boss: 2.4 };

const DROP_TABLE = {
  forest_common: [{ item: "血药", p: 0.3 }, { item: "蓝药", p: 0.2 }, { item: "银宝箱", p: 0.08 }],
  forest_elite: [{ item: "铁剑", p: 0.12 }, { item: "布甲", p: 0.12 }, { item: "金宝箱", p: 0.15 }],
  lava_common: [{ item: "血药", p: 0.2 }, { item: "蓝药", p: 0.2 }, { item: "银宝箱", p: 0.15 }],
  lava_elite: [{ item: "铁甲", p: 0.12 }, { item: "钢剑", p: 0.12 }, { item: "金宝箱", p: 0.22 }],
  lava_boss: [{ item: "圣剑", p: 0.25 }, { item: "妖精盔甲", p: 0.25 }, { item: "金宝箱", p: 0.35 }]
};

const FOREST_MONSTER_POOLS = {
  outer: [
    { name: "史莱姆", minLevel: 1, maxLevel: 4, tier: "normal", hp: 55, atk: 8, def: 3, expBase: 14, goldBase: 8, dropTable: "forest_common" },
    { name: "哥布林", minLevel: 2, maxLevel: 5, tier: "normal", hp: 70, atk: 11, def: 4, expBase: 18, goldBase: 10, dropTable: "forest_common" },
    { name: "林地野狼", minLevel: 3, maxLevel: 6, tier: "normal", hp: 88, atk: 14, def: 6, expBase: 22, goldBase: 13, dropTable: "forest_common" }
  ],
  mist: [
    { name: "猫妖", minLevel: 4, maxLevel: 8, tier: "elite", hp: 120, atk: 18, def: 8, expBase: 32, goldBase: 16, dropTable: "forest_elite" },
    { name: "狐妖", minLevel: 5, maxLevel: 8, tier: "elite", hp: 140, atk: 20, def: 9, expBase: 36, goldBase: 18, dropTable: "forest_elite" },
    { name: "迷雾树精", minLevel: 6, maxLevel: 9, tier: "elite", hp: 165, atk: 24, def: 11, expBase: 45, goldBase: 24, dropTable: "forest_elite" }
  ],
  boss: [
    { name: "迷雾森林领主", minLevel: 9, maxLevel: 12, tier: "boss", hp: 320, atk: 40, def: 18, expBase: 100, goldBase: 80, dropTable: "lava_boss" }
  ]
};

const forestState = {
  active: false,
  cols: 24,
  rows: 16,
  tile: 24,
  playerX: 2,
  playerY: 8,
  moveX: 0,
  moveY: 0,
  encounterSteps: 0,
  inBattle: false,
  bossDefeated: false
};

function getTierMult(tier){
  return TIER_MULT[tier] || 1;
}

function calcDamage(attackerAtk, defenderDef, skillRate = 1){
  const rand = 0.9 + Math.random() * 0.2;
  return Math.max(1, Math.round((attackerAtk * skillRate - defenderDef * 0.6) * rand));
}

function calcExpGain(monster){
  const levelGap = monster.level - player.level;
  let mult = 1;
  if(levelGap >= 3){
    mult = 1.35;
  }else if(levelGap >= 0){
    mult = 1 + 0.08 * levelGap;
  }else if(levelGap === -1){
    mult = 0.75;
  }else{
    mult = Math.max(0.2, 0.75 + 0.15 * levelGap);
  }
  return Math.round(monster.expBase * getTierMult(monster.tier) * mult);
}

function applyLosePenalty(){
  player.hp = Math.max(30, Math.floor(player.hp * 0.3));
  const penaltyGold = Math.max(20, Math.floor(player.gold * 0.1));
  player.gold = Math.max(0, player.gold - penaltyGold);
  alert(`你战败了！回城休整，金币损失 ${penaltyGold}`);
}

function rollDrop(dropTableName){
  const table = DROP_TABLE[dropTableName] || [];
  table.forEach(entry => {
    if(Math.random() < entry.p){
      player.inventory.push(entry.item);
      alert("获得" + entry.item);
    }
  });
}

function spawnMonster(zone){
  const pool = MONSTER_DB[zone];
  if(!pool || pool.length === 0) return null;
  const base = pool[Math.floor(Math.random()*pool.length)];
  const zoneMin = base.minLevel;
  const zoneMax = base.maxLevel;
  const level = Math.max(zoneMin, Math.min(zoneMax, player.level + Math.floor(Math.random()*4) - 1));
  return {
    ...base,
    level,
    hp: Math.round(base.hp * (1 + 0.22*(level-1)) * getTierMult(base.tier)),
    atk: Math.round(base.atk * (1 + 0.18*(level-1)) * getTierMult(base.tier)),
    def: Math.round(base.def * (1 + 0.15*(level-1)) * getTierMult(base.tier))
  };
}

function scaleMonster(base){
  const zoneMin = base.minLevel;
  const zoneMax = base.maxLevel;
  const level = Math.max(zoneMin, Math.min(zoneMax, player.level + Math.floor(Math.random()*4) - 1));
  return {
    ...base,
    level,
    hp: Math.round(base.hp * (1 + 0.22*(level-1)) * getTierMult(base.tier)),
    atk: Math.round(base.atk * (1 + 0.18*(level-1)) * getTierMult(base.tier)),
    def: Math.round(base.def * (1 + 0.15*(level-1)) * getTierMult(base.tier))
  };
}

function spawnForestMonster(area, isBoss = false){
  const pool = isBoss ? FOREST_MONSTER_POOLS.boss : (FOREST_MONSTER_POOLS[area] || FOREST_MONSTER_POOLS.outer);
  const base = pool[Math.floor(Math.random()*pool.length)];
  return scaleMonster(base);
}

function getForestTileType(x, y){
  if(x < 0 || y < 0 || x >= forestState.cols || y >= forestState.rows) return "tree";
  if(x > 19 && y >= 5 && y <= 10) return "boss";
  if(y === 8 || (x > 8 && x < 16 && y === 7)) return "road";
  if((x % 5 === 0 && y % 3 !== 0) || (y % 6 === 0 && x % 4 === 1)) return "tree";
  return "grass";
}

function drawForest(){
  const canvas = document.getElementById("forestCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const t = forestState.tile;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(let y=0; y<forestState.rows; y++){
    for(let x=0; x<forestState.cols; x++){
      const type = getForestTileType(x,y);
      if(type === "road"){
        ctx.fillStyle = "#5b4628";
      }else if(type === "tree"){
        ctx.fillStyle = "#1f5f28";
      }else if(type === "boss"){
        ctx.fillStyle = forestState.bossDefeated ? "#3f4f3f" : "#6d1a1a";
      }else{
        ctx.fillStyle = x < 12 ? "#2f7d32" : "#3f6f4a";
      }
      ctx.fillRect(x*t, y*t, t, t);
    }
  }

  // 玩家像素小人
  const px = forestState.playerX * t;
  const py = forestState.playerY * t;
  ctx.fillStyle = "#f3e5ab";
  ctx.fillRect(px+8, py+4, 8, 8);   // 头
  ctx.fillStyle = "#4aa3ff";
  ctx.fillRect(px+7, py+12, 10, 8); // 身体
  ctx.fillStyle = "#dddddd";
  ctx.fillRect(px+6, py+20, 4, 4);  // 左脚
  ctx.fillRect(px+14, py+20, 4, 4); // 右脚
}

function setupJoystick(){
  const base = document.getElementById("joystickBase");
  const stick = document.getElementById("joystickStick");
  if(!base || !stick) return;
  const center = 60;
  let dragging = false;

  function updateFromPoint(clientX, clientY){
    const rect = base.getBoundingClientRect();
    const dx = clientX - (rect.left + center);
    const dy = clientY - (rect.top + center);
    const maxRadius = 34;
    const len = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(maxRadius, len);
    const nx = (dx / len) * clamped;
    const ny = (dy / len) * clamped;
    stick.style.left = `${center - 26 + nx}px`;
    stick.style.top = `${center - 26 + ny}px`;
    forestState.moveX = nx / maxRadius;
    forestState.moveY = ny / maxRadius;
  }

  function resetStick(){
    stick.style.left = "34px";
    stick.style.top = "34px";
    forestState.moveX = 0;
    forestState.moveY = 0;
  }

  base.addEventListener("pointerdown", (e) => {
    dragging = true;
    base.setPointerCapture(e.pointerId);
    updateFromPoint(e.clientX, e.clientY);
  });
  base.addEventListener("pointermove", (e) => {
    if(!dragging) return;
    updateFromPoint(e.clientX, e.clientY);
  });
  base.addEventListener("pointerup", (e) => {
    dragging = false;
    base.releasePointerCapture(e.pointerId);
    resetStick();
  });
  base.addEventListener("pointercancel", () => {
    dragging = false;
    resetStick();
  });
}

function tryForestEncounter(){
  const area = forestState.playerX < 12 ? "outer" : "mist";
  const tileType = getForestTileType(forestState.playerX, forestState.playerY);
  const baseChance = tileType === "grass" ? 0.12 : 0.03;
  if(Math.random() < baseChance){
    forestState.inBattle = true;
    const monster = spawnForestMonster(area, false);
    scene.innerHTML = `你在${area === "outer" ? "森林外环" : "迷雾森林"}遭遇了${monster.name}！`;
    fight(monster);
    forestState.inBattle = false;
  }
}

function checkForestBoss(){
  const tileType = getForestTileType(forestState.playerX, forestState.playerY);
  if(tileType === "boss" && !forestState.bossDefeated){
    forestState.inBattle = true;
    const boss = spawnForestMonster("mist", true);
    scene.innerHTML = "你抵达迷雾森林最深处，Boss出现！";
    fight(boss);
    if(player.hp > 0){
      forestState.bossDefeated = true;
      alert("第一关 Boss 已击败！你可以继续探索或返回城镇。");
    }
    forestState.inBattle = false;
  }
}

function stepForestMovement(){
  if(!forestState.active || forestState.inBattle) return;
  const speed = 0.18;
  const nextX = forestState.playerX + forestState.moveX * speed;
  const nextY = forestState.playerY + forestState.moveY * speed;
  const tx = Math.round(nextX);
  const ty = Math.round(nextY);
  if(getForestTileType(tx, ty) !== "tree"){
    const movedTile = tx !== Math.round(forestState.playerX) || ty !== Math.round(forestState.playerY);
    forestState.playerX = Math.max(0, Math.min(forestState.cols - 1, nextX));
    forestState.playerY = Math.max(0, Math.min(forestState.rows - 1, nextY));
    if(movedTile){
      forestState.encounterSteps++;
      if(forestState.encounterSteps >= 3){
        forestState.encounterSteps = 0;
        tryForestEncounter();
        checkForestBoss();
      }
    }
  }
  drawForest();
  requestAnimationFrame(stepForestMovement);
}

function startForestExploration(){
  if(forestState.active){
    scene.innerHTML = "你已经在森林中探索。";
    return;
  }
  forestState.active = true;
  forestState.playerX = 2;
  forestState.playerY = 8;
  forestState.bossDefeated = false;
  forestState.encounterSteps = 0;
  document.getElementById("forestExplorer").style.display = "block";
  scene.innerHTML = "你进入第一张大地图：森林（外环 -> 迷雾森林深处）。";
  drawForest();
  requestAnimationFrame(stepForestMovement);
}

function fight(monster){
  if(!monster){
    alert("没有遇到怪物。");
    return;
  }

  // 你先手
  const playerDmg = calcDamage(player.atk, monster.def, 1);
  monster.hp -= playerDmg;
  alert(`你攻击${monster.name}(Lv.${monster.level}) -${playerDmg}`);

  if(monster.hp > 0){
    const enemyDmg = calcDamage(monster.atk, player.def, 1);
    player.hp -= enemyDmg;
    alert(`${monster.name}反击你 -${enemyDmg}`);
  }

  if(player.hp <= 0){
    applyLosePenalty();
    updateHUD();
    return;
  }

  if(monster.hp <= 0){
    const exp = calcExpGain(monster);
    const gold = Math.max(1, Math.round(monster.goldBase * (0.8 + Math.random()*0.4)));
    player.gold += gold;
    alert(`击败${monster.name}！获得 EXP ${exp} / Gold ${gold}`);
    gainExp(exp);
    rollDrop(monster.dropTable);
    updateInventory();
  }else{
    alert(`${monster.name} 还剩 HP ${monster.hp}`);
  }

  updateHUD();
}

updateExp();

function findLoot(){
  rollDrop("forest_common");
  updateInventory();
}

function goTown(){
  forestState.active = false;
  document.getElementById("forestExplorer").style.display = "none";
  scene.innerHTML=`商店<br>
  <button onclick="buy('木剑',30)">木剑</button>
  <button onclick="buy('铁剑',80)">铁剑</button>
  <button onclick="buy('钢剑',150)">钢剑</button><br>
  <button onclick="buy('布甲',30)">布甲</button>
  <button onclick="buy('铁甲',80)">铁甲</button>
  <button onclick="buy('骑士甲',150)">骑士甲</button><br>
  <button onclick="buy('血药',20)">血药</button>
  <button onclick="buy('蓝药',20)">蓝药</button>`;
}

function goForest(){
  startForestExploration();
}

function goLava(){
  forestState.active = false;
  document.getElementById("forestExplorer").style.display = "none";
  scene.innerHTML = "你进入熔岩洞...";
  fight(spawnMonster("lava"));
}

function scare(){
  alert('突脸！！！');
}

function checkEnding(){
  if(player.inventory.includes('妖精盔甲') && player.inventory.includes('圣剑')){
    alert('真结局：骑士');
  }else{
    alert('普通结局：勇者');
  }
}

updateHUD();
updateInventory();
setupJoystick();
