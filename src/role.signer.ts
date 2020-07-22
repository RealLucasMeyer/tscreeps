var roleSigner = {

    run:
        function (creep: Creep) {
            if (creep.room.controller === undefined) {
                console.log(`Attempting to sign controller at room {$room.Name} but it doesn't have a controller.`);
            }
            else {
                let ret = creep.signController(creep.room.controller, "I'm just a n00b learning TypeScript. If you invade me... well, there's not much I can do about it, but try not to seal club me");
                if (ret == OK || creep.room.controller.sign?.username == "FabianMontescu")
                    creep.memory.role = "harvester";

                if (ret == ERR_NOT_IN_RANGE)
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#aaffff', opacity: 1, lineStyle: 'dashed' } });
            }
        }
};

export default roleSigner;
