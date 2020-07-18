// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  source: number;
}

interface Memory {
  uuid: number;
  log: any;
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
  energyCapacity: number;
  energyAvailable: number;
  hasBuildTargets: boolean;
  isNearControllerDecay : boolean;
  minerIDs: Array<Id<Creep>>;
  miningContainerIDs: Array<Id<StructureContainer>>;
  optimalCreepConfiguration: RoomConfiguration;
  optimalRoomConfiguration: RoomConfiguration;
  previousTickStructures: number;
  repairTargetIDs: Array<Id<Structure>>;
  sortedSourcesArrayIDs: Array<Id<Source>>;
  spawn: StructureSpawn;
  workerIDs: Array<Id<Creep>>;
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

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
