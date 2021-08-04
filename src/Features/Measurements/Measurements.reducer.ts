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

interface InitialStateI {
  metricsMeasurements: MetricsMeasurements,
  selectedMetrics: Array<string | undefined>,
  lineColors: {[key: string] : string}
}

const initialState : InitialStateI = {
  metricsMeasurements: {},
  selectedMetrics: [],
  lineColors: {},
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
  },
});

export const measurementsReducer = slice.reducer;
export const { actions } = slice;
