var roleSigner = {

    run:
        function (creep: Creep) {
            if (creep.room.controller === undefined) {

            }
            else {
                let ret = creep.signController(creep.room.controller, "I'm just a n00b, be merciful while I learn JavaScript");
                if (ret == OK || creep.room.controller.sign?.username == "FabianMontescu")
                    creep.memory.role = "harvester";

                if (ret == ERR_NOT_IN_RANGE)
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#aaffff', opacity: 1, lineStyle: 'dashed' } });
            }
        }
};

export default roleSigner;
