var roleMiner = {

    run: function (creep: Creep) {

        let targets = creep.room.memory.miningContainerIDs.map(Game.getObjectById) as Array<StructureContainer>;

        if (creep.pos.x == targets[creep.memory.source].pos.x && creep.pos.y == targets[creep.memory.source].pos.y) {
            let closestSource = creep.pos.findClosestByRange(FIND_SOURCES);
            if (closestSource != null)
                creep.harvest(closestSource);
            else
                console.log("Miner couldn't find a suitable source");
        }
        else {
            creep.moveTo(targets[creep.memory.source], { visualizePathStyle: { stroke: '#ff00ff', opacity: 1, lineStyle: 'dashed' } });
        }
    }
};

module.exports = roleMiner;
