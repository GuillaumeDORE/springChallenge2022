let inputs = readline().split(' ');
const baseX = parseInt(inputs[0]); // The corner of the map representing your base
const baseY = parseInt(inputs[1]);
const heroesPerPlayer = parseInt(readline()); // Always 3

let arrEntity = [];//Array of object:all the entity and their params
let waitPosBaseX;
let waitPosBaseY;
let oppBaseX;
let oppBaseY;
if(baseX==0){
    waitPosBaseX = 4000;
    waitPosBaseY = 3000;
    oppBaseX = 17630;
    oppBaseY = 9000;
}else{
    waitPosBaseX = 13630;
    waitPosBaseY = 5000;
    oppBaseX = 0;
    oppBaseY = 0;
}
// game loop
while (true) {
    let mana = 0;
    for (let i = 0; i < 2; i++) {
        let inputs = readline().split(' ');
        const health = parseInt(inputs[0]); // Each player's base health
        mana = parseInt(inputs[1]); // Ignore in the first league; Spend ten mana to cast a spell

        //----peut être interresant pour s'améliorer de passer en mode defense sous un certain % de vie----
    }
    const entityCount = parseInt(readline()); // Amount of heros and monsters you can see

    let targets = [];// Array of target
    let heros = [];// Array of heros
    let heroCounter = 0;

    //Itterate to create array of entity
    for (let i = 0; i < entityCount; i++) {
        let inputs = readline().split(' ');
        const id = parseInt(inputs[0]); // Unique identifier
        const type = parseInt(inputs[1]); // 0=monster, 1=your hero, 2=opponent hero
        const x = parseInt(inputs[2]); // Position of this entity
        const y = parseInt(inputs[3]);
        const shieldLife = parseInt(inputs[4]); // Ignore for this league; Count down until shield spell fades
        const isControlled = parseInt(inputs[5]); // Ignore for this league; Equals 1 when this entity is under a control spell
        const health = parseInt(inputs[6]); // Remaining health of this monster
        const vx = parseInt(inputs[7]); // Trajectory of this monster
        const vy = parseInt(inputs[8]);
        const nearBase = parseInt(inputs[9]); // 0=monster with no target yet, 1=monster targeting a base
        const threatFor = parseInt(inputs[10]); // Given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither
        
        //projected position
        let nextX = x + vx;
        let nextY = y + vy;
        let nextXY = nextX + nextY;
        let waitPosX;
        let waitPosY;
        let entity = { id, type, x, y, shieldLife, isControlled, health, vx, vy, nearBase, threatFor, nextX, nextY, nextXY };//entity with all params

        //Assignated wait pos for hero
        if(type==1){
            if(heroCounter==0){
                baseX==0 ? entity.waitPosX = waitPosBaseX + 3500: entity.waitPosX = waitPosBaseX ;
                baseY==0 ? entity.waitPosY = waitPosBaseY : entity.waitPosY = waitPosBaseY - 3500;
                heroCounter++;
            }else if(heroCounter==1){
                baseX==0 ? entity.waitPosX = waitPosBaseX : entity.waitPosX = waitPosBaseX -3500 ;
                baseY==0 ? entity.waitPosY = waitPosBaseY + 3500: entity.waitPosY = waitPosBaseY ;
                heroCounter++;
            }else{
                entity.waitPosX = waitPosBaseX;
                entity.waitPosY = waitPosBaseY; 
            }
        }

        // Creation of array of entity
        arrEntity.push(entity);

        //Creation of array of heros
        if(type==1){
            heros.push(entity);
        };

        // If entity monster and threat for my base push it on targets array
        if( type == 0 && threatFor == 1 ){
            targets.push(entity);
        };
        //sort the array of targets by which one is the nearest of the base
        baseX == 0 ? targets.sort((a, b) => a.nextXY - b.nextXY ) : targets.sort((a, b) => b.nextXY - a.nextXY );

    }

//GESTION DES HEROES----------------------------------------------------------------------------------------------------------------------


    for (let i = 0; i < heroesPerPlayer; i++) {
        // In the first league: MOVE <x> <y> | WAIT; In later leagues: | SPELL <spellParams>;

        // Don't move if no target
        if(targets.length==0){
            console.log('MOVE '+ heros[i].waitPosX + ' ' + heros[i].waitPosY );

        }else{
            //try to launch a controle spell
            if(mana > 10 && targets[0].nearBase ==1 && targets[0].threatFor == 1){
                console.log('SPELL CONTROLE ' + targets[0].id + ' ' + oppBaseX + ' ' + oppBaseY);
                console.error(targets);
                targets.push(targets.shift()); 
                console.error(targets);
            }else{
                // Move to enemy who is a threat for my base 
                console.log('MOVE '+ targets[0].nextX + ' ' + targets[0].nextY );
            }            
        }
    }
    arrEntity = [];
    target = [];
    heroCounter = 0;
}
