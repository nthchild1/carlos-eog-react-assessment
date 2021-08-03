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
  selectedMetrics: Array<string | undefined>
}

const initialState : InitialStateI = {
  metricsMeasurements: {},
  selectedMetrics: [],
};

const slice = createSlice({
  name: "measurements",
  initialState,
  reducers: {
    metricMeasurementDataReceived: (state, action: PayloadAction<MeasurementI>) => state,
    weatherApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
    saveMeasurements: (state, action) => {
      state.metricsMeasurements = action.payload;
    },
  },
});

export const measurementsReducer = slice.reducer;
export const { actions } = slice;
