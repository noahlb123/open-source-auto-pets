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

class Player {
  constructor(name) {
    //remember this cannot refer to stack
    this.id = getUniqueID();
    this.name = name;
    this.gold = 10;
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

  listPositions() {
    return Array.from(this.petPositions);
  }

  listPositionsExcept(exceptions) {
    let newPos = new Set(this.petPositions);
    exceptions.forEach((item, i) => {
      newPos.delete(item);
    });
    return Array.from(newPos);
  }

  getRandomPet(exceptions = []) {
    let badPositions = [];
    exceptions.forEach((item, i) => {
      badPositions.push(item.position);
    });
    let goodPositions = this.listPositionsExcept(badPositions);
    let index = this.randInt(0, goodPositions.length - 1);
    return this.pets[goodPositions[index]];
  }

  getAllPets() {
    return Array.from(this.petSet);
  }

  getAllPetsExcept(positionExceptions) {
    let positions = this.listPositionsExcept(positionExceptions);
    let output = [];
    positions.forEach((pos, i) => {
      let pet = this.pets[pos];
      if (pet) {
        output.push(pet);
      }
    });
    return output;
  }

  getNextPets(position, numberPets = 1, direction = 1) {
    let output = [];
    for (let i = 1; i < numberPets + 1; i++) {
      let petIndex = position + direction * i;
      if (this.petPositions.has(petIndex)) {
        output.push(this.pets[petIndex]);
      }
    }
    return output;
  }

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  randIntSeed(min, max) {
    return Math.floor(this.rand() * (max - min) + min);
  }

  swapPetPos(pos1, pos2) {
    let pet1 = ((!!this.pets[pos1]) ? this.pets[pos1] : null);
    let pet2 = ((!!this.pets[pos2]) ? this.pets[pos2] : null);
    let id1 = ((!!pet1) ? pet1.id : null);
    let id2 = ((!!pet2) ? pet2.id : null);
    this.pets[pos2] = pet1;
    this.pets[pos1] = pet2;
    this.petPositions.add(pos1);
    this.petPositions.add(pos2);
    if (!!id1) {
      this.inversePets[id1] = pos2;
      pet1.position = pos2;
    } else {
      this.petPositions.delete(pos2);
    }
    if (!!id2) {
      this.inversePets[id2] = pos1;
      pet2.position = pos1;
    } else {
      this.petPositions.delete(pos1);
    }
  }

  //may need more error handeling here
  addPet(pet) {
    if (this.petNumber <= 5) {
      let position = pet.position;
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
  }

  addToFront(pet) {
    let n = 5;
    if (this.petNumber < n) {
      let iterations = n ** 2;
      for (let c = 0; c < iterations; c++) {
        let index = n - 1;
        while (index >= 1) {
          let pet = this.pets[index];
          let nextPet = this.pets[index - 1];
          if (!pet && !!nextPet) {
            this.swapPetPos(index, index - 1);
          }
          index--;
        }
      }
      pet.position = 0;
      this.addPet(pet);
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
  constructor(player1, player2, shop) {
    this.player1 = player1;
    this.player2 = player2;
    this.shop = shop;
    this.stackEmpty = true;
    this.internalStack = [];
    this.gameHappening = false;
    this.id = getUniqueID();
    this.renderer = new TableRenderer(
      "game-table", "shop-table", "terminal", player1, player2, this, this.shop
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
    this.inverseActivePets = {};
    //this.renderer.renderShop();
  }

  push(func, params, pet = null) {
    this.internalStack.push([func, params, pet]);
    this.stackEmpty = false;
  }

  pop() {
    let [func, params, pet] = this.internalStack.pop();
    if (this.petCanDoAbility(pet)) {
      func(params);
    }
    if (this.internalStack.length == 0) {
      this.stackEmpty = true;
    }
    console.log("ability resolved");
  }

  petCanDoAbility(pet) {
    if (pet) {
      return (pet.health >= 0) || pet.postDeathAbility;
    } else {
      return false;
    }
  }

  getAllPets() {
    return this.player1.getAllPets().concat(this.player2.getAllPets());
  }

  getOpponent(playerID) {
    return this.opponentMap[playerID];
  }

  autoActivePet(player) {
    if (player.petNumber == 0) {
      //need to fix this for if 2 players lose at same time
      this.gameHappening = false;
    } else {
      let positions = player.petPositions;
      let minPos = Math.min.apply(this, [...positions]);
      let frontPet = player.pets[minPos];
      this.setActivePet(frontPet, player);
    }
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
    } if (this.gameHappening) {
      this.autoActivePet(this.player1);
      this.autoActivePet(this.player2);
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


//initialize instances
var player1 = new Player("Player1");
var player2 = new Player("Player2");
var shop = new Shop();
var stack = new GameStack(player1, player2, shop);
shop.addRenderer(stack.renderer);
shop.roll(player1.rand);
player1.addToFront(new Sloth(1, 6, 3, 1, stack, player1, -1));
player2.addPet(new Sloth(1, 1, 3, 1, stack, player2, 1));
player2.addPet(new Sloth(1, 1, 3, 1, stack, player2, 2));
player2.addPet(new Mammoth(1, 1, 3, 1, stack, player2, 0));

stack.initializeCombat();
stack.renderer.renderAll();

let button = document.getElementById("step-button");
button.addEventListener("click", (e) => {stack.fightStep();});

//to do
//make shop hold pets as instances rather than class functions
//finish shop buy functions
//separate pet data structure 2: into in combat and outside, instead I could set base stats
//sloth vs rat sloth gives error
//fix win conditinos
//fix addtofront so it doesnt push other pets to back
//badger rounds down
