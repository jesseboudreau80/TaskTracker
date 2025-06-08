export type TChartColorScheme = "modern" | "horizon" | "earthen";

export type TChartBaseDatum = {
  key: string;
  name: string;
  count: number;
};

export type TChartDatum = TChartBaseDatum & Record<string, number>;

export type TChart = {
  data: TChartDatum[];
  schema: Record<string, string>;
};
