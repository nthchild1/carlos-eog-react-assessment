import { reducer as weatherReducer } from "../Features/Weather/reducer";
import { measurementsReducer } from "../Features/Measurements/Measurements.reducer";

export default {
  weather: weatherReducer,
  metrics: measurementsReducer,
};
