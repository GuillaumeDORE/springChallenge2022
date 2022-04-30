class Entity  {
    constructor (id, type, x, y, shieldLife, isControlled, health, vx, vy, nearBase, threatFor, me) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.shieldLife = shieldLife;
        this.isControlled = isControlled;
        this.health = health;
        this.vx = vx;
        this.vy = vy;
        this.nextX = x+ vx;
        this.nextY = y+ vy;
        this.nearBase = nearBase;
        this.threatFor = threatFor;
        this.targetId = -1;
        this.me = me;
        this.TYPE_MONSTER = 0;
        this.TYPE_MY_HERO = 1;
        this.TYPE_OTHER_HERO = 2;
        this.MY_BASE = 1;
        this.OTHER_BASE = 2;
        this.isDangerousForMyBase = function () {
            return this.threatFor === this.MY_BASE;
        };
        this.getDistanceFrom = function (x, y) {
            return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
        };
        this.distanceFromMyBase = this.getDistanceFrom(this.me.basePosX, this.me.basePosY);
    }
}

class Player  {
    constructor (basePosX, basePosY, baseHealth, mana) {
        var _this = this;
        this.basePosX = basePosX;
        this.basePosY = basePosY;
        this.baseHealth = baseHealth;
        this.mana = mana;
        this.setHealth = function (value) {
            _this.baseHealth = value;
        };
        this.setMana = function (value) {
            _this.mana = value;
        };
        this.canCast = function () {
            return _this.mana >= 10;
        };
    }
}

class Game {
    constructor (baseX, baseY, heroes) {
        this.heroes = heroes;
        this.ACTION_WAIT = "WAIT";
        this.ACTION_MOVE = "MOVE";
        this.ACTION_SPELL = "SPELL";
        this.SPELL_WIND = "WIND";
        this.SPELL_CONTROL = "CONTROL";
        this.SPELL_SHIELD = "SHIELD";
        this.newTurn = function (health, mana, enemyHealth, enemyMana) {
            this.me.setHealth(health);
            this.me.setMana(mana);
            this.enemy.setHealth(enemyHealth);
            this.enemy.setMana(enemyMana);
            this.entities = [];
        };

        this.addEntity = function (entity) {
            this.entities.push(entity);
            if (entity.type === 1) this.heroes.push(entity)
        };
       
        this.me = new Player(baseX, baseY, 3, 0);
        this.enemy = new Player(baseX === 0 ? 17630 : 0, baseY === 0 ? 9000 : 0, 3, 0);
        this.entities = [];
        this.heroes = [];
        this.entitiesToTarget = [];
    }

    nextAction (hero) {
        // In the first league: MOVE <x> <y> | WAIT; In later leagues: | SPELL <spellParams>;
        //identifies dangerous monsters
        this.entities.forEach((e)=>{
            if(e.type === e.TYPE_MONSTER && e.isDangerousForMyBase()) {
                this.entitiesToTarget.push(e)
                this.entitiesToTarget.sort((a,b)=>a.distanceFromMyBase-b.distanceFromMyBase)
            }
        })
        //clear dead monsters
        this.entitiesToTarget = this.entitiesToTarget.filter(
            (e) => this.entities.some(
                (f) => f.id === e.id
            )
        )

        if(this.entitiesToTarget.length > 0){
            const targetId = this.heroes[hero].targetId
            console.error('targetId of '+hero+' : '+targetId)

            const moveToFirstMonster = () => {
                //je veux récupérer l'id de la premiere entitie_to_target non target par un heros
                //si il n'existe pas de monstre non ciblé : on target le premier de la liste
                let allEntitiesAreTargeted = true
                this.entitiesToTarget.forEach(e => { 
                    let entitieNotTargeted = true
                    for(let i = 0 ; i< this.heroes.length ; i++){
                        if (this.heroes[i].targetId === e.id) {
                            entitieNotTargeted = false
                            break;
                        }
                    }
                    if(entitieNotTargeted){
                        allEntitiesAreTargeted = false
                        this.heroes[hero].targetId = e.id
                    }
                })
                if (allEntitiesAreTargeted) {
                    this.heroes[hero].targetId = this.entitiesToTarget[0].id
                }
                const firstMonsterIndex =  this.entitiesToTarget.findIndex(e => e.id === this.heroes[hero].targetId)
                return this.ACTION_MOVE+' '+this.entitiesToTarget[firstMonsterIndex].nextX+' '+this.entitiesToTarget[firstMonsterIndex].nextY
            }

            const moveToTarget = () => {
                const idx = this.entitiesToTarget.findIndex(e => e.id === targetId)
                return this.ACTION_MOVE+' '+this.entitiesToTarget[idx].nextX+' '+this.entitiesToTarget[idx].nextY
            }

            if(targetId !== -1){ //si le hero target un monstre
                if(!this.entities.some(e=>e.id === targetId)) { //check si target id est encore en vie
                    this.heroes[hero].targetId = -1
                    return moveToFirstMonster()
                } else{
                    return moveToTarget()
                }
            } else { //si le hero est dispo
                return moveToFirstMonster()
            }
        }
        return this.ACTION_WAIT //si pas de monstre dangereux
    };
    
    debug (...message) {
        console.error(...message);
    };
}


var _a = readline().split(" ").map(Number), baseX = _a[0], baseY = _a[1]; // The corner of the map representing your base
var heroesPerPlayer = Number(readline()); // Always 3
var game = new Game(baseX, baseY, heroesPerPlayer);

// game loop
while (true) {
    var myBaseInput = readline().split(" ").map(Number);
    var enemyBaseInput = readline().split(" ").map(Number);
    game.newTurn(myBaseInput[0], myBaseInput[1], enemyBaseInput[0], enemyBaseInput[1]);

    var entityCount = Number(readline()); // Amount of heros and monsters you can see
    for (var i = 0; i < entityCount; i++) {
        var inputs = readline().split(" ").map(Number);
        game.addEntity(new Entity(inputs[0], // Unique identifier
        inputs[1], // 0=monster, 1=your hero, 2=opponent hero
        inputs[2], // Position of this entity
        inputs[3],
        inputs[4], // Ignore for this league; Count down until shield spell fades
        inputs[5], // Ignore for this league; Equals 1 when this entity is under a control spell
        inputs[6], // Remaining health of this monster
        inputs[7], // Trajectory of this monster
        inputs[8],
        inputs[9], // 0=monster with no target yet, 1=monster targeting a base
        inputs[10], // Given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither
        game.me));
    }
    for (var i = 0; i < heroesPerPlayer; i++) {
        console.log(game.nextAction(i));
    }
}