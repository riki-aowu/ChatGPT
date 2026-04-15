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
    li.onclick=()=>{
      if(item === "血药" || item === "蓝药"){
        useConsumable(item);
      }else{
        equip(item);
      }
    };
    items.appendChild(li);
  });
}

function removeOneItem(itemName){
  const idx = player.inventory.indexOf(itemName);
  if(idx === -1) return false;
  player.inventory.splice(idx, 1);
  return true;
}

function useConsumable(item){
  if(!removeOneItem(item)) return;
  if(item === "血药"){
    const heal = 60;
    player.hp += heal;
    alert(`你使用了血药，恢复 ${heal} HP`);
  }else if(item === "蓝药"){
    const restore = 30;
    player.mp += restore;
    alert(`你使用了蓝药，恢复 ${restore} MP`);
  }
  updateHUD();
  updateInventory();
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
    alert(`购买成功：${item}（-${price} Gold）`);
  }else{
    alert("金币不足，无法购买。");
  }
}

let pendingPurchase = null;

function promptPurchase(item, price){
  pendingPurchase = { item, price };
  const modal = document.getElementById("shopConfirmModal");
  const text = document.getElementById("shopConfirmText");
  if(!modal || !text) return;
  text.innerText = `您确定要购买吗？\n${item} - ${price} Gold`;
  modal.style.display = "flex";
}

function cancelPurchase(){
  pendingPurchase = null;
  const modal = document.getElementById("shopConfirmModal");
  if(modal) modal.style.display = "none";
}

