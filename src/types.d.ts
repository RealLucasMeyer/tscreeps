interface CreepMemory {
  role: string;
  source: number;
  room: string;
  remoteHarvesterMemory: RemoteHarvesterMemory | null;
}

interface RemoteHarvesterMemory {
  harvestRoom: string;
  harvestSourceID: Id<Source> | Id<StructureContainer>;
  deliveryRoom: string;
  deliveryStorageID: Id<StructureStorage>
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
  workers: number;
  miners: number;
  remoteWorkers: number;
}

interface RoomDefenseConfiguration {
  wallHitPoints: number;
  rampartHitPoints: number;
  repairThreshold: number;
  defenders: number;
  rangedDefenders: number;
}

interface BuildTask {
  x: number;
  y: number;
  minRCL: number;
  minGameTime: number; // for future use
  structureType: BuildableStructureConstant;
}

interface RoomMemory {
  buildTaskList: Array<BuildTask>;
  controlLevel: number;
  creepMap: CreepTypeCounter;
  creepIDs: Array<Id<Creep>>;
  energyCapacity: number;
  energyAvailable: number;
  hasBuildTargets: boolean;
  isNearControllerDecay: boolean;
  nextBuildTime: number;
  nextBuildRCL: number;
  minerIDs: Array<Id<Creep>>;
  miningContainerIDs: Array<Id<StructureContainer>>;
  nOpenEnergyTargets: number;
  optimalRoomConfiguration: RoomConfiguration;
  previousTickControllerLevel: number;
  remoteWorkerIDs: Array<Id<Creep>>;
  repairTargetIDs: Array<Id<Structure>>;
  roomLog: Array<RoomLogItem>;
  sortedSourcesArrayIDs: Array<Id<Source>>;
  spawn: StructureSpawn;
  workerIDs: Array<Id<Creep>>;
}

interface RoomLogItem {
  gameTime: number;
  roomName: string;
  roomLevel: number;
  isNearDecay: boolean;
  energyCapacity: number;
  energyAvailable: number;
  roomCreeps: number;
  creepMap: CreepTypeCounter;
  sourceId0: Id<Source> | undefined;
  sourceCapacity0: number;
  sourceId1: Id<Source> | undefined;
  sourceCapacity1: number;
  containerId0: Id<StructureContainer> | undefined;
  containerCapacity0: number;
  containerId1: Id<StructureContainer> | undefined;
  containerCapacity1: number;
}

interface CreepTypeCounter {
  harvester: number;
  builder: number;
  carrier: number;
  repairer: number;
  upgrader: number;
  signer: number;
  claimer: number;
  miner: number;
  "remote harvester": number;
  "remote carrier": number;
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
