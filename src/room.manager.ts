// creeper management
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleCarrier = require('role.carrier');
var roleSigner = require('role.signer');
var roleMiner = require('role.miner');

function refillWorkers(room: Room): void {

    let newName = 'Worker' + Game.time;
    let spawner = room.memory.spawn;
    let roomEnergyCapacity = room.memory.energyCapacity;
    let roomEnergyAvailable = room.memory.energyAvailable;

    // Build only when the room is full of energy
    if (roomEnergyCapacity == roomEnergyAvailable && !spawner.spawning) {
        if (roomEnergyCapacity >= 2000) {
            spawnHarvester(room, spawner, [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], newName);
        }
        if (roomEnergyCapacity >= 1600) {
            spawnHarvester(room, spawner, [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName);
        }
        else if (roomEnergyCapacity >= 1200) {
            spawnHarvester(room, spawner, [WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName);
        }
        else if (roomEnergyCapacity >= 800) {
            spawnHarvester(room, spawner, [WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE], newName);
        }
        else if (roomEnergyCapacity >= 600) {
            spawnHarvester(room, spawner, [WORK, WORK, WORK,
                CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE], newName);
        }
        // Adding 550 because that's the capacity of RCL 2
        else if (roomEnergyCapacity >= 550) {
            spawnHarvester(room, spawner, [WORK, WORK, WORK,
                CARRY, CARRY,
                MOVE, MOVE, MOVE], newName);
        }
        else if (roomEnergyCapacity >= 400) {
            spawnHarvester(room, spawner, [WORK, WORK,
                CARRY, CARRY,
                MOVE, MOVE], newName);
        }
        else if (roomEnergyCapacity >= 200) {
            spawnHarvester(room, spawner, [WORK, CARRY, MOVE], newName);
        }
    }

}

function refillMiners(room: Room): void {

    let newName = 'Miner' + Game.time;
    let spawner = room.memory.spawn;
    let roomEnergyCapacity = room.memory.energyCapacity;

    // Build only when the room is full of energy
    if (roomEnergyCapacity >= 650 && !spawner.spawning) {
        if (roomEnergyCapacity >= 650) {
            spawnMiner(room, spawner, [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK], newName);
        }
        else if (roomEnergyCapacity >= 550) {
            spawnMiner(room, spawner, [MOVE, WORK, WORK, WORK, WORK, WORK], newName);
        }
        else {
            Game.notify("Attempted to spawn miner without having enough energy");
        }
    }

}

function getSortedSourcesArray(room: Room): Id<Source>[] {

    // TODO: filter for the correct flag that points to the energy center
    const roomFlags = room.find(FIND_FLAGS);
    const energyCenter = roomFlags[0];

    // get the sources, sorted by distance to the "energy center" of the room
    const roomSources = room.find(FIND_SOURCES);
    let sortedSources = _.sortBy(roomSources, (s: Source) => s.pos.getRangeTo(energyCenter));

    // create an array of source IDs
    let sortedSourcesArray: Id<Source>[] = [];
    for (let i = 0; i < sortedSources.length; i++) {
        sortedSourcesArray.push(sortedSources[i].id);
    }
    return sortedSourcesArray;

}

function findNeedsRepair(room: Room, FIND_TYPE: StructureConstant, threshold: number): Array<Id<Structure<STRUCTURE_ROAD | STRUCTURE_WALL | STRUCTURE_RAMPART | STRUCTURE_CONTAINER>>> {

    let objs = room.find(FIND_STRUCTURES, { filter: o => (o.structureType == FIND_TYPE && o.hits <= threshold) });
    return objs.map(o => o.id) as Array<Id<Structure<STRUCTURE_ROAD | STRUCTURE_WALL | STRUCTURE_RAMPART | STRUCTURE_CONTAINER>>>;

}

function findRepaired(room: Room, FIND_TYPE: StructureConstant, threshold: number): Array<Id<Structure<STRUCTURE_ROAD | STRUCTURE_WALL | STRUCTURE_RAMPART | STRUCTURE_CONTAINER>>> {

    let objs = room.find(FIND_STRUCTURES, { filter: object => (object.structureType == FIND_TYPE && object.hits >= threshold) });
    return objs.map(o => o.id) as Array<Id<Structure<STRUCTURE_ROAD | STRUCTURE_WALL | STRUCTURE_RAMPART | STRUCTURE_CONTAINER>>>;

}

function findMiningContainers(room: Room): Array<Id<StructureContainer>> {

    let containers = room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER }) as Array<StructureContainer>;
    return containers.map(o => o.id);

}

function getRepairTargets(room: Room): Array<Id<Structure>> {

    // shortcut
    let defenseConfiguration = room.memory.optimalRoomConfiguration.defenseConfiguration;

    // start from existing list of repair targets
    let repairTargetsIDs = room.memory.repairTargetIDs;

    // remove structures that don't exist in the room anymore
    let allStructures = room.find(FIND_STRUCTURES);
    let allStructureIDs = allStructures.map(o => o.id);
    let notInRoom = _.difference(room.memory.repairTargetIDs, allStructureIDs);
    _.pullAll(repairTargetsIDs, notInRoom);

    // get structures in need of repair (only check for roads, walls and ramparts)
    let repairRoadIDs = findNeedsRepair(room, STRUCTURE_ROAD, ROAD_HITS * 0.2);
    let repairContainerIDs = findNeedsRepair(room, STRUCTURE_CONTAINER, CONTAINER_HITS * 0.2);
    let repairWallIDs = [];
    let repairRampartIDs = [];

    // Get the room controller level or -1 if the room doesn't have a controller
    let rcl = room.controller?.level; if (rcl == undefined) rcl = -1;

    // add all walls and ramparts regardless of size when room changes level
    if (room.memory.previousTickControlLevel < rcl) {
        repairWallIDs = findNeedsRepair(room, STRUCTURE_WALL, WALL_HITS_MAX);
        repairRampartIDs = findNeedsRepair(room, STRUCTURE_RAMPART, RAMPART_HITS_MAX[rcl]);
    } else {
        // otherwise, just add when they hit the repair threshold
        repairWallIDs = findNeedsRepair(room, STRUCTURE_WALL, defenseConfiguration.wallHitPoints * defenseConfiguration.repairThreshold);
        repairRampartIDs = findNeedsRepair(room, STRUCTURE_RAMPART, defenseConfiguration.rampartHitPoints * defenseConfiguration.repairThreshold);
    }

    // union the existing array with the targets we want repaired
    repairTargetsIDs = _.union(repairTargetsIDs, repairContainerIDs, repairRoadIDs, repairWallIDs, repairRampartIDs);

    // find the stuff that had repairs completed
    let repairedRoadsIDs = findRepaired(room, STRUCTURE_ROAD, ROAD_HITS);
    let repairedWallsIDs = findRepaired(room, STRUCTURE_WALL, defenseConfiguration.wallHitPoints);
    let repairedRampartIDs = findRepaired(room, STRUCTURE_RAMPART, defenseConfiguration.rampartHitPoints);
    let repairedContainerIDs = findRepaired(room, STRUCTURE_CONTAINER, CONTAINER_HITS);

    // remove what was already repaired from the targets
    _.pullAll(repairTargetsIDs, _.union(repairedRoadsIDs, repairedWallsIDs, repairedRampartIDs, repairedContainerIDs));

    // sort by type, putting easier to fix stuff in front (so that we don't lose as many roads)
    let repairTargets = repairTargetsIDs.map(Game.getObjectById) as Array<Structure<STRUCTURE_ROAD | STRUCTURE_WALL | STRUCTURE_RAMPART | STRUCTURE_CONTAINER>>;
    repairTargets = _.sortBy(repairTargets, [function (o: Structure<STRUCTURE_ROAD | STRUCTURE_WALL | STRUCTURE_RAMPART | STRUCTURE_CONTAINER>) { return o.hitsMax; }]) as Array<Structure<STRUCTURE_ROAD | STRUCTURE_WALL | STRUCTURE_RAMPART | STRUCTURE_CONTAINER>>;

    return repairTargets.map((o: Structure<STRUCTURE_ROAD | STRUCTURE_WALL | STRUCTURE_RAMPART | STRUCTURE_CONTAINER>) => o.id) as
        Array<Id<Structure<STRUCTURE_ROAD | STRUCTURE_WALL | STRUCTURE_RAMPART | STRUCTURE_CONTAINER>>>;

}

