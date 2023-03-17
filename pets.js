class Pet {
  constructor(attack, health, baseAttack, baseHealth, tier, cost, level, stack, player, name, position) {
    this.attack = attack;
    this.health = health;
    this.baseAttack = baseAttack;
    this.baseHealth = baseHealth;
    this.position = position
    this.tier = tier;
    this.cost = cost;
    this.level = level;
    this.stack = stack;
    this.player = player;
    this.name = name;
    this.food = "";
    this.postDeathAbility = false;
    this.lvl1Ability = null;
    this.lvl2Ability = null;
    this.lvl3Ability = null;
    this.activeAbility = null;
    this.id = getUniqueID();
    if (this.health < 0 || this.attack < 0) {
      this.resetStats();
    }
  }

  setAbility(ability) {
    this.activeAbility = ability;
  }

  changeHealth(amount) {
    this.health += amount;
    if (this.health <= 0) {
      this.die();
      this.player.removePet(this);
      this.stack.removeActivePet(this, this.player);
    } else if (amount < 0) {
      this.hurt();
    } else if (this.health > 50) {
      this.health = 50;
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

  changeStats(attack, health) {
    this.changeAttack(attack);
    this.changeHealth(health);
  }

  resetStats() {
    this.health = baseHealth;
    this.attack = baseAttack;
  }

  getPosition() {
    return this.player.getPetPosition(this);
  }

  getOpponent() {
    return this.stack.getOpponent(this.player.id);
  }

  getRandomFriendlyPet() {
    return this.player.getRandomPet([this]);
  }

  ability(params, ability = this.activeAbility) {
    this.stack.push(ability, params, this);
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

//tier 1
class Sloth extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 1, 1, 1, cost, level, stack, player, "Sloth", position);
    this.lvl1Ability = (p)=>{};
    this.lvl2Ability = (p)=>{};
    this.lvl3Ability = (p)=>{};
    this.activeAbility = this.lvl1Ability;
  }
}

class Ant extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 2, 1, 1, cost, level, stack, player, "Ant", position);
    this.postDeathAbility = true;
    this.lvl1Ability = (p)=>{this.getRandomFriendlyPet().changeStats(2, 1);};
    this.lvl2Ability = (p)=>{this.getRandomFriendlyPet().changeStats(4, 2);};
    this.lvl3Ability = (p)=>{this.getRandomFriendlyPet().changeStats(6, 3);};
    this.activeAbility = this.lvl1Ability;
  }

  die() {
    this.ability();
  }
}

class Cricket extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 1, 2, 1, cost, level, stack, player, "Cricket", position);
    this.postDeathAbility = true;
    this.lvl1Ability = (p)=> {
      this.player.addPet(
        new Pet(1, 1, 1, 1, 1, 3, 1, this.stack, this.player, "Cricket", this.position)
      );
    };
    this.lvl2Ability = (p)=> {
      this.player.addPet(
        new Pet(2, 2, 2, 2, 1, 3, 1, this.stack, this.player, "Cricket", this.position)
      );
    };
    this.lvl3Ability = (p)=> {
      this.player.addPet(
        new Pet(3, 3, 3, 3, 1, 3, 1, this.stack, this.player, "Cricket", this.position)
      );
    };
    this.activeAbility = this.lvl1Ability;
  }

  die() {
    this.ability();
  }
}

class Fish extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 2, 2, 1, cost, level, stack, player, "Cricket", position);
    //unfinished
    this.postDeathAbility = true;
    this.lvl1Ability = (p)=>{};
    this.lvl2Ability = (p)=>{};
    this.lvl3Ability = (p)=>{};
    this.activeAbility = this.lvl1Ability;
  }
}

//tier 2
class Rat extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 4, 5, 2, cost, level, stack, player, "Rat", position);
    this.postDeathAbility = true;
    this.lvl1Ability = (p)=> {
      this.getOpponent().addToFront(
        new Pet(1, 1, 1, 1, 1, 3, 1, this.stack, this.getOpponent(), "Dirty Rat", this.position)
      );
    };
    this.lvl2Ability = (p)=> {
      this.getOpponent().addToFront(
        new Pet(1, 1, 1, 1, 1, 3, 1, this.stack, this.getOpponent(), "Dirty Rat", this.position)
      );
      this.getOpponent().addToFront(
        new Pet(1, 1, 1, 1, 1, 3, 1, this.stack, this.getOpponent(), "Dirty Rat", this.position)
      );
    };
    this.lvl3Ability = (p)=> {
      this.getOpponent().addToFront(
        new Pet(1, 1, 1, 1, 1, 3, 1, this.stack, this.player, "Dirty Rat", this.position)
      );
      this.getOpponent().addToFront(
        new Pet(1, 1, 1, 1, 1, 3, 1, this.stack, this.player, "Dirty Rat", this.position)
      );
      this.getOpponent().addToFront(
        new Pet(1, 1, 1, 1, 1, 3, 1, this.stack, this.player, "Dirty Rat", this.position)
      );
    };
    this.activeAbility = this.lvl1Ability;
  }

  die() {
    this.ability();
  }
}

class Flamingo extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 4, 2, 2, cost, level, stack, player, "Flamingo", position);
    this.postDeathAbility = true;
    this.lvl1Ability = (p)=>{this.player.getNextPets(this.position, 2).forEach((item, i) => {
      item.changeStats(1,1);
    })};
    this.lvl2Ability = (p)=>{this.player.getNextPets(this.position, 2).forEach((item, i) => {
      item.changeStats(2,2);
    })};
    this.lvl3Ability = (p)=>{this.player.getNextPets(this.position, 2).forEach((item, i) => {
      item.changeStats(3,3);
    })};
    this.activeAbility = this.lvl1Ability;
  }

  die() {
    this.ability();
  }
}

class Peacock extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 2, 6, 3, cost, level, stack, player, "Peacock", position);
    this.lvl1Ability = (p)=>{this.changeAttack(4)};
    this.lvl2Ability = (p)=>{this.changeAttack(8)};
    this.lvl3Ability = (p)=>{this.changeAttack(12)};
    this.activeAbility = this.lvl1Ability;
  }

  hurt() {
    this.ability();
  }
}

//tier 3
class Blowfish extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 3, 5, 3, cost, level, stack, player, "Blowfish", position);
    this.lvl1Ability = (p)=>{this.getOpponent().getRandomPet().changeHealth(-2);};
    this.lvl2Ability = (p)=>{this.getOpponent().getRandomPet().changeHealth(-4);};
    this.lvl3Ability = (p)=>{this.getOpponent().getRandomPet().changeHealth(-6);};
    this.activeAbility = this.lvl1Ability;
  }

  hurt() {
    this.ability();
  }
}

class Camel extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 2, 6, 3, cost, level, stack, player, "Camel", position);
    this.lvl1Ability = (p)=>{this.player.getNextPets(this.position, 1).forEach((item, i) => {
      item.changeStats(2,2);
    })};
    this.lvl2Ability = (p)=>{this.player.getNextPets(this.position, 1).forEach((item, i) => {
      item.changeStats(4,4);
    })};
    this.lvl3Ability = (p)=>{this.player.getNextPets(this.position, 1).forEach((item, i) => {
      item.changeStats(6,6);
    })};
    this.activeAbility = this.lvl1Ability;
  }

  hurt() {
    this.ability();
  }
}

class Hedgehog extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 3, 2, 2, cost, level, stack, player, "Hedgehog", position);
    this.postDeathAbility = true;
    this.lvl1Ability = (p)=>{p.changeHealth(-2);};
    this.lvl2Ability = (p)=>{p.changeHealth(-4);};
    this.lvl3Ability = (p)=>{p.changeHealth(-6);};
    this.activeAbility = this.lvl1Ability;
  }

  die() {
    this.stack.getAllPets().forEach((item, i) => {
      this.ability(null, ()=>{this.activeAbility(item)});
    });
  }
}

//tier 4
class Turtle extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 2, 5, 4, cost, level, stack, player, "Turtle", position);
    this.lvl1Ability = (p)=>{this.player.getNextPets(this.position, 1).forEach((item, i) => {
      item.eat(new Melon());
    })};
    this.lvl2Ability = (p)=>{this.player.getNextPets(this.position, 2).forEach((item, i) => {
      item.eat(new Melon());
    })};
    this.lvl3Ability = (p)=>{this.player.getNextPets(this.position, 3).forEach((item, i) => {
      item.eat(new Melon());
    })};
    this.activeAbility = this.lvl1Ability;
  }

  hurt() {
    this.ability();
  }
}

//tier 6
class Mammoth extends Pet {
  constructor(attack, health, cost, level, stack, player, position) {
    super(attack, health, 3, 10, 6, cost, level, stack, player, "Mammoth", position);
    this.postDeathAbility = true;
    this.lvl1Ability = (p)=>{this.player.getAllPets().forEach((item, i) => {
      item.changeStats(2, 2);
    })};
    this.lvl2Ability = (p)=>{this.player.getAllPets().forEach((item, i) => {
      item.changeStats(4, 4);
    })};
    this.lvl3Ability = (p)=>{this.player.getAllPets().forEach((item, i) => {
      item.changeStats(6, 6);
    })};
    this.activeAbility = this.lvl1Ability;
  }

  die() {
    this.ability();
  }
}