function confirmPurchase(){
  if(pendingPurchase){
    buy(pendingPurchase.item, pendingPurchase.price);
  }
  cancelPurchase();
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

const townState = {
  active: false,
  cols: 24,
  rows: 16,
  tile: 24,
  playerX: 5,
  playerY: 7,
  lastInteractX: -1,
  lastInteractY: -1,
  lastInteractType: ""
};

const lavaState = {
  active: false,
  floor: 1,
  cols: 24,
  rows: 16,
  tile: 24,
  playerX: 2,
  playerY: 13,
  encounterSteps: 0,
  inBattle: false,
  bossDefeated: false
};

const LAVA_STAIRS_F1 = { x: 21, y: 3 };
const LAVA_ENTRANCE_F2 = { x: 2, y: 13 };
const LAVA_BOSS_TILE = { x: 20, y: 2 };
const openedChests = new Set();
const MAP_CHESTS = {
  forest: [
    { id: "forest_1", x: 6, y: 8, type: "silver" },
    { id: "forest_2", x: 14, y: 7, type: "gold" }
  ],
  lava1: [
    { id: "lava1_1", x: 16, y: 9, type: "silver" },
    { id: "lava1_2", x: 18, y: 3, type: "gold" }
  ],
  lava2: [
    { id: "lava2_1", x: 10, y: 9, type: "silver" },
    { id: "lava2_2", x: 15, y: 2, type: "gold" }
  ]
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

function inRange(v, start, end){
  return v >= start && v <= end;
}

function isLavaWalkable(floor, x, y){
  if(x < 0 || y < 0 || x >= lavaState.cols || y >= lavaState.rows) return false;

  if(floor === 1){
    if(inRange(y, 13, 13) && inRange(x, 1, 8)) return true;
    if(inRange(x, 8, 8) && inRange(y, 10, 13)) return true;
    if(inRange(y, 10, 10) && inRange(x, 8, 16)) return true;
    if(inRange(x, 16, 16) && inRange(y, 6, 10)) return true;
    if(inRange(y, 6, 6) && inRange(x, 12, 16)) return true;
    if(inRange(x, 12, 12) && inRange(y, 3, 6)) return true;
    if(inRange(y, 3, 3) && inRange(x, 12, 21)) return true;
    return false;
  }

  if(inRange(y, 13, 13) && inRange(x, 2, 18)) return true;
  if(inRange(x, 18, 18) && inRange(y, 9, 13)) return true;
  if(inRange(y, 9, 9) && inRange(x, 9, 18)) return true;
  if(inRange(x, 9, 9) && inRange(y, 5, 9)) return true;
  if(inRange(y, 5, 5) && inRange(x, 9, 20)) return true;
  if(inRange(x, 20, 20) && inRange(y, 2, 5)) return true;
  if(inRange(y, 2, 2) && inRange(x, 14, 20)) return true;
  return false;
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

  drawMapChests(ctx, t, "forest");

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

function drawLava(){
  const canvas = document.getElementById("forestCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const t = lavaState.tile;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(let y=0; y<lavaState.rows; y++){
    for(let x=0; x<lavaState.cols; x++){
      const walkable = isLavaWalkable(lavaState.floor, x, y);
      if(!walkable){
        ctx.fillStyle = "#030303"; // 山洞外黑色空气墙
      }else{
        const lavaGlow = (x + y) % 3 === 0;
        ctx.fillStyle = lavaGlow ? "#78310a" : "#4b2b1b";
      }
      ctx.fillRect(x*t, y*t, t, t);
    }
  }

  drawMapChests(ctx, t, lavaState.floor === 1 ? "lava1" : "lava2");

  if(lavaState.floor === 1){
    ctx.fillStyle = "#75d8ff";
    ctx.fillRect(LAVA_STAIRS_F1.x*t + 6, LAVA_STAIRS_F1.y*t + 6, 12, 12);
  }else{
    ctx.fillStyle = "#75d8ff";
    ctx.fillRect(LAVA_ENTRANCE_F2.x*t + 6, LAVA_ENTRANCE_F2.y*t + 6, 12, 12);
    if(!lavaState.bossDefeated){
      ctx.fillStyle = "#d62828";
      ctx.fillRect(LAVA_BOSS_TILE.x*t + 5, LAVA_BOSS_TILE.y*t + 5, 14, 14);
    }
  }

  const px = lavaState.playerX * t;
  const py = lavaState.playerY * t;
  ctx.fillStyle = "#f3e5ab";
  ctx.fillRect(px+8, py+4, 8, 8);
  ctx.fillStyle = "#4aa3ff";
  ctx.fillRect(px+7, py+12, 10, 8);
  ctx.fillStyle = "#dddddd";
  ctx.fillRect(px+6, py+20, 4, 4);
  ctx.fillRect(px+14, py+20, 4, 4);
}

function drawMapChests(ctx, tileSize, mapKey){
  const list = MAP_CHESTS[mapKey] || [];
  list.forEach(chest => {
    if(openedChests.has(chest.id)) return;
    const px = chest.x * tileSize;
    const py = chest.y * tileSize;
    const bodyColor = chest.type === "gold" ? "#d9a515" : "#b9c0ca";
    ctx.fillStyle = bodyColor;
    ctx.fillRect(px + 5, py + 9, 14, 10);
    ctx.fillStyle = "#4a2f16";
    ctx.fillRect(px + 5, py + 7, 14, 4);
    ctx.fillStyle = "#111";
    ctx.fillRect(px + 11, py + 12, 2, 4);
  });
}

function rollChestReward(type){
  if(type === "gold"){
    const goldGain = 80 + Math.floor(Math.random() * 61);
    player.gold += goldGain;
    const rewards = ["钢剑", "铁甲", "血药", "蓝药", "金宝箱"];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    player.inventory.push(reward);
    return `打开金宝箱：获得 ${goldGain} Gold 和 ${reward}`;
  }

  const goldGain = 30 + Math.floor(Math.random() * 31);
  player.gold += goldGain;
  const rewards = ["血药", "蓝药", "银宝箱"];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  player.inventory.push(reward);
  return `打开银宝箱：获得 ${goldGain} Gold 和 ${reward}`;
}

function checkAndOpenChest(mapKey, tx, ty){
  const list = MAP_CHESTS[mapKey] || [];
  const chest = list.find(c => c.x === tx && c.y === ty && !openedChests.has(c.id));
  if(!chest) return;
  openedChests.add(chest.id);
  const msg = rollChestReward(chest.type);
  alert(msg);
  updateHUD();
  updateInventory();
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

    // 摇杆灵敏度调优：加入死区 + 非线性响应，避免轻微拨动就“起飞”
    const rawX = nx / maxRadius;
    const rawY = ny / maxRadius;
    const deadZone = 0.2;

    const shapeAxis = (v) => {
      const absV = Math.abs(v);
      if(absV <= deadZone) return 0;
      const normalized = (absV - deadZone) / (1 - deadZone);
      const curved = Math.pow(normalized, 1.6);
      return Math.sign(v) * curved;
    };

    forestState.moveX = shapeAxis(rawX);
    forestState.moveY = shapeAxis(rawY);
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
  const speed = 0.12;
  const nextX = forestState.playerX + forestState.moveX * speed;
  const nextY = forestState.playerY + forestState.moveY * speed;
  const tx = Math.round(nextX);
  const ty = Math.round(nextY);
  if(getForestTileType(tx, ty) !== "tree"){
    const movedTile = tx !== Math.round(forestState.playerX) || ty !== Math.round(forestState.playerY);
    forestState.playerX = Math.max(0, Math.min(forestState.cols - 1, nextX));
    forestState.playerY = Math.max(0, Math.min(forestState.rows - 1, nextY));
    if(movedTile){
      checkAndOpenChest("forest", tx, ty);
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
  townState.active = false;
  forestState.active = true;
  forestState.playerX = 2;
  forestState.playerY = 8;
  forestState.bossDefeated = false;
  forestState.encounterSteps = 0;
  lavaState.active = false;
  document.getElementById("forestExplorer").style.display = "block";
  const forestHint = document.getElementById("forestHint");
  if(forestHint){
    forestHint.innerText = "森林探索中：左侧摇杆移动，深入迷雾森林寻找 Boss。";
  }
  scene.innerHTML = "你进入第一张大地图：森林（外环 -> 迷雾森林深处）。";
  drawForest();
  requestAnimationFrame(stepForestMovement);
}

function tryLavaEncounter(){
  const chance = lavaState.floor === 1 ? 0.15 : 0.2;
  if(Math.random() < chance){
    lavaState.inBattle = true;
    const monster = spawnMonster("lava");
    scene.innerHTML = `你在熔岩洞${lavaState.floor}层遭遇了${monster.name}！`;
    fight(monster);
    lavaState.inBattle = false;
  }
}

function checkLavaTransitionAndBoss(){
  const tx = Math.round(lavaState.playerX);
  const ty = Math.round(lavaState.playerY);

  if(lavaState.floor === 1 && tx === LAVA_STAIRS_F1.x && ty === LAVA_STAIRS_F1.y){
    lavaState.floor = 2;
    lavaState.playerX = LAVA_ENTRANCE_F2.x;
    lavaState.playerY = LAVA_ENTRANCE_F2.y;
    scene.innerHTML = "你到达第一层尽头洞口，进入熔岩洞第二层。";
    return;
  }

  if(lavaState.floor === 2 && tx === LAVA_ENTRANCE_F2.x && ty === LAVA_ENTRANCE_F2.y){
    scene.innerHTML = "这里是返回第一层的洞口。";
  }

  if(lavaState.floor === 2 && !lavaState.bossDefeated && tx === LAVA_BOSS_TILE.x && ty === LAVA_BOSS_TILE.y){
    lavaState.inBattle = true;
    const boss = spawnMonster("lava");
    boss.name = "熔岩洞深层领主";
    boss.tier = "boss";
    boss.dropTable = "lava_boss";
    boss.hp = Math.round(boss.hp * 1.25);
    boss.atk = Math.round(boss.atk * 1.15);
    scene.innerHTML = "你抵达熔岩洞第二层最深处，Boss出现！";
    fight(boss);
    if(player.hp > 0){
      lavaState.bossDefeated = true;
      alert("你击败了熔岩洞 Boss！");
    }
    lavaState.inBattle = false;
  }
}

function stepLavaMovement(){
  if(!lavaState.active || lavaState.inBattle) return;
  const speed = 0.1;
  const nextX = lavaState.playerX + forestState.moveX * speed;
  const nextY = lavaState.playerY + forestState.moveY * speed;
  const tx = Math.round(nextX);
  const ty = Math.round(nextY);
  if(isLavaWalkable(lavaState.floor, tx, ty)){
    const movedTile = tx !== Math.round(lavaState.playerX) || ty !== Math.round(lavaState.playerY);
    lavaState.playerX = Math.max(0, Math.min(lavaState.cols - 1, nextX));
    lavaState.playerY = Math.max(0, Math.min(lavaState.rows - 1, nextY));
    if(movedTile){
      checkAndOpenChest(lavaState.floor === 1 ? "lava1" : "lava2", tx, ty);
      lavaState.encounterSteps++;
      if(lavaState.encounterSteps >= 3){
        lavaState.encounterSteps = 0;
        tryLavaEncounter();
        checkLavaTransitionAndBoss();
      }
    }
  }
  drawLava();
  requestAnimationFrame(stepLavaMovement);
}

function startLavaExploration(){
  forestState.active = false;
  townState.active = false;
  lavaState.active = true;
  lavaState.floor = 1;
  lavaState.playerX = 2;
  lavaState.playerY = 13;
  lavaState.encounterSteps = 0;
  document.getElementById("forestExplorer").style.display = "block";
  const forestHint = document.getElementById("forestHint");
  if(forestHint){
    forestHint.innerText = "熔岩洞探索中：通道外是黑暗空气墙，第一层尽头洞口可下到第二层。";
  }
  scene.innerHTML = "你进入熔岩洞第一层，通道曲折蜿蜒，小心前进。";
  drawLava();
  requestAnimationFrame(stepLavaMovement);
}

// ===== 城镇地图 =====
function getTownTileType(x, y){
  if(x < 0 || y < 0 || x >= townState.cols || y >= townState.rows) return "wall";
  // 家：左上角 x0-3，y0-2墙，y3门脸，门在x=1
  if(x <= 3 && y <= 2) return "building";
  if(x <= 3 && y === 3) return x === 1 ? "door_home" : "building";
  // 公告板：x6-8，y0-2墙，y3门脸，门在x=7
  if(x >= 6 && x <= 8 && y <= 2) return "building";
  if(x >= 6 && x <= 8 && y === 3) return x === 7 ? "door_board" : "building";
  // 商店：x14-18，y0-2墙，y3门脸，门在x=15
  if(x >= 14 && x <= 18 && y <= 2) return "building";
  if(x >= 14 && x <= 18 && y === 3) return x === 15 ? "door_shop" : "building";
  // 主干道
  if(y === 4 || y === 11) return "road";
  // 森林入口（右侧区域，两条路之间）
  if(x >= 20 && y >= 5 && y <= 10) return "gate";
  // 旅店：x5-10，y12-14，入口门在x=7,y=12
  if(x >= 5 && x <= 10 && y >= 12 && y <= 14) return (x === 7 && y === 12) ? "door_inn" : "building";
  return "ground";
}

function isTownWalkable(x, y){
  const t = getTownTileType(x, y);
  return t !== "building" && t !== "wall";
}

function drawTown(){
  const canvas = document.getElementById("forestCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  const t = townState.tile;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(let y = 0; y < townState.rows; y++){
    for(let x = 0; x < townState.cols; x++){
      const type = getTownTileType(x, y);
      if(type === "building")        ctx.fillStyle = "#2a2244";
      else if(type === "door_home")  ctx.fillStyle = "#7a4a1a";
      else if(type === "door_shop")  ctx.fillStyle = "#a06030";
      else if(type === "door_inn")   ctx.fillStyle = "#6a3a7a";
      else if(type === "door_board") ctx.fillStyle = "#2a5a2a";
      else if(type === "road")       ctx.fillStyle = "#6b5a3a";
      else if(type === "gate")       ctx.fillStyle = "#1a5f1a";
      else                           ctx.fillStyle = "#3a5040";
      ctx.fillRect(x * t, y * t, t, t);
    }
  }
  ctx.fillStyle = "#aaffaa";
  ctx.font = "9px monospace";
  ctx.fillText("家", 1*t+4, 1*t+16);
  ctx.fillText("告示板", 6*t+2, 1*t+16);
  ctx.fillText("商店", 15*t+2, 1*t+16);
  ctx.fillText("森林\n入口", 20*t+4, 7*t+14);
  ctx.fillText("旅店", 6*t+2, 13*t+14);
  // 玩家像素小人
  const px = townState.playerX * t;
  const py = townState.playerY * t;
  ctx.fillStyle = "#f3e5ab";
  ctx.fillRect(px+8, py+4, 8, 8);
  ctx.fillStyle = "#4aa3ff";
  ctx.fillRect(px+7, py+12, 10, 8);
  ctx.fillStyle = "#dddddd";
  ctx.fillRect(px+6, py+20, 4, 4);
  ctx.fillRect(px+14, py+20, 4, 4);
}

function checkTownInteraction(tx, ty){
  const type = getTownTileType(tx, ty);
  if(type === townState.lastInteractType && tx === townState.lastInteractX && ty === townState.lastInteractY) return;
  townState.lastInteractX = tx;
  townState.lastInteractY = ty;
  townState.lastInteractType = type;
  if(type === "door_home"){
    const heal = Math.max(1, Math.floor(player.hp * 0.5));
    player.hp += heal;
    updateHUD();
    scene.innerHTML = `你推开家门，躺下休息，恢复了 ${heal} HP。`;
  } else if(type === "door_shop"){
    townState.active = false;
    document.getElementById("forestExplorer").style.display = "none";
    openTownShop();
  } else if(type === "door_inn"){
    const cost = 10;
    if(player.gold >= cost){
      player.gold -= cost;
      player.hp = Math.round(player.hp * 1.5);
      player.mp = 50;
      updateHUD();
      scene.innerHTML = `老板收下 ${cost}G，你睡了个好觉，HP恢复到 ${player.hp}，MP完全恢复。`;
    } else {
      scene.innerHTML = `老板摇摇头："你的金币不够，需要 ${cost}G 才能入住。"`;
    }
  } else if(type === "door_board"){
    scene.innerHTML = `【公告板】迷雾森林传出异响，寻勇者前往调查。熔岩洞深处有失踪商队，赏金 300G。`;
  } else if(type === "gate"){
    townState.active = false;
    startForestExploration();
  }
}

function stepTownMovement(){
  if(!townState.active) return;
  const speed = 0.12;
  const nextX = townState.playerX + forestState.moveX * speed;
  const nextY = townState.playerY + forestState.moveY * speed;
  const tx = Math.round(nextX);
  const ty = Math.round(nextY);
  if(isTownWalkable(tx, ty)){
    const movedTile = tx !== Math.round(townState.playerX) || ty !== Math.round(townState.playerY);
    townState.playerX = Math.max(0, Math.min(townState.cols - 1, nextX));
    townState.playerY = Math.max(0, Math.min(townState.rows - 1, nextY));
    if(movedTile) checkTownInteraction(tx, ty);
  }
  drawTown();
  requestAnimationFrame(stepTownMovement);
}

function startTownExploration(){
  if(townState.active){
    scene.innerHTML = "你已经在城镇中。";
    return;
  }
  forestState.active = false;
  lavaState.active = false;
  townState.active = true;
  townState.playerX = 5;
  townState.playerY = 7;
  townState.lastInteractX = -1;
  townState.lastInteractY = -1;
  townState.lastInteractType = "";
  document.getElementById("forestExplorer").style.display = "block";
  const hint = document.getElementById("forestHint");
  if(hint) hint.innerText = "城镇探索：摇杆移动，走到建筑门口互动（家/公告板/商店/旅店/森林入口）。";
  scene.innerHTML = "你回到了城镇。走近建筑门口即可互动。";
  drawTown();
  requestAnimationFrame(stepTownMovement);
}
// ===== 城镇地图结束 =====

function fight(monster){
  if(!monster){
    alert("没有遇到怪物。");
    return;
  }

  let round = 1;
  const MAX_ROUNDS = 99;
  while(monster.hp > 0 && player.hp > 0 && round <= MAX_ROUNDS){
    const playerDmg = calcDamage(player.atk, monster.def, 1);
    monster.hp -= playerDmg;
    alert(`[第${round}回合] 你攻击 ${monster.name}(Lv.${monster.level}) -${playerDmg}，怪物剩余HP: ${Math.max(0, monster.hp)}`);
    if(monster.hp <= 0) break;

    const enemyDmg = calcDamage(monster.atk, player.def, 1);
    player.hp -= enemyDmg;
    alert(`${monster.name} 反击你 -${enemyDmg}，你剩余HP: ${Math.max(0, player.hp)}`);
    round++;
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
    alert(`击败 ${monster.name}！共 ${round} 回合。获得 EXP ${exp} / Gold ${gold}`);
    gainExp(exp);
    rollDrop(monster.dropTable);
    updateInventory();
  }

  updateHUD();
}

updateExp();

function findLoot(){
  rollDrop("forest_common");
  updateInventory();
}

function openTownShop(){
  forestState.active = false;
  lavaState.active = false;
  document.getElementById("forestExplorer").style.display = "none";
  scene.innerHTML=`商店（位置：靠近城镇右侧森林入口）<br>
  <button onclick="promptPurchase('木剑',30)">木剑（30G）</button>
  <button onclick="promptPurchase('铁剑',80)">铁剑（80G）</button>
  <button onclick="promptPurchase('钢剑',150)">钢剑（150G）</button><br>
  <button onclick="promptPurchase('布甲',30)">布甲（30G）</button>
  <button onclick="promptPurchase('铁甲',80)">铁甲（80G）</button>
  <button onclick="promptPurchase('骑士甲',150)">骑士甲（150G）</button><br>
  <button onclick="promptPurchase('血药',20)">血药（20G）</button>
  <button onclick="promptPurchase('蓝药',20)">蓝药（20G）</button><br>
  <small>提示：背包中点击血药/蓝药可立即使用。</small><br>
  <button onclick="goTown()">返回城镇地图</button>`;
}

function goTown(){
  forestState.active = false;
  lavaState.active = false;
  document.getElementById("forestExplorer").style.display = "none";
  startTownExploration();
}

function goForest(){
  startForestExploration();
}

function goLava(){
  startLavaExploration();
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
