let player = {
  hp: 100,
  mp: 50,
  gold: 100,
  inventory: []
};

function updateHUD() {
  document.getElementById("hp").innerText = "HP: " + player.hp;
  document.getElementById("mp").innerText = "MP: " + player.mp;
  document.getElementById("gold").innerText = "Gold: " + player.gold;
}

function updateInventory() {
  const list = document.getElementById("items");
  list.innerHTML = "";
  player.inventory.forEach(item => {
    let li = document.createElement("li");
    li.innerText = item;
    list.appendChild(li);
  });
}

function goTown() {
  document.getElementById("scene").innerText = "你来到城镇，可以购买装备。";
}

function goForest() {
  document.getElementById("scene").innerText = "你进入森林，黑暗中似乎有东西盯着你……";
  scare();
}

function goLava() {
  document.getElementById("scene").innerText = "你踏入熔岩洞，空气炽热，危险逼近。";
}

function scare() {
  alert("突然出现一张恐怖的脸！！！");
}

updateHUD();
updateInventory();
