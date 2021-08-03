import {
  takeEvery, call, select, put,
} from "redux-saga/effects";
import { toast } from "react-toastify";
import { PayloadAction } from "redux-starter-kit";
import { actions as MeasurementActions, ApiErrorAction } from "./Measurements.reducer";


function* apiErrorReceived(action: PayloadAction<ApiErrorAction>) {
  yield call(toast.error, `Error Received: ${action.payload.error}`);
}

export function* watchApiError() {
  yield takeEvery(MeasurementActions.weatherApiErrorReceived.type, apiErrorReceived);
}

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

}

export default function* watchMeasurementSubscription() {
  yield takeEvery(MeasurementActions.metricMeasurementDataReceived.type, receiveMeasurementData);
}
