import {
  takeEvery, select, put, call,
} from "redux-saga/effects";
import { PayloadAction } from "redux-starter-kit";
import { toast } from "react-toastify";
import {
  actions as MeasurementActions, MeasurementI, MetricsMeasurements, MetricsStateI,
} from "./Metrics.reducer";
import { ApiErrorAction } from "../Weather/reducer";


export function* receiveMeasurementData(action : PayloadAction<MeasurementI>) {
  // @ts-ignore
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

export function* receiveMultipleMeasurementData(
  action : PayloadAction<Array<{measurements: MeasurementI[],
  metric: string}>>,
) {
  const rawData = action.payload;

  const mappedMultipleMeasurements : MetricsMeasurements = rawData.reduce(
    (acc, value) => ({
      ...acc,
      [value.metric]: [...value.measurements],
    }),
    {},
  );

  yield put(MeasurementActions.saveMeasurements(mappedMultipleMeasurements));
}

export function* generateRandomLineColor() {
  const state : {metrics: MetricsStateI} = yield select();

  const { metricsNames, lineColors } = state.metrics;

  if (metricsNames.length > 0) {
    const newLineColors = metricsNames.reduce(
      (acc, curr) => ({ ...acc, [curr]: curr in lineColors ? lineColors[curr] : `#${`${Math.random().toString(16)}00000`.slice(2, 8)}` }),
      {},
    );

    yield put(MeasurementActions.updateLineColors(newLineColors));
  }
}

function* apiErrorReceived(action: PayloadAction<ApiErrorAction>) {
  yield call(toast.error, `Error Received: ${action.payload.error}`);
}

export default function* rootMetricsSaga() {
  yield takeEvery(MeasurementActions.multipleMeasurementDataReceived.type, receiveMultipleMeasurementData);
  yield takeEvery(MeasurementActions.metricMeasurementDataReceived.type, receiveMeasurementData);
  yield takeEvery(MeasurementActions.setSelectedMetrics.type, generateRandomLineColor);
  yield takeEvery(MeasurementActions.metricsApiErrorReceived.type, apiErrorReceived);
}
