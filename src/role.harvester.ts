var roleHarvester = {

    run: function (creep: Creep) {

        // while has free capacity
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {

            if (creep.room.memory.minerIDs.length == 0) {
                let sources = creep.room.find(FIND_SOURCES);

                if (creep.harvest(sources[creep.memory.source]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[creep.memory.source], { visualizePathStyle: { stroke: '#ffaa00', opacity: 1, lineStyle: 'dashed' } });
                }
            }
            else {
                // there are enough mining containers in this room
                let containers = creep.room.memory.miningContainerIDs.map(Game.getObjectById) as Array<StructureContainer>;

                if (creep.withdraw(containers[creep.memory.source], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers[creep.memory.source], { visualizePathStyle: { stroke: '#0000aa', opacity: 1, lineStyle: 'dashed' } });
                }
            }
        }
    }
};

export default roleHarvester;
