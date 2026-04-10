// 合并最终版本（使用这个替换）
let player = {
  hp:100, mp:50, gold:100,
  atk:10, def:5,
  inventory:[],
  weapon:null,
  armor:null
};

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

function fight(enemy){
  let dmg=Math.max(1,Math.floor(Math.random()*15)-player.def);
  player.hp-=dmg;
  alert(enemy+'攻击你-'+dmg);

  if(Math.random()<0.4) findLoot();

  if(enemy==='黑龙'){
    player.inventory.push('圣剑');
    alert('获得圣剑');
  }

  updateHUD();
}

function findLoot(){
  let loot=['血药','蓝药','银宝箱','金宝箱','妖精盔甲'];
  let item=loot[Math.floor(Math.random()*loot.length)];
  player.inventory.push(item);
  alert('获得'+item);
  updateInventory();
}

function goTown(){
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
  scare();
  fight(['哥布林','史莱姆','猫妖','狐妖'][Math.floor(Math.random()*4)]);
}

function goLava(){
  fight(['骷髅','僵尸','蝙蝠妖','黑龙'][Math.floor(Math.random()*4)]);
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
