import { createSlice } from "redux-starter-kit";

export type MeasurementI = {
  metric: string,
  at: number,
  value: number,
  unit: string
}

export type MetricsMeasurements = {
  [key: string]: MeasurementI[]
}

export interface MetricsStateI {
  metricsMeasurements: MetricsMeasurements,
  selectedMetrics: Array<string>,
  lineColors: {[key: string] : string},
  metricsNames: string[]
}

const initialState : MetricsStateI = {
  metricsMeasurements: {},
  selectedMetrics: [],
  lineColors: {},
  metricsNames: [],
};

const slice = createSlice({
  name: "measurements",
  initialState,
  reducers: {
    metricMeasurementDataReceived: (state, action) => state,
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
    metricsApiErrorReceived: (state, action) => state,
  },
});

export const metricsReducer = slice.reducer;
export const { actions } = slice;
