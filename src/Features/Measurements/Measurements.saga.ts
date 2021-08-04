import {
  takeEvery, select, put,
} from "redux-saga/effects";
import { actions as MeasurementActions } from "./Measurements.reducer";

/* @ts-ignore */
export function* receiveMeasurementData(action) {
  /* @ts-ignore */
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

export default function* watchMeasurementSubscription() {
  yield takeEvery(MeasurementActions.metricMeasurementDataReceived.type, receiveMeasurementData);
  yield takeEvery(MeasurementActions.multipleMeasurementDataReceived.type, receiveMultipleMeasurementData);
}
