class Shop {
  constructor(renderer) {
    this.pets = {};
    this.tier = 1;
    this.frozen = new Set();
    this.petSlotMap = {
      1: 3,
      2: 3,
      3: 4,
      4: 4,
      5: 5,
      6: 5
    }
    this.foodSlotMap = {
      1: 1,
      2: 2,
      3: 2,
      4: 2,
      5: 2,
      6: 2
    }
    this.petSlots = this.petSlotMap[this.tier];
    this.foodSlots = this.foodSlotMap[this.tier];
    this.round = 0;
    this.allPets = [
      //tier 1
      [Cricket, Ant, Sloth, Fish],
      //tier 2
      [Rat, Flamingo, Peacock],
      //tier 3
      [],
      //tier 4
      [],
      //tier 5
      [],
      //tier 6
      []
    ];
    this.updatePetSlots();
  }

  addRenderer(renderer) {
    this.renderer = renderer;
  }

  buy(petFunc, player, position) {
    //unfinished
    let pet = new petFunc();
    player.addPet(pet)
  }

  updatePetSlots() {
    let slotNumber = this.petSlotMap[this.tier];
    let newPets = {};
    for(let i = 0; i < slotNumber; i++) {
      newPets[i] = null;
    }
    this.pets = newPets;
  }

  toggleFreeze(position) {
    if (this.frozen.has(position)) {
      this.frozen.delete(position);
    } else {
      this.frozen.add(position);
    }
  }

  //from stackoverflow.com/questions/17891173/how-to-efficiently-randomly-select-array-item-without-repeats
  randomNoRepeats(array, rand) {
    var copy = array.slice(0);
    return function() {
      if (copy.length < 1) { copy = array.slice(0); }
      var index = Math.floor(rand() * copy.length);
      var item = copy[index];
      copy.splice(index, 1);
      return item;
    };
  }

  //maybe shouldn't use random every pet, but every roll?
  getRandomPet(tier, rand) {
    let petList = this.allPets[tier - 1];
    return petList[Math.floor(rand() * petList.length)];
  }

  roll(rand) {
    let newPets = [];
    let slotNumber = this.petSlotMap[this.tier];
    for (let i = 0; i < slotNumber; i++) {
      let pet = this.getRandomPet(this.tier, rand);
      pet = new pet(-1, -1, 3, -1, this.stack, null, -1);
      newPets.push(pet);
      this.pets[i] = pet;
    }
    this.renderer.renderShop();
    return this.pets;
  }
}
