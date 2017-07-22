// Whitespace signifies areas that seem to go together on the form
export interface CamecaWFSIMSLog {
  DateIn: string;
  DateOut: string;
  Analyst: string;
  TimeIn: string;
  TimeOut: string;
  TotalInstTime: string;
  JobNumber: string;

  ReferenceJobNumber: string;

  ReportTime: string;
  Requestor: string;
  Angle: string;
  IBCurrent: string;

  Source: string;
  Primary: string; // ????
  Secondary: string; // ????
  Float: string; // ????
  Impact: string; // ????
  MaxCurrent: string;
  MainVacuumPressure: string;

  FileUsed: string;
  SampleDescription: string;
  PurposeOfExperiment: string;

  FA: string; // ????
  CA: string; // ????
  MaxArea: string;
  EnergySlits: string;
  EntranceSlits: string;
  ExitSlits: string;
  MassRes: string;
  InteTime: string; // ????
  WaitTime: string;
  RasterSize: string;
  Neut: string; // ????
  Gating: string;
  Holder: string;

  FilePrefix: string;

  BottomTable: SIMSTableRow[]; // ????
}

export interface SIMSTableRow {
  ChainAnalysisNumber: string;
  FileNumber: string;
  Comments: string;
  RSF_SR: string; // ????
}
