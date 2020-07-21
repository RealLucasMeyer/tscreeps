
// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  source: number;
  room: string;
}

interface Memory {
  uuid: number;
  log: any;
  ownedRoomIDs: string[];
  expansionRoomIDs: string[];
  expansionTaskList: Array<ExpansionTask>;
}

interface RoomMaintenanceConfiguration {
  repairThreshold: number
}

interface RoomConfiguration {
  maintenanceConfiguration: RoomMaintenanceConfiguration,
  defenseConfiguration: RoomDefenseConfiguration,
  creepConfiguration: RoomCreepConfiguration
}

interface RoomCreepConfiguration {
  workers: number,
  miners: number
}

interface RoomDefenseConfiguration {
  wallHitPoints: number;
  rampartHitPoints: number;
  repairThreshold: number;
  defenders: number;
  rangedDefenders: number;
}

interface RoomMemory {
  controlLevel: number;
  creepMap: CreepTypeCounter;
  creepIDs: Array<Id<Creep>>;
  energyCapacity: number;
  energyAvailable: number;
  hasBuildTargets: boolean;
  isNearControllerDecay: boolean;
  minerIDs: Array<Id<Creep>>;
  miningContainerIDs: Array<Id<StructureContainer>>;
  nOpenEnergyTargets: number;
  optimalRoomConfiguration: RoomConfiguration;
  previousTickControllerLevel: number;
  repairTargetIDs: Array<Id<Structure>>;
  sortedSourcesArrayIDs: Array<Id<Source>>;
  spawn: StructureSpawn;
  workerIDs: Array<Id<Creep>>;
}

interface LogObject {
  gameTime: number;
  roomName: string;
  roomLevel: number;
  isNearDecay: boolean;
  energyCapacity: number;
  energyAvailable: number;
  roomCreeps: number;
  creepMap: CreepTypeCounter;

}

interface CreepTypeCounter {
  harvesters: number;
  builders: number;
  carriers: number;
  repairers: number;
  upgraders: number;
  signers: number;
  claimers: number;
  miners: number;
}

// TODO: convert expansionType to numeric constant
interface ExpansionTask {
  sourceRoomName: string;
  destinationRoomName: string;
  expansionType: string;
  status: string;
  lastCreepSent: number;
  estimatedCompletion: number; // after this time, wasteful to send creeps
  estimatedLoss: number; // need to send creeps before this time
}

interface ExpansionStatus {
  roomName: string;
  expansionType: string;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
