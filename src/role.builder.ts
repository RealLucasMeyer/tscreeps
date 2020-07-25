import _ from "lodash";

function buildPriority(structureType: StructureConstant): number {
    switch (structureType) {
        case STRUCTURE_SPAWN:
            return 0;
        case STRUCTURE_EXTENSION:
            return 1;
        case STRUCTURE_ROAD:
            return 2;
        case STRUCTURE_CONTAINER:
            return 3;
        case STRUCTURE_TOWER:
            return 4;
        case STRUCTURE_RAMPART:
            return 5;
        case STRUCTURE_WALL:
            return 6;
        default:
            return 9999;

    }
}

var roleBuilder = {

    run: function (creep: Creep) {

        let constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        constructionSites = _.sortBy(constructionSites, o => buildPriority(o.structureType));

        // find closest construction site
        const target = constructionSites[0];

        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ff3333' } });
        }
    }
};

export default roleBuilder;
