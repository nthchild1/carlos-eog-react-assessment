import {
  takeEvery, select, put, call,
} from "redux-saga/effects";
import { PayloadAction } from "redux-starter-kit";
import { toast } from "react-toastify";
import { actions as MeasurementActions } from "./Metrics.reducer";
import { ApiErrorAction } from "../Weather/reducer";

/* @ts-ignore */
export function* receiveMeasurementData(action) : InitialStateI {
  const state = yield select();

  const { metricsMeasurements } = state.metrics;
  const rawMeasurement = { ...action.payload };

  const oldMeasurements = [...(metricsMeasurements[rawMeasurement.metric] || [])];

  oldMeasurements.shift();

  yield put(MeasurementActions.saveMeasurements({
    ...metricsMeasurements,
    [rawMeasurement.metric]: [...oldMeasurements, rawMeasurement],
  }));
}

/* @ts-ignore */
export function* receiveMultipleMeasurementData(action) {
  const rawData = action.payload;

  const mappedMultipleMeasurements = rawData.reduce(
    /* @ts-ignore */
    (acc, value) => ({
      ...acc,
      [value.metric]: [...value.measurements],
    }),
    {},
  );
  yield put(MeasurementActions.saveMeasurements(mappedMultipleMeasurements));
}

// TODO: dont replace existing colors
/* @ts-ignore */
export function* generateRandomLineColor(action) {
  /* @ts-ignore */
  const state = yield select();

  const { metricsNames } = state.metrics;

  if (metricsNames.length > 0) {
    const lineColors = metricsNames.reduce(
      /* @ts-ignore */
      (acc, curr) => ({ ...acc, [curr]: `#${`${Math.random().toString(16)}00000`.slice(2, 8)}` }),
      {},
    );

    yield put(MeasurementActions.updateLineColors(lineColors));
  }
}

function* apiErrorReceived(action: PayloadAction<ApiErrorAction>) {
  yield call(toast.error, `Error Received: ${action.payload.error}`);
}

export default function* rootSaga() {
  yield takeEvery(MeasurementActions.multipleMeasurementDataReceived.type, receiveMultipleMeasurementData);
  yield takeEvery(MeasurementActions.metricMeasurementDataReceived.type, receiveMeasurementData);
  yield takeEvery(MeasurementActions.setSelectedMetrics.type, generateRandomLineColor);
  yield takeEvery(MeasurementActions.metricsApiErrorReceived.type, apiErrorReceived);
}
