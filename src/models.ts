export type DavisData = {
  did: string;
  name: string;
  ts: number;
  conditions: DavisConditions[];
};

export type DavisConditions = {
  lsid: number;
  data_structure_type: number;
  txid: number;
} & Record<string, number>;
