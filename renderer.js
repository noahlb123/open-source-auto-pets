class TableRenderer {
  constructor(tableID, shopTableID, termID, player1, player2, stack, shop) {
    this.tableID = tableID;
    this.shopTableID = shopTableID;
    this.termID = termID;
    this.stack = stack;
    this.term = document.getElementById(termID);
    this.setTermListener( (e) => {
      if (e.key == "Enter") {
        e.preventDefault();
        this.termMap[this.term.value.toLowerCase()]();
        this.term.value = "";
    }});
    this.table = document.getElementById(tableID);
    this.shopTable = document.getElementById(shopTableID);
    this.player1 = player1;
    this.player2 = player2;
    this.pets1 = player1.pets;
    this.pets2 = player2.pets;
    this.shop = shop;
    this.heading = this.table.rows[0].children;
    this.shopNameRow = document.getElementById("shop-name");
    this.shopStatRow = document.getElementById("shop-stats");
    this.shopTierRow = document.getElementById("shop-tier");
    this.shopBuyRow = document.getElementById("shop-buy");
    this.shopFreezeRow = document.getElementById("shop-freeze");
    this.nameRow = document.querySelector(".name");
    this.names = this.nameRow.children;
    this.nameData = [];
    this.statsRow = document.querySelector(".stats");
    this.stats = this.statsRow.children;
    this.statsData = [];
    this.tierRow = document.querySelector(".tier");
    this.tiers = this.tierRow.children;
    this.tierData = [];
    this.levelRow = document.querySelector(".level");
    this.levels = this.levelRow.children;
    this.levelData = [];
    this.foodRow = document.querySelector(".food");
    this.foods = this.foodRow.children;
    this.foodData = [];
    this.renderHeading();
    this.termMap = {
      "": ()=> {this.stack.fightStep();},
      help: ()=> {console.log(this.termMap)},
      r: ()=> {console.log("roll")}
    };
    this.defaultArtFunc = (pet, attributes) => {return pet[attributes[0]];};
  }

  getTermText() {
    return this.term.value;
  }

  setTermListener(f) {
    this.term.addEventListener("keypress", f);
  }

  renderRowFromCollection(htmlCollection, dataList) {
    for(let i = 1; i < htmlCollection.length; i++) {
      htmlCollection[i].innerHTML = dataList[i - 1];
    }
  }

  renderRowFromList(elmList, dataList) {
    for(let i = 0; i < elmList.length; i++) {
      elmList[i].innerHTML = dataList[i];
    }
  }

  renderHeading() {
    let data = [];
    for(let i = 5; i > 0; i--) {
      data.push(player1.name + ", Pet " + i);
    }
    data.push("blank");
    for(let i = 1; i < 6; i++) {
      data.push(player2.name + ", Pet " + i);
    }
    this.renderRowFromCollection(this.heading, data);
  }

  updateShopStructure() {
    //reset table
    let new_tbody = document.createElement('tbody');
    this.shopNameRow = document.createElement("tr");
    this.shopNameRow.id = "shop-name";
    new_tbody.appendChild(this.shopNameRow);
    this.shopStatRow = document.createElement("tr");
    this.shopStatRow.id = "shop-stats";
    new_tbody.appendChild(this.shopStatRow);
    this.shopTierRow = document.createElement("tr");
    this.shopTierRow.id = "shop-tier";
    new_tbody.appendChild(this.shopTierRow);
    this.shopBuyRow = document.createElement("tr");
    this.shopBuyRow.id = "shop-buy";
    new_tbody.appendChild(this.shopBuyRow);
    this.shopFreezeRow = document.createElement("tr");
    this.shopFreezeRow.id = "shop-freeze";
    //add new information
    let slots = this.shop.petSlots;
    let nameList = [];
    let statList = [];
    let tierList = [];
    let buyList = [];
    let freezeList = [];
    for (let i = 0; i < slots; i++) {
      this.shopNameRow.appendChild(document.createElement("td")).appendChild(document.createElement("p"));
      this.shopStatRow.appendChild(document.createElement("td")).appendChild(document.createElement("p"));
      this.shopTierRow.appendChild(document.createElement("td")).appendChild(document.createElement("p"));
      this.shopBuyRow.appendChild(document.createElement("td")).appendChild(document.createElement("button"));
      this.shopFreezeRow.appendChild(document.createElement("td")).appendChild(document.createElement("button"));
      let nameElm = this.shopNameRow.children[i].children[0];
      let statElm = this.shopStatRow.children[i].children[0];
      let tierElm = this.shopTierRow.children[i].children[0];
      let buyElm = this.shopBuyRow.children[i].children[0];
      let freezeElm = this.shopFreezeRow.children[i].children[0];
      buyElm.innerHTML = "Buy";
      freezeElm.innerHTML = "Freeze";
      buyElm.addEventListener("click", (e) => {console.log("buy " + this.shop.pets[i]);});
      freezeElm.addEventListener("click", (e) => {console.log("freeze " + this.shop.pets[i]);});
      nameElm.id = getUniqueID();
      nameList.push(nameElm);
      statList.push(statElm);
      tierList.push(tierElm);
      buyList.push(buyElm);
      freezeList.push(freezeElm);
    }
    new_tbody.appendChild(this.shopFreezeRow);
    this.shopTable.replaceChild(new_tbody, this.shopTable.children[0]);
    this.shopNames = nameList;
    this.shopStats = statList;
    this.shopTier = tierList;
    this.shopBuy = buyList;
    this.shopFreeze = freezeList;
  }

  renderShop() {
    let petObj = this.shop.pets;
    this.updateShopStructure();
    let nameData = this.compileAttribute(["name"], petObj);
    let tierData = this.compileAttribute(["tier"], petObj);
    let statsData = this.compileAttribute(
      ["baseAttack","baseHealth"],
      petObj,
      (pet, attributes) => {
        return pet[attributes[0]] + "/" + pet[attributes[1]]
      }
    );
    this.renderRowFromList(this.shopNames, nameData);
    this.renderRowFromList(this.shopStats, statsData);
    this.renderRowFromList(this.shopTier, tierData);
  }

  compileAttribute(attributes, petObj, f = this.defaultArtFunc, backward = false) {
    let data = [];
    let len = Object.keys(petObj).length;
    for(let i = 0; i < len; i++) {
      let index = ((backward) ? len - 1 - i: i);
      let pet = petObj[index];
      if (typeof pet == "function") {
        pet = new pet(1, 1, 1, 1, null, null, -1);
      }
      if (pet) {
        data.push(f(pet, attributes));
      } else {
        data.push("");
      }
    }
    return data;
  }

  compileBattleAttribute(attributes, f = this.defaultArtFunc) {
    let p1 = this.compileAttribute(attributes, this.pets1, f, true);
    p1.push("");
    let p2 = this.compileAttribute(attributes, this.pets2, f);
    return p1.concat(p2);
  }

  renderAll() {
    this.nameData = this.compileBattleAttribute(["name"]);
    this.tierData = this.compileBattleAttribute(["tier"]);
    this.levelData = this.compileBattleAttribute(["level"]);
    this.foodData = this.compileBattleAttribute(["food"]);
    this.statsData = this.compileBattleAttribute(
      ["attack","health"],
      (pet, attributes) => {
        return pet[attributes[0]] + "/" + pet[attributes[1]]
      }
    );
    this.renderRowFromCollection(this.names, this.nameData);
    this.renderRowFromCollection(this.stats, this.statsData);
    this.renderRowFromCollection(this.tiers, this.tierData);
    this.renderRowFromCollection(this.levels, this.levelData);
    this.renderRowFromCollection(this.foods, this.foodData);
  }
}
