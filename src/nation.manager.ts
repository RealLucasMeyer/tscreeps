import { memoryUsage } from "process";
import _ from "lodash";
// import { Memory } from "../test/unit/mock";

function getRoomExpansionList() {
    // update expansion list
    let roomExpansionList = Memory.expansionRoomIDs; // to avoid modifying array while iterating over it

    // find status of intended expansion
    for (let i = 0; i < Memory.expansionRoomIDs.length; i++) {
        if (_.indexOf(Memory.ownedRoomIDs, Memory.expansionRoomIDs[i]) >= 0) // already owns room
            _.pull(roomExpansionList, Memory.expansionRoomIDs[i]);
    }

    return roomExpansionList;
}

var nationManager = {

    cleanDeadCreepsFromMemory: function (): void {
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    },

    updateStatus: function (): void {
        let ownedRooms = _.flatMap(Game.rooms) as Room[];
        _.remove(ownedRooms, r => r.controller === undefined || r.controller.level <= 0); // remove unowned;

        let ownedRoomIDs = _.map(ownedRooms, o => o.name);
        Memory.ownedRoomIDs = ownedRoomIDs;

        // Check for uninitialized variable
        if (Memory.expansionRoomIDs === undefined)
            Memory.expansionRoomIDs = [];

        if (Memory.expansionTaskList === undefined)
            Memory.expansionTaskList = [];

        if (Game.time == 38697415) {
            Memory.expansionRoomIDs = ["W66S28"];
        }

    },

    planExpansion: function (): void {

        Memory.expansionRoomIDs = getRoomExpansionList();

        let roomExpansionGap = Game.gcl.level - Memory.ownedRoomIDs.length;
        let currentTaskList = Memory.expansionTaskList;
        let nExp = currentTaskList.length;


        // For each item of the room expansion list, decide whether we will reserve or expand

        // if (roomExpansionGap > 0)

    },

};

export default nationManager;
