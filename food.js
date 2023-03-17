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

class Melon extends Food {
  //unfinihsed
}
