var roleRemoteCarrier = {

    run: function (creep: Creep) {
        if (creep.memory.remoteHarvesterMemory == null) {
            console.log(`At tick ${Game.time}, ${creep.id} says: I have no memory! Help!`);
            return;
        }

        // find all structures that are spawns and extensions that can be filled with energy
        let target = Game.getObjectById(creep.memory.remoteHarvesterMemory.deliveryStorageID) as StructureStorage;

        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ccffcc', opacity: 1, lineStyle: 'dashed' }, maxOps: 10000, maxRooms: 2 });
        }
    }

};

export default roleRemoteCarrier;
