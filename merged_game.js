// 合并最终版
let player={hp:100,mp:50,gold:100,atk:10,def:5,inventory:[],weapon:null,armor:null};
function updateHUD(){hp.innerText='HP:'+player.hp;mp.innerText='MP:'+player.mp;gold.innerText='Gold:'+player.gold;atk.innerText=' ATK:'+player.atk;def.innerText=' DEF:'+player.def;}
function updateInventory(){items.innerHTML='';player.inventory.forEach(item=>{let li=document.createElement('li');li.innerText=item;li.onclick=()=>equip(item);items.appendChild(li);});}
function equip(item){if(item.includes('剑')){if(player.weapon)player.atk-=10;player.weapon=item;player.atk+=10;weaponSlot.innerText=item;}if(item.includes('甲')){if(player.armor){player.def-=5;player.hp-=20;}player.armor=item;player.def+=5;player.hp+=20;armorSlot.innerText=item;}updateHUD();updateCharacter();}
function updateCharacter(){let c='🙂';if(player.weapon)c='🗡️'+c;if(player.armor)c='🛡️'+c;character.innerText=c;}
function openEquip(){equipPanel.style.display='block';}
function buy(item,price){if(player.gold>=price){player.gold-=price;player.inventory.push(item);updateInventory();updateHUD();}}
function fight(enemy){let dmg=Math.max(1,Math.floor(Math.random()*15)-player.def);player.hp-=dmg;alert(enemy+'攻击-'+dmg);if(enemy==='黑龙')player.inventory.push('圣剑');updateHUD();}
function goTown(){scene.innerHTML=`商店<br><button onclick="buy('木剑',30)">木剑</button><button onclick="buy('铁剑',80)">铁剑</button><button onclick="buy('钢剑',150)">钢剑</button><br><button onclick="buy('布甲',30)">布甲</button><button onclick="buy('铁甲',80)">铁甲</button><button onclick="buy('骑士甲',150)">骑士甲</button>`;}
function goForest(){fight(['哥布林','史莱姆','猫妖','狐妖'][Math.floor(Math.random()*4)]);}function goLava(){fight(['骷髅','僵尸','蝙蝠妖','黑龙'][Math.floor(Math.random()*4)]);}updateHUD();updateInventory();