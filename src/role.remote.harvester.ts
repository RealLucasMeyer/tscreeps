var roleRemoteHarvester = {

    run: function (creep: Creep) {

        // while has free capacity
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.memory.remoteHarvesterMemory == null) {
                console.log(`At tick ${Game.time}, ${creep.id} says: I have no memory! Help!`);
                return;
            }

            let s: Source = Game.getObjectById(creep.memory.remoteHarvesterMemory.harvestSourceID) as Source;

            if (s == null) {
                console.log(`At tick ${Game.time}, ${creep.id} says: I can't find my destination ${creep.memory.remoteHarvesterMemory.harvestSourceID}`);
                return;
            }

            if (creep.harvest(s) == ERR_NOT_IN_RANGE) {
                creep.moveTo(s, { visualizePathStyle: { stroke: '#ffaa00', opacity: 1, lineStyle: 'dashed' } });
            }

        }


    }
};

export default roleRemoteHarvester;
