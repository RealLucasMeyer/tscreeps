import { ErrorMapper } from "utils/ErrorMapper";
import nationManager from "nation.manager";
import roomManager from "room.manager";
import { runInThisContext } from "vm";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  nationManager.cleanDeadCreepsFromMemory();
  nationManager.updateStatus();

  for (let rm in Game.rooms) {
    let room = Game.rooms[rm];

    // Initialize the variables of the room if needed
    if (roomManager.needsInitialization(room)) {
      roomManager.initialize(room);
    }

    // Create construction sites according to plan
    roomManager.processBuildTasks(room);

    // Initialize status for this tick
    roomManager.setCurrentStatus(room);

    // For testing stuff
    roomManager.manualCommand(room);

    // log status
    const interval = 15;
    if (Game.time % interval == 0) {
      let logObject = roomManager.getRoomLog(room);
      console.log(JSON.stringify(logObject));
    }
    // Address any attackers
    roomManager.defend(room);

    // Update number of creeps and their functions
    roomManager.configure(room);

    // Manage creep actions
    roomManager.processCreeps(room);
  }
});