function getEnergyTargets(room: Room): Array<StructureExtension | StructureSpawn | StructureTower> {
    // check if energy-needing structures are full
    return room.find(FIND_STRUCTURES, {
        filter: (structure: StructureExtension | StructureSpawn | StructureTower) => {
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    }) as Array<StructureExtension | StructureSpawn | StructureTower>;
}

function getCreepMap(room: Room): CreepTypeCounter {

    let creepMap: CreepTypeCounter = {
        "harvesters": 0,
        "carriers": 0,
        "upgraders": 0,
        "repairers": 0,
        "claimers": 0,
        "miners": 0,
        "builders": 0,
        "signers": 0
    };

    let creeps = room.find(FIND_MY_CREEPS);

    type cKey = keyof CreepTypeCounter;
    creeps.forEach(function (cr) {
        let cKey = cr.memory.role as cKey;
        if (creepMap.hasOwnProperty(cr.memory.role)) {
            creepMap[cKey]++;
        } else {
            creepMap[cKey] = 1;
        }
    });

    return creepMap;

}

function creepRun(creep: Creep) {

    if (creep.memory.role == "harvester")
        roleHarvester.run(creep);
    else if (creep.memory.role == "carrier")
        roleCarrier.run(creep);
    else if (creep.memory.role == "upgrader")
        roleUpgrader.run(creep);
    else if (creep.memory.role == "repairer")
        roleRepairer.run(creep);
    else if (creep.memory.role == "builder")
        roleBuilder.run(creep);
    else if (creep.memory.role == "signer")
        roleSigner.run(creep);
    else if (creep.memory.role == "miner")
        roleMiner.run(creep);
    else
        console.log("Unknown creep role");
}

function spawnCreep(spawner: StructureSpawn, parts: Array<BodyPartConstant>, creepRole:string, creepName:string, creepSource = -1) {
    let mem : CreepMemory = {
        role : creepRole,
        source: creepSource
    }

    return spawner.spawnCreep(parts, creepName, { memory: mem });
}

function spawnHarvester(room : Room, spawner : StructureSpawn, parts: Array<BodyPartConstant>, creepName: string) {

    // check to see if we have too many creeps in the same source
    // TODO: stop using romm.memory.currentSourceTarget
    let ci: Array<Id<Creep>> = room.memory.workerIDs;
    let c: Array<Creep> = ci.map(Game.getObjectById) as Array<Creep>;

    let counter = 0;
    for (let i = 0; i < c.length; i++) {
        if (c[i].memory.source == 1)
            counter++;
    }

    console.log("Spawn counter: " + counter + " - " + c.length);

    let src: number = 0;
    if (counter > (c.length / 2.0)) // have lots of 1s
        src = 0;
    else
        src = 1;

    let spawnResult = spawnCreep(spawner, parts, 'harvester', creepName + '-' + src, src);

    if (spawnResult == OK) {
        console.log("Created new worker with source " + src);
    }
    else {
        console.log("Worker spawn failed with code " + spawnResult);
    }
}

function spawnMiner(room: Room, spawner: StructureSpawn, parts: Array<BodyPartConstant>, creepName: string) {

    // TODO: only works for up to two miners
    let miners = room.memory.minerIDs.map(Game.getObjectById) as Array<Creep>;
    let sourceIndex = 0;

    if (miners.length == 0)
        sourceIndex = 0;

    if (miners.length == 1) {
        let currentIndex = miners[0].memory.source;
        if (currentIndex == 0) sourceIndex = 1;
        if (currentIndex == 1) sourceIndex = 0;
    }

    let spawnResult = spawnCreep(spawner, parts, 'miner', creepName + '-' + sourceIndex, sourceIndex);

    if (spawnResult != OK) {
        console.log("Miner spawn failed with code " + spawnResult);
    }
}

function getOptimalRoomConfiguration(room: Room) : RoomConfiguration {

    let objDefense : RoomDefenseConfiguration = {
        wallHitPoints : 0,
        rampartHitPoints: 0,
        defenders: 0,
        rangedDefenders: 0, 
        repairThreshold : 0.1
    };

    let objMaintenance: RoomMaintenanceConfiguration = {
        repairThreshold: 0.1
    };

    let objRoomCreeps: RoomCreepConfiguration = {
        workers : 0,
        miners : 0
    }

    switch (room.controller?.level) {
        case 0:
            objMaintenance.repairThreshold = 0.0;
            break;
        case 1:
            // this is usually really quick
            objMaintenance.repairThreshold = 0.0;
            objRoomCreeps.workers = 4;
            break;
        case 2:
            // can potentially build walls
            objDefense.wallHitPoints = 10000;
            objDefense.rampartHitPoints = 5000;

            objMaintenance.repairThreshold = 0.05;

            objRoomCreeps.workers = 8;
            break;
        case 3:
            // should probably build walls
            objDefense.wallHitPoints = 50000;
            objDefense.rampartHitPoints = 25000;

            objRoomCreeps.workers = 8;
            objRoomCreeps.miners = 2;
            break;
        case 4:
            // bigger walls
            objDefense.wallHitPoints = 100000;
            objDefense.rampartHitPoints = 50000;

            objRoomCreeps.workers = 8;
            objRoomCreeps.miners = 2;
            break;
        case 5:
            // even bigger walls
            objDefense.wallHitPoints = 200000;
            objDefense.rampartHitPoints = 100000;

            objRoomCreeps.workers = 6;
            objRoomCreeps.miners = 2;
            break;
        case 6:
            // even bigger walls
            objDefense.wallHitPoints = 400000;
            objDefense.rampartHitPoints = 200000;

            objRoomCreeps.workers = 6;
            objRoomCreeps.miners = 2;
            break;
    }

    let objRoomConfiguration: RoomConfiguration = {
        creepConfiguration: objRoomCreeps,
        defenseConfiguration: objDefense,
        maintenanceConfiguration: objMaintenance
    }

    return objRoomConfiguration;
}

var roomManager = {

    needsInitialization: function (room: Room) : boolean {

        let refresh = false;

        // update configurations after a set amount of time, just in case
        if (Game.time % 100 == 0) refresh = true;

        // check if we had substantial changes in the room
        if (room.memory.previousTickStructures != room.find(FIND_STRUCTURES).length) refresh = true;
        if (room.memory.previousTickControlLevel != room.controller?.level) refresh = true;

        // defensive code to prevent some room variables from being empty
        if (room.memory.sortedSourcesArrayIDs === undefined) refresh = true;
        if (room.memory.optimalCreepConfiguration === undefined) refresh = true;

        // if we are reinitializing the room, log an event
        if (refresh) console.log("Updating room configuration");

        return refresh;

    },

    initialize: function (room : Room) : void {

        // initialize sources array variables
        let sortedSourcesArray = getSortedSourcesArray(room);
        room.memory.sortedSourcesArrayIDs = sortedSourcesArray;

    },

    setCurrentStatus: function (room : Room) {
        
        // Find mining containers
        room.memory.miningContainerIDs = findMiningContainers(room);

        // Check if we need to reconfigure room to optimal  configuration
        room.memory.optimalRoomConfiguration = getOptimalRoomConfiguration(room);

        const rcl = room.controller?.level === undefined ? -1 : room.controller.level;
        const decay = room.controller?.ticksToDowngrade === undefined ? Infinity : room.controller.ticksToDowngrade;

        // Stuff that we want to log and use later to make decisions
        room.memory.isNearControllerDecay = decay < 1000;
        room.memory.controlLevel = rcl;
        room.memory.energyAvailable = room.energyAvailable;
        room.memory.energyCapacity = room.energyCapacityAvailable;

        // check if there's anything to build or repair
        room.memory.hasBuildTargets = room.find(FIND_CONSTRUCTION_SITES).length > 0;
        room.memory.repairTargetIDs = getRepairTargets(room);

        // creep type log
        room.memory.creepMap = getCreepMap(room);

        // get creeps and worker lists
        let allCreeps = room.find(FIND_MY_CREEPS);

        let workers = _.filter(allCreeps, creep => creep.memory.role == 'harvester' || creep.memory.role == 'builder' || creep.memory.role == 'upgrader' ||
            creep.memory.role == 'repairer' || creep.memory.role == 'carrier' || creep.memory.role == 'signer');
        room.memory.workerIDs = workers.map(c => c.id);

        let miners = _.filter(allCreeps, creep => creep.memory.role == 'miner');
        room.memory.minerIDs = miners.map(c => c.id);

        // spawns
        let sp = room.find(FIND_MY_SPAWNS);
        room.memory.spawn = sp[0];

        // energy targets
        // check if spawner is full
        let energyTargets = getEnergyTargets(room);

        // save the number of structures and the current control level (needsInitialization() checks if these change)
        room.memory.previousTickStructures = room.find(FIND_STRUCTURES).length;
    },

    getRoomLog: function (room) {

        let logObject = {};
        logObject.gameTime = Game.time;
        logObject.roomName = room.name;
        logObject.roomLevel = room.controller.level;
        logObject.isNearDecay = room.memory.isNearControllerDecay;
        logObject.energyCapacity = room.memory.energyCapacity;
        logObject.energyAvailable = room.memory.energyAvailable;
        logObject.roomCreeps = room.memory.creepCount;
        logObject.creepMap = room.memory.creepMap;

        return logObject;

    },

    defend: function (room) {
        // TODO: improve the basic room defense below
        var hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${room.name}`);
            var towers = room.find(
                FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
            towers.forEach(tower => tower.attack(hostiles[0]));
        }
    },

    processCreeps: function (room) {

        // TODO: I don't like this way of getting the creeps
        let roomCreeps = room.memory.creepIDs.map(s => Game.getObjectById(s));

        // Go over all creeps in this room and update their roles
        for (let i = 0; i < roomCreeps.length; i++) {
            let creep = roomCreeps[i];

            // if the creep has no role, complain
            if (creep.memory === undefined) {
                console.log(creep.name + " has undefined memory - actions.");
                // TODO: complain harder with Game.notify
                break;
            }

            // if worker is empty, convert into harvester
            if (creep.store[RESOURCE_ENERGY] == 0) {
                if (creep.memory.role != 'harvester') {
                    if (creep.memory.role != "miner")
                        creep.say("🌱 harvest");
                }
                if (creep.memory.role != "miner")
                    creep.memory.role = "harvester";
            }
            // creep still has energy or if the creep is a full harvester, let's see what we can do with it
            else if ((creep.memory.role != "harvester") || ((creep.memory.role == "harvester") && (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0))) {
                // highest priority - deliver energy to structures
                if (room.memory.nOpenEnergyTargets) {
                    if (creep.memory.role != 'carrier')
                        creep.say('⚡ Carry');
                    creep.memory.role = 'carrier';
                }

                // next highest priority - prevent controller decay
                else if (room.memory.isNearControllerDecay) {
                    if (creep.memory.role != 'upgrader')
                        creep.say('♻️ Upgd');
                    creep.memory.role = 'upgrader';
                }

                // next highest priority - structures needing repair
                else if (room.memory.repairTargetIDs.length > 0) {
                    if (creep.memory.role != 'repairer')
                        creep.say('⛏️ Repair');
                    creep.memory.role = 'repairer';
                }

                // next highest priority - build new stuff
                else if (room.memory.hasBuildTargets) {
                    if (creep.memory.role != 'builder')
                        creep.say('🚧 Build');
                    creep.memory.role = 'builder';
                }

                else if (room.controller.sign.username != "FabianMontescu") {
                    if (creep.memory.role != 'signer')
                        creep.say('sign');
                    creep.memory.role = 'signer';
                }
                // next priority - upgrade controller (will always decrease energy)
                else {
                    if (creep.memory.role != 'upgrader')
                        creep.say('🎖️ Upgd');
                    creep.memory.role = 'upgrader';
                }

            }
            creepRun(creep);
        }

    },

    configure: function (room) {
        let optimalCreepConfiguration = room.memory.optimalRoomConfiguration.creeps;

        if (room.memory.workerCount < optimalCreepConfiguration.workers) {
            refillWorkers(room);
        }

        if (room.memory.minerCount < optimalCreepConfiguration.miners) {
            console.log("Refilling miners because room has " + room.memory.minerCount + " miners and wants " + optimalCreepConfiguration.miners);
            refillMiners(room);
        }
    }

};

module.exports = roomManager;

/*
        let canClaim = workers.length >= DESIRED_WORKERS;
        const DESIRED_CLAIMERS = 0;

        if (canClaim && claimers.length < DESIRED_CLAIMERS) {
            let newName = 'Claimer' + Game.time;
            let spawner = roomSpawns[0];

            // TODO: only create claimers when needed, for now, manual
            // only build claimers from big rooms
            if ((roomEnergyCapacity >= 1300) && (roomEnergyAvailable >= 1300)) {
                let parts = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY];
                // let parts = [MOVE, MOVE, CLAIM, CLAIM]
                let spawnResult = spawner.spawnCreep(parts, newName,
                    {memory: {role: 'expander'}});

                if (spawnResult == OK) {
                    console.log("Created new claimer");
                }
                else {
                    console.log("Claimer spawn failed with code " + spawnResult);
                }
            }
        }
*/