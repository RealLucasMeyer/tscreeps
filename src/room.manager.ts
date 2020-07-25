import _, { pullAll } from "lodash";

import roleBuilder from "role.builder";
import roleCarrier from "role.carrier";
import roleHarvester from "role.harvester";
import roleMiner from "role.miner";
import roleRepairer from "role.repairer";
import roleSigner from "role.signer";
import roleUpgrader from "role.upgrader";
import roleClaimer from "role.claimer";
import roleRemoteHarvester from "role.remote.harvester";
import roleRemoteCarrier from "role.remote.carrier";
import { Console } from "console";

function spawnClaimer(room: Room, targetRoom: string) {

    let newName = 'Claimer' + Game.time;
    let spawner = room.find(FIND_MY_SPAWNS)[0];

    // TODO: only create claimers when needed, for now, manual
    let parts = [MOVE, CLAIM];
    let spawnResult = spawner.spawnCreep(parts, newName,
        { memory: { role: 'claimer', room: targetRoom, source: 0, remoteHarvesterMemory: null } });

    if (spawnResult == OK) {
        console.log("Created new claimer");
    }
    else {
        console.log("Claimer spawn failed with code " + spawnResult);
    }
}

function refillRemoteWorkers(room: Room, sourceRoom: string, sourceId: Id<Source>, deliveryRoom: string, deliveryId: Id<StructureStorage>): void {

    let newName = 'Remote Worker' + Game.time;
    let spawner = room.memory.spawn;
    let roomEnergyCapacity = room.memory.energyCapacity;
    let roomEnergyAvailable = room.memory.energyAvailable;

    if (roomEnergyCapacity == roomEnergyAvailable && !spawner.spawning && roomEnergyCapacity >= 1250) {
        spawnRemoteWorker(room, [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
            sourceRoom, deliveryRoom, sourceId, deliveryId);
    }

}

function refillWorkers(room: Room): void {

    let newName = 'Worker' + Game.time;
    let spawner = room.memory.spawn;
    let roomEnergyCapacity = room.memory.energyCapacity;
    let roomEnergyAvailable = room.memory.energyAvailable;

    // need this when expanding to a new room
    if (spawner == undefined)
        return;


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
        if (roomEnergyCapacity >= 1400) {
            spawnHarvester(room, spawner, [WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName);
        }
        else if (roomEnergyCapacity >= 1200) {
            spawnHarvester(room, spawner, [WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName);
        }
        else if (roomEnergyCapacity >= 1000) {
            spawnHarvester(room, spawner, [WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE], newName);
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
            spawnHarvester(room, spawner, [WORK, WORK,
                CARRY, CARRY, CARRY, CARRY,
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
    if (!spawner.spawning) {
        if (roomEnergyCapacity >= 650) {
            spawnMiner(room, spawner, [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK], newName);
        }
        else if (roomEnergyCapacity >= 550) {
            spawnMiner(room, spawner, [MOVE, WORK, WORK, WORK, WORK, WORK], newName);
        }
        else if (roomEnergyCapacity >= 400) {
            spawnMiner(room, spawner, [MOVE, MOVE, WORK, WORK, WORK], newName)
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
    let repairRoadIDs = findNeedsRepair(room, STRUCTURE_ROAD, ROAD_HITS * defenseConfiguration.repairThreshold);
    let repairContainerIDs = findNeedsRepair(room, STRUCTURE_CONTAINER, CONTAINER_HITS * defenseConfiguration.repairThreshold);
    let repairWallIDs = [];
    let repairRampartIDs = [];

    // Get the room controller level or -1 if the room doesn't have a controller
    let rcl = room.controller?.level; if (rcl == undefined) rcl = -1;

    // add all walls and ramparts regardless of size when room changes level
    if (room.memory.previousTickControllerLevel < rcl) {
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
        "harvester": 0,
        "carrier": 0,
        "upgrader": 0,
        "repairer": 0,
        "claimer": 0,
        "miner": 0,
        "builder": 0,
        "signer": 0,
        "remote harvester": 0,
        "remote carrier": 0
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
    else if (creep.memory.role == "claimer")
        roleClaimer.run(creep);
    else if (creep.memory.role == "remote harvester")
        roleRemoteHarvester.run(creep);
    else if (creep.memory.role == "remote carrier")
        roleRemoteCarrier.run(creep);
    else
        console.log("Unknown creep role");
}

function spawnCreep(spawner: StructureSpawn, parts: Array<BodyPartConstant>,
    creepRole: string, creepName: string, creepSource: number = -1, creepRoom: string = "") {
    let mem: CreepMemory = {
        role: creepRole,
        source: creepSource,
        room: creepRoom == "" ? spawner.room.name : creepRoom,
        remoteHarvesterMemory: null
    }

    if (spawner === undefined) {
        console.log("No spawner");
        return;
    }

    return spawner.spawnCreep(parts, creepName, { memory: mem });
}

function spawnHarvester(room: Room, spawner: StructureSpawn, parts: Array<BodyPartConstant>, creepName: string, creepRoom: string = "", creepSourceIndex: number = -1) {

    let counter = 0;
    let src = -1;
    let bal = 2.0;

    // TODO: remove this manual adjustment
    if (room.name == "W66S28") {
        bal = 3.0;
    }

    if (creepSourceIndex == -1) {
        let ci: Array<Id<Creep>> = room.memory.workerIDs;
        let c: Array<Creep> = ci.map(Game.getObjectById) as Array<Creep>;

        for (let i = 0; i < c.length; i++) {
            if (c[i].memory.source == 1)
                counter++;
        }
        if (counter > (c.length / 2.0)) // have lots of 1s
            src = 0;
        else
            src = 1;
    }
    else {
        src = creepSourceIndex;
    }

    let spawnResult = spawnCreep(spawner, parts, 'harvester', creepName + '-' + src, src, creepRoom);

    if (spawnResult == OK) {
        console.log("Created new worker with source " + src);
    }
    else {
        console.log("Worker spawn failed with code " + spawnResult);
    }
}

function spawnRemoteWorker(room: Room, parts: Array<BodyPartConstant>, creepName: string, sourceRoom: string, deliveryRoom: string, sourceId: Id<Source>, deliveryId: Id<StructureStorage>) {

    let spawner = room.find(FIND_MY_SPAWNS)[0];

    let mem: CreepMemory = {
        role: "remote harvester",
        source: -1,
        room: spawner.room.name,
        remoteHarvesterMemory: {
            harvestSourceID: sourceId,
            harvestRoom: sourceRoom,
            deliveryRoom: deliveryRoom,
            deliveryStorageID: deliveryId
        }
    }

    if (spawner === undefined) {
        console.log("No spawner");
        return;
    }

    return spawner.spawnCreep(parts, creepName, { memory: mem });
}

function spawnMiner(room: Room, spawner: StructureSpawn, parts: Array<BodyPartConstant>, creepName: string, creepRoom: string = "") {


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

    let spawnResult = spawnCreep(spawner, parts, 'miner', creepName + '-' + sourceIndex, sourceIndex, creepRoom);

    if (spawnResult != OK) {
        console.log("Miner spawn failed with code " + spawnResult);
    }
}

function getOptimalRoomConfiguration(room: Room): RoomConfiguration {

    let objDefense: RoomDefenseConfiguration = {
        wallHitPoints: 0,
        rampartHitPoints: 0,
        defenders: 0,
        rangedDefenders: 0,
        repairThreshold: 0.1
    };

    let objMaintenance: RoomMaintenanceConfiguration = {
        repairThreshold: 0.1
    };

    let objRoomCreeps: RoomCreepConfiguration = {
        workers: 0,
        miners: 0,
        remoteWorkers: 0
    }

    const numMiningContainers = room.memory.miningContainerIDs.length;

    switch (room.controller?.level) {
        case 0:
            objMaintenance.repairThreshold = 0.0;
            break;
        case 1:
            // this is usually really quick
            objMaintenance.repairThreshold = 0.0;
            objRoomCreeps.workers = 4 - numMiningContainers;
            objRoomCreeps.miners = numMiningContainers;
            break;
        case 2:
            // can potentially build walls
            objDefense.wallHitPoints = 10000;
            objDefense.rampartHitPoints = 5000;

            objMaintenance.repairThreshold = 0.05;

            objRoomCreeps.workers = 10 - numMiningContainers;
            objRoomCreeps.miners = numMiningContainers;
            break;
        case 3:
            // should probably build walls
            objDefense.wallHitPoints = 50000;
            objDefense.rampartHitPoints = 25000;

            if (room.name == "W67S28")
                objRoomCreeps.workers = 12 - numMiningContainers;

            if (room.name == "W66S28")
                objRoomCreeps.workers = 9 - numMiningContainers;

            objRoomCreeps.miners = numMiningContainers;
            break;
        case 4:
            // bigger walls
            objDefense.wallHitPoints = 100000;
            objDefense.rampartHitPoints = 50000;

            if (room.name == "W67S28") {
                objRoomCreeps.workers = 10 - numMiningContainers;
                objRoomCreeps.remoteWorkers = 0;

            }
            if (room.name == "W66S28") {
                objRoomCreeps.workers = 8 - numMiningContainers;
            }

            objRoomCreeps.miners = numMiningContainers;
            break;
        case 5:
            // even bigger walls
            objDefense.wallHitPoints = 200000;
            objDefense.rampartHitPoints = 100000;

            if (room.name == "W67S28") {
                objRoomCreeps.remoteWorkers = 0;
            }
            objRoomCreeps.workers = 8 - numMiningContainers;
            objRoomCreeps.miners = numMiningContainers;
            break;
        case 6:
        case 7:
        case 8:
            // even bigger walls
            objDefense.wallHitPoints = 400000;
            objDefense.rampartHitPoints = 200000;

            objRoomCreeps.workers = 8 - numMiningContainers;
            objRoomCreeps.miners = numMiningContainers;
            break;
    }

    let objRoomConfiguration: RoomConfiguration = {
        creepConfiguration: objRoomCreeps,
        defenseConfiguration: objDefense,
        maintenanceConfiguration: objMaintenance
    }

    return objRoomConfiguration;
}

function addBuildTask(room: Room, structure: BuildableStructureConstant, x: number, y: number, minRCL: number = Infinity, minTime: number = Infinity) {
    let item: BuildTask = {
        structureType: structure,
        x: x,
        y: y,
        minRCL: minRCL,
        minGameTime: minTime
    }

    if (room.memory.nextBuildRCL > minRCL) room.memory.nextBuildRCL = minRCL;
    if (room.memory.nextBuildTime > minTime) room.memory.nextBuildTime = minTime;

    room.memory.buildTaskList.push(item);
}

var roomManager = {

    log: function (room: Room) {

        if (room.memory.roomLog === undefined)
            room.memory.roomLog = [];

        if (room.memory.roomLog.length >= 100)
            room.memory.roomLog.length = 99;
    },

    manualCommand: function (room: Room) {

        if (room.name == "W66S28" && Game.time == 38747506)
            spawnClaimer(room, "W67S29");
    },

    needsInitialization: function (room: Room): boolean {

        let refresh = false;

        // update configurations after a set amount of time, just in case
        if (Game.time % 100 == 0) {
            console.log("Refreshing room configuration since it's been too long");
            refresh = true;
        }

        // defensive code to prevent some room variables from being empty
        if (room.memory.sortedSourcesArrayIDs === undefined) {
            console.log("Refreshing room configuration since there no sorted sources")
            refresh = true;
        }

        if (room.memory.optimalRoomConfiguration === undefined) {
            console.log("Refreshing room configuration since there's no optimal room configuration")
            refresh = true;
        }

        // check for uninitialized lists
        if (room.memory.buildTaskList === undefined) {
            room.memory.buildTaskList = [];
            room.memory.nextBuildRCL = Infinity;
            room.memory.nextBuildTime = Infinity;
        }


        // if we are reinitializing the room, log an event
        if (refresh) console.log("Updating room configuration");

        return refresh;

    },

    initialize: function (room: Room): void {

        // initialize sources array variables
        let sortedSourcesArray = getSortedSourcesArray(room);
        room.memory.sortedSourcesArrayIDs = sortedSourcesArray;

    },

    setCurrentStatus: function (room: Room) {

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
        room.memory.creepIDs = allCreeps.map(c => c.id);

        let workers = _.filter(allCreeps, creep => (creep.memory.role == 'harvester') || (creep.memory.role == 'builder') || (creep.memory.role == 'upgrader') ||
            (creep.memory.role == 'repairer') || (creep.memory.role == 'carrier') || (creep.memory.role == 'signer'));
        room.memory.workerIDs = workers.map(c => c.id);

        let miners = _.filter(allCreeps, creep => creep.memory.role == 'miner');
        room.memory.minerIDs = miners.map(c => c.id);

        let remoteWorkers = _.filter(allCreeps, creep => creep.memory.role == ("remote harvester") || (creep.memory.role == "remote carrier"));
        room.memory.remoteWorkerIDs = remoteWorkers.map(c => c.id);

        // spawns
        let sp = room.find(FIND_MY_SPAWNS);
        room.memory.spawn = sp[0];

        // energy targets
        // check if spawner is full
        room.memory.nOpenEnergyTargets = getEnergyTargets(room).length;
    },

    getRoomLog: function (room: Room) {

        const rcl = room.controller?.level === undefined ? 0 : room.controller!.level;

        let logObject: LogObject = {
            gameTime: Game.time,
            roomName: room.name,
            roomLevel: rcl,
            isNearDecay: room.memory.isNearControllerDecay,
            energyCapacity: room.memory.energyCapacity,
            energyAvailable: room.memory.energyAvailable,
            roomCreeps: room.memory.workerIDs.length + room.memory.minerIDs.length,
            creepMap: room.memory.creepMap,
        }

        return logObject;

    },

    defend: function (room: Room) {
        // TODO: improve the basic room defense below
        var hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${room.name}`);
            var towers: Array<StructureTower> = room.find(
                FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } }) as Array<StructureTower>;
            towers.forEach(tower => tower.attack(hostiles[0]));
        }
    },

    processCreeps: function (room: Room) {

        // TODO: I don't like this way of getting the creeps
        let roomCreeps = room.find(FIND_MY_CREEPS);

        // Go over all creeps in this room and update their roles
        for (let i = 0; i < roomCreeps.length; i++) {
            let creep: Creep = roomCreeps[i];

            // console.log(`Processing creep ${creep.id} with role ${creep.memory.role}`);
            if (creep.ticksToLive == 1)
                creep.drop(RESOURCE_ENERGY);

            // if the creep has no role, complain
            if (creep.memory === undefined) {
                console.log(creep.name + " has undefined memory - actions.");
                // TODO: complain harder with Game.notify
                continue;
            }

            let currRole = creep.memory.role;

            if ((currRole == "claimer") || (currRole == "miner")) {
                creepRun(creep);
                continue;
            }

            if (currRole == "remote harvester" || currRole == "remote carrier") {
                if (creep.store[RESOURCE_ENERGY] == 0) {
                    creep.memory.role = "remote harvester";
                }
                if ((currRole == "remote harvester") && (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)) {
                    creep.memory.role = "remote carrier"
                }
                creepRun(creep);
                continue;
            }

            // if worker is empty, convert into harvester
            if (creep.store[RESOURCE_ENERGY] == 0) {
                if ((currRole != 'harvester') && (currRole != "miner")) {
                    creep.say("🌱 harvest");
                    creep.memory.role = "harvester";
                }
            }
            // creep still has energy or if the creep is a full harvester, let's see what we can do with it
            else if ((currRole != "harvester") || ((currRole == "harvester") && (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0))) {
                // highest priority - deliver energy to structures
                if (room.memory.nOpenEnergyTargets) {
                    if (currRole != 'carrier')
                        creep.say('⚡ Carry');
                    creep.memory.role = 'carrier';
                }

                // next highest priority - prevent controller decay
                else if (room.memory.isNearControllerDecay) {
                    if (currRole != 'upgrader')
                        creep.say('♻️ Upgd');
                    creep.memory.role = 'upgrader';
                }

                // next highest priority - structures needing repair
                else if (room.memory.repairTargetIDs.length > 0) {
                    if (currRole != 'repairer')
                        creep.say('⛏️ Repair');
                    creep.memory.role = 'repairer';
                }

                // next highest priority - build new stuff
                else if (room.memory.hasBuildTargets) {
                    if (currRole != 'builder')
                        creep.say('🚧 Build');
                    creep.memory.role = 'builder';
                }

                // if there's a room controller and its sign username is not "FabianMontescu", then sign
                else if (room.controller?.sign?.username != "FabianMontescu") {
                    if (currRole != 'signer')
                        creep.say('sign');
                    creep.memory.role = 'signer';
                }

                // next priority - upgrade controller (will always decrease energy)
                else {
                    if (currRole != 'upgrader')
                        creep.say('🎖️ Upgd');
                    creep.memory.role = 'upgrader';
                }

            }
            creepRun(creep);
        }

    },

    configure: function (room: Room) {
        let optimalCreepConfiguration = room.memory.optimalRoomConfiguration.creepConfiguration;
        let spawner = room.find(FIND_MY_SPAWNS)[0] as StructureSpawn;

        if ((room.memory.energyAvailable < room.memory.energyCapacity) || (spawner?.spawning) || (spawner == undefined))
            return;

        if (room.memory.workerIDs.length < optimalCreepConfiguration.workers) {
            console.log(`Room ${room.name} has ${room.memory.workerIDs.length} workers but wants ${optimalCreepConfiguration.workers}. Refilling.`)
            refillWorkers(room);
        }

        if (room.memory.minerIDs.length < optimalCreepConfiguration.miners) {
            console.log(`Room ${room.name} has ${room.memory.minerIDs.length} miners but wants ${optimalCreepConfiguration.miners}. Refilling.`)
            refillMiners(room);
        }

        if (room.memory.remoteWorkerIDs.length < -1) {
            console.log(`Room ${room.name} has ${room.memory.remoteWorkerIDs.length} remote workers but wants ${optimalCreepConfiguration.remoteWorkers}. Refilling.`)
            if (room.name == "W67S28") {
                let deliveryRoom = "W67S28";
                let sourceRoom = "W67S27";
                let deliveryId = "5f1964fd40824bfd04ae2fc8" as Id<StructureStorage>;
                let sourceId = "57ef9c7a86f108ae6e60c3ea" as Id<Source>;
                refillRemoteWorkers(room, sourceRoom, sourceId, deliveryRoom, deliveryId);
            }

        }
    },

    processBuildTasks(room: Room) {

        let currRCL = room.controller?.level === undefined ? 0 : room.controller.level;
        // for now ignoring time

        if (currRCL < room.memory.nextBuildRCL) return;

        let remainingTasks: BuildTask[] = [];
        let newMin = Infinity;

        for (let i = 0; i < room.memory.buildTaskList.length; i++) {
            let t: BuildTask = room.memory.buildTaskList[i];
            console.log("Examining task:", JSON.stringify(t));

            if (t.minRCL <= currRCL) {
                room.createConstructionSite(t.x, t.y, t.structureType);
            }
            else {
                if (t.minRCL < newMin)
                    newMin = t.minRCL;
                remainingTasks.push(t);
            }
        }

        room.memory.buildTaskList = remainingTasks;
        room.memory.nextBuildRCL = newMin;

    }

};

export default roomManager;

/*
        let canClaim = workers.length >= DESIRED_WORKERS;
        const DESIRED_CLAIMERS = 0;

        if (canClaim && claimers.length < DESIRED_CLAIMERS) {
            let newName = 'Claimer' + Game.time;
            let spawner = roomSpawns[0];

            // TODO: only create claimers when needed, for now, manual
            // only build claimers from big rooms
            if ((roomEnergyCapacity >= 1300) && (roomEnergyAvailable >= 1300)) {
                // let parts = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY];
                let parts = [MOVE, MOVE, CLAIM, CLAIM];
                let spawnResult = spawner.spawnCreep(parts, newName,
                    {memory: {role: 'claimer'}});

                if (spawnResult == OK) {
                    console.log("Created new claimer");
                }
                else {
                    console.log("Claimer spawn failed with code " + spawnResult);
                }
            }
        }
*/
1
