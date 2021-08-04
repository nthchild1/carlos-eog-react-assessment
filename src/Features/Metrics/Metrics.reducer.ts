import { createSlice, PayloadAction } from "redux-starter-kit";

export type MeasurementI = {
  metric: string,
  at: number,
  value: number,
  unit: string
}

export type MetricsMeasurements = {
  [key: string]: MeasurementI[]
}

export type ApiErrorAction = {
  error: string;
};

export interface InitialStateI {
  metricsMeasurements: MetricsMeasurements,
  selectedMetrics: Array<string | undefined>,
  lineColors: {[key: string] : string},
  metricsNames: string[]
}

const initialState : InitialStateI = {
  metricsMeasurements: {},
  selectedMetrics: [],
  lineColors: {},
  metricsNames: [],
};

const slice = createSlice({
  name: "measurements",
  initialState,
  reducers: {
    metricMeasurementDataReceived: (state, action: PayloadAction<MeasurementI>) => state,
    multipleMeasurementDataReceived: (state, action) => state,
    saveMeasurements: (state, action) => {
      state.metricsMeasurements = action.payload;
    },
    setSelectedMetrics: (state, action) => {
      state.selectedMetrics = action.payload;
    },
    setMetricsNames: (state, action) => {
      state.metricsNames = action.payload;
    },
    updateLineColors: (state, action) => {
      state.lineColors = action.payload;
    },
    metricsApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
  },
});

export const metricsReducer = slice.reducer;
export const { actions } = slice;
