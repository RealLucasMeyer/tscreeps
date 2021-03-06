var roleUpgrader = {

    run:
        function (creep: Creep) {
            if (creep.memory.room != creep.room.name) {
                let p = new RoomPosition(25, 25, creep.memory.room);
                creep.moveTo(p);
            }
            else {
                if (creep.room.controller === undefined) {
                    console.log("Attempting to upgrade inexistent controller")
                }
                else if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#aaffff', opacity: 1, lineStyle: 'dashed' } });
                }
            }
        }
};

export default roleUpgrader;
