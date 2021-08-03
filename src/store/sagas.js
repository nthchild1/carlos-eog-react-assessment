import { spawn } from "redux-saga/effects";
import weatherSaga from "../Features/Weather/saga";
import measurementsSaga from "../Features/Measurements/Measurements.saga";

export default function* root() {
  yield spawn(measurementsSaga);
}
