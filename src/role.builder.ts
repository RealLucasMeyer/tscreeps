var roleBuilder = {

    run: function (creep: Creep) {

        // find closest construction site
        const target = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES) as ConstructionSite;

        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff3333' } });
        }
    }
};

module.exports = roleBuilder;
