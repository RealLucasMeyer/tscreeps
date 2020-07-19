var roleRepairer = {

    run:
        function (creep: Creep) {

            let room = creep.room;
            let repairTargetID = room.memory.repairTargetIDs[0];
            let repairTarget = Game.getObjectById(repairTargetID);

            if (repairTarget == null) {
                console.log("No viable target to repair")
            }
            else if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(repairTarget, { visualizePathStyle: { stroke: '#aaaaff', opacity: 1, lineStyle: 'dashed' } });
            }

        }
};

export default roleRepairer;
