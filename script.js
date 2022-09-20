//following funcitons taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
//hash function
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

//random seed number generator
function mulberry32(seed) {
    return function() {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

//setup random generators
//get initial seed
const input = 1;//prompt("random seed:");

// Create cyrb128 state:
var seed = cyrb128(input);

//function to give unique ids
function idGenarator() {
  var counter = 0;
  return function() {
    var c = counter++;
    return c;
  }
}
var getUniqueID = idGenarator();

class TableRenderer {
  constructor(tableID, termID, player1, player2, stack) {
    this.tableID = tableID;
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
    this.player1 = player1;
    this.player2 = player2;
    this.pets1 = player1.pets;
    this.pets2 = player2.pets;
    this.heading = this.table.rows[0].children;
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
  }

  getTermText() {
    return this.term.value;
  }

  setTermListener(f) {
    this.term.addEventListener("keypress", f);
  }

  renderRow(htmlCollection, dataList) {
    for(let i = 1; i < htmlCollection.length; i++) {
      htmlCollection[i].innerHTML = dataList[i - 1];
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
    this.renderRow(this.heading, data);
  }

  compileAttribute(
    attributes,
    f = (pet, attributes) => {return pet[attributes[0]];}
  ) {
    let data = [];
    for(let i = 0; i < 5; i++) {
      let pet = this.pets1[4 - i];
      if (pet) {
        data.push(f(pet, attributes));
      } else {
        data.push("");
      }
    }
    data.push("");
    for(let i = 0; i < 5; i++) {
      let pet = this.pets2[i];
      if (pet) {
        data.push(f(pet, attributes));
      } else {
        data.push("");
      }
    }
    return data;
  }

  renderAll() {
    this.nameData = this.compileAttribute(["name"]);
    this.tierData = this.compileAttribute(["tier"]);
    this.levelData = this.compileAttribute(["level"]);
    this.foodData = this.compileAttribute(["food"]);
    this.statsData = this.compileAttribute(
      ["attack","health"],
      (pet, attributes) => {
        return pet[attributes[0]] + "/" + pet[attributes[1]]
      }
    );
    this.renderRow(this.names, this.nameData);
    this.renderRow(this.stats, this.statsData);
    this.renderRow(this.tiers, this.tierData);
    this.renderRow(this.levels, this.levelData);
    this.renderRow(this.foods, this.foodData);
    //this.renderRow(this.foods, this.foodData);
  }
}

class Player {
  constructor(name) {
    //remember this cannot refer to stack
    this.id = getUniqueID();
    this.name = name;
    this.gold = 0;
    this.shop = [];
    this.rand = mulberry32(seed[0]);
    this.inversePets = {};
    this.petNumber = 0;
    this.frontPetNum = null;
    this.petPositions = new Set();
    this.petSet = new Set();
    this.pets = {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
    }
  }

  swapPetPos(pos1, pos2) {
    let pet1 = this.pets[pos1];
    let pet2 = this.pets[pos2];
    this.pets[pos1] = pet2;
    this.pets[pos2] = pet1;
    this.inversePets[pet1.id] = pos2;
    this.inversePets[pet2.id] = pos1;
  }

  listPositions() {
    return Array.from(this.petPositions);
  }

  getRandomPet() {
    return this.pets[this.listPositions()[this.randInt(0, this.petPositions.size - 1)]];
  }

  getAllPets() {
    return Array.from(this.petSet);
  }

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  randIntSeed(min, max) {
    return Math.floor(this.rand() * (max - min) + min);
  }

  //may need more error handeling here
  addPet(pet, position) {
    this.pets[position] = pet;
    this.inversePets[pet.id] = position;
    this.petSet.add(pet);
    this.petNumber++;
    this.petPositions.add(position);
    if (this.frontPetNum === null) {
      this.frontPetNum = position;
    } else if (this.frontPetNum > position) {
      this.frontPetNum = position;
    }
  }

  getPetPosition(pet) {
    return this.inversePets[pet.id];
  }

  lose() {
    //I should not do below bec 2 players might lose at same time
    //this.stack.gameHappening = false;
  }

  removePet(pet) {
    let position = this.getPetPosition(pet);
    this.petPositions.delete(position);
    this.petSet.delete(pet);
    this.pets[position] = null;
    delete this.inversePets[pet.id];
    this.petNumber--;
    if (this.petNumber == 0) {
      this.frontPetNum = null;
    } else {
      for (let i = position; i < 5; i++) {
        let newPosition = this.pets[i];
        if (newPosition != null) {
          this.frontPetNum = i;
          break;
        }
      }
    }
  }
}

class GameStack {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.stackEmpty = true;
    this.internalStack = [];
    this.gameHappening = false;
    this.id = getUniqueID();
    this.renderer = new TableRenderer(
      "game-table", "terminal", player1, player2, this
    );
    this.players = {
      1: player1,
      2: player2
    }
    this.activePets = {
      1: null,
      2: null
    }
    this.inversePlayers = Object.fromEntries([
      [player1.id, 1],
      [player2.id, 2]
    ]);
    this.opponentMap = Object.fromEntries([
      [player1.id, player2],
      [player2.id, player1]
    ]);
    this.inverseActivePets = {}
  }

  push(func, playerID, params) {
    this.internalStack.push([func, params]);
    this.stackEmpty = false;
  }

  pop() {
    let [func, params] = this.internalStack.pop();
    func(params);
    if (this.internalStack.length == 0) {
      this.stackEmpty = true;
    }
    console.log("ability resolved");
  }

  getAllPets() {
    return this.player1.getAllPets().concat(this.player2.getAllPets());
  }

  getOpponent(playerID) {
    return this.opponentMap[playerID];
  }

  setActivePet(pet, player) {
    let playerNumber = this.inversePlayers[player.id];
    this.activePets[playerNumber] = pet;
    this.inverseActivePets[pet.id] = playerNumber;
  }

  removeActivePet(pet, player) {
    let playerNumber = this.inversePlayers[player];
    this.activePets[playerNumber] = null;
    if (player.petNumber == 0) {
      //need to fix this for if 2 players lose at same time
      this.gameHappening = false;
    } else {
      let newPetNum = player.frontPetNum;
      if (newPetNum) {
        let newPet = player.pets[newPetNum];
        this.setActivePet(newPet, player);
      } else {
        this.gameHappening = false;
      }
    }
  }

  fightStep() {
    if (!this.stackEmpty) {
      this.pop();
    } else if (this.gameHappening) {
      this.activePets[1].fight(this.activePets[2]);
    }
    this.renderer.renderAll();
  }

  initializeCombat() {
    this.gameHappening = true;
    player1 = this.players[1];
    player2 = this.players[2];
    var leadingPetNum1 = player1.frontPetNum;
    var leadingPetNum2 = player2.frontPetNum;
    var leadingPet1 = player1.pets[leadingPetNum1];
    var leadingPet2 = player2.pets[leadingPetNum2];
    this.setActivePet(leadingPet1, player1);
    this.setActivePet(leadingPet2, player2);
  }
}

class Pet {
  constructor(attack, health, baseAttack, baseHealth, tier, cost, level, stack, player, name) {
    this.attack = attack;
    this.health = health;
    this.baseAttack = baseAttack;
    this.baseHealth = baseHealth;
    this.tier = tier;
    this.cost = cost;
    this.level = level;
    this.stack = stack;
    this.player = player;
    this.name = name;
    this.food = "";
    this.lvl1Ability = null;
    this.lvl2Ability = null;
    this.lvl3Ability = null;
    this.activeAbility = null;
    this.id = getUniqueID();
  }

  setAbility(ability) {
    this.activeAbility = ability;
  }

  changeHealth(amount) {
    if (this.health > 0) {
      this.health += amount;
      if (this.health <= 0) {
        this.player.removePet(this);
        this.stack.removeActivePet(this, this.player);
        this.die();
      } else if (amount < 0) {
        this.hurt();
      } else if (this.health > 50) {
        this.health = 50;
      }
    }
  }

  hurt() {
    //only used for abilities
  }

  die() {
    //only used for abilities
  }

  changeAttack(amount) {
    this.attack += amount;
    if (this.attack > 50) {
      this.attack = 50;
    }
  }

  getPosition() {
    return this.player.getPetPosition(this);
  }

  getOpponent() {
    return this.stack.getOpponent(this.player.id);
  }

  ability(params, ability=this.activeAbility) {
    this.stack.push(ability, params);
    console.log(this.name + " ability triggered");
  }

  fight(pet) {
    console.log(pet.name + " fought " + this.name);
    this.changeHealth(-pet.attack);
    pet.changeHealth(-this.attack);
    //might need line about ability here
  }

  eat(food) {
    food.pet = this;
    food.effect();
  }
}

class Blowfish extends Pet {
  constructor(attack, health, cost, level, stack, player) {
    super(attack, health, 3, 5, 3, cost, level, stack, player, "Blowfish");
    this.lvl1Ability = (p)=>{this.getOpponent().getRandomPet().changeHealth(-2);};
    this.lvl2Ability = (p)=>{this.getOpponent().getRandomPet().changeHealth(-4);};
    this.lvl3Ability = (p)=>{this.getOpponent().getRandomPet().changeHealth(-6);};
    this.activeAbility = this.lvl1Ability;
  }

  hurt() {
    this.ability();
  }
}

class Food {
  constructor(name, cost, effect) {
    this.name = name;
    this.cost = cost;
    this.effect = effect;
    this.pet = null;
  }

  setPet(pet) {
    this.pet = pet;
  }
}

class Apple extends Food {
  constructor() {
    super(
      "Apple",
      3,
      ()=> {
        this.pet.changeAttack(1);
        this.pet.changeHealth(1);
      }
    );
  }
}

class Garlic extends Food {
  constructor() {
    super(
      "Garlic",
      3,
      ()=> {
        this.pet.food = "Garlic";
      }
    );
  }
}

class Hedgehog extends Pet {
  constructor(attack, health, cost, level, stack, player) {
    super(attack, health, 3, 2, 2, cost, level, stack, player, "Hedgehog");
    this.lvl1Ability = (p)=>{p.changeHealth(-2);};
    this.lvl2Ability = (p)=>{p.changeHealth(-4);};
    this.lvl3Ability = (p)=>{p.changeHealth(-6);};
    this.activeAbility = this.lvl1Ability;
  }

  die() {
    console.log("died");
    this.stack.getAllPets().forEach((item, i) => {
      this.ability(null, ()=>{this.activeAbility(item)});
    });
  }
}

//initialize instances
var player1 = new Player("Player1");
var player2 = new Player("Player2");
var stack = new GameStack(player1, player2);
/*for(let i = 0; i < 5; i++) {
  player1.addPet(new Pet(1, 3, 0, 0, 1, 3, 1, stack, player1, i), i);
  player2.addPet(new Pet(1, 3, 0, 0, 1, 3, 1, stack, player2, i), i);
}*/
player1.addPet(new Hedgehog(3, 2, 3, 2, stack, player1), 0);
player1.addPet(new Pet(1, 5, 0, 0, 1, 3, 1, stack, player1, "Na"), 1);
player2.addPet(new Hedgehog(3, 2, 3, 2, stack, player2), 0);
player2.addPet(new Pet(1, 5, 0, 0, 1, 3, 1, stack, player2, "Na"), 1);
player2.addPet(new Blowfish(3, 5, 3, 3, stack, player2), 2);

stack.initializeCombat();
stack.renderer.renderAll();

let button = document.getElementById("step-button");
button.addEventListener("click", (e) => {stack.fightStep();});

console.log("done.");

//to do
//separate pet data structure 2: into in combat and outside, instead I could set base stats
//sop might remove abilities from stack after pet death
