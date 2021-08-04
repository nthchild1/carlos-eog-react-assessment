import { reducer as weatherReducer } from "../Features/Weather/reducer";
import { metricsReducer } from "../Features/Metrics/Metrics.reducer";

export default {
  weather: weatherReducer,
  metrics: metricsReducer,
};
