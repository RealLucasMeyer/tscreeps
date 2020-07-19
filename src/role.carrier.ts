var roleCarrier = {

    /** @param {Creep} creep **/
    run: function (creep: Creep) {

        // find all structures that are spawns and extensions that can be filled with energy
        const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        }) as StructureExtension | StructureSpawn | StructureTower;
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ccffcc', opacity: 1, lineStyle: 'dashed' } });
        }
    }

};

module.exports = roleCarrier;
