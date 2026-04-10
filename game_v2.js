// 新版本逻辑
let player = {
  hp: 100,
  mp: 50,
  gold: 100,
  inventory: []
};

function updateHUD() {
  hp.innerText = "HP: " + player.hp;
  mp.innerText = "MP: " + player.mp;
  gold.innerText = "Gold: " + player.gold;
}

function updateInventory() {
  items.innerHTML = "";
  player.inventory.forEach(item => {
    let li = document.createElement("li");
    li.innerText = item;
    items.appendChild(li);
  });
}

function buy(item, price) {
  if (player.gold >= price) {
    player.gold -= price;
    player.inventory.push(item);
    updateHUD();
    updateInventory();
  } else {
    alert("没钱");
  }
}

function fight(enemy) {
  let damage = Math.floor(Math.random() * 15);
  player.hp -= damage;
  alert(enemy + "攻击你，-" + damage);

  if (Math.random() < 0.4) findLoot();

  if (enemy === "黑龙") {
    player.inventory.push("圣剑");
    alert("掉落：圣剑");
  }

  updateHUD();
}

function findLoot() {
  let loot = ["血药", "蓝药", "银宝箱", "金宝箱", "妖精盔甲"];
  let item = loot[Math.floor(Math.random() * loot.length)];
  player.inventory.push(item);
  alert("获得" + item);
  updateInventory();
}

function goTown() {
  scene.innerHTML = `城镇<br>
  <button onclick="buy('木剑',30)">木剑</button>
  <button onclick="buy('铁剑',80)">铁剑</button>
  <button onclick="buy('钢剑',150)">钢剑</button><br>
  <button onclick="buy('布甲',30)">布甲</button>
  <button onclick="buy('铁甲',80)">铁甲</button>
  <button onclick="buy('骑士甲',150)">骑士甲</button><br>
  <button onclick="buy('血药',20)">血药</button>
  <button onclick="buy('蓝药',20)">蓝药</button>`;
}

function goForest() {
  scene.innerText = "迷之森林";
  scare();
  let enemies = ["哥布林", "史莱姆", "猫妖", "狐妖"];
  fight(enemies[Math.floor(Math.random() * enemies.length)]);
}

function goLava() {
  scene.innerText = "深渊熔核";
  let enemies = ["骷髅", "僵尸", "蝙蝠妖", "黑龙"];
  fight(enemies[Math.floor(Math.random() * enemies.length)]);
}

function scare() {
  alert("突脸！！！");
}

function checkEnding() {
  if (player.inventory.includes("妖精盔甲") && player.inventory.includes("圣剑")) {
    alert("真结局：骑士");
  } else {
    alert("普通结局：勇者");
  }
}

updateHUD();
updateInventory();