import React, { useEffect } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import { ApolloProvider, useSubscription, useQuery } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import MetricSelect from "./MetricSelect";
import MetricsService from "./Metrics.service";
import LabeledValueCard from "../../components/LabeledValueCard";
import { actions } from "./Metrics.reducer";
import Charts from "./Charts";
import MostRecentValueCards from "./MostRecentValueCards";

const getMinutesAgoDate = (minutes : number) : number => new Date().getTime() - minutes * 60 * 1000;
const timeRange = getMinutesAgoDate(30);

function Metrics() {
  const dispatch = useDispatch();

  // @ts-ignore
  const { metricsMeasurements, selectedMetrics, lineColors } = useSelector((state) => state.metrics);
  const { subscribeToNewMeasurements, getMetricsNames, getMultipleMeasurements } = MetricsService.queries;
  const { loading: loadingMetricsNames, error: metricsNamesError, data: metricsNamesData } = useQuery(getMetricsNames);
  const {
    loading: loadingMultipleMeasurements,
    error: multipleMeasurementsError,
    data: multipleMeasurementsData,
  } = useQuery(getMultipleMeasurements, {
    variables: {
      /* @ts-ignore */
      input: ((metricsNamesData && metricsNamesData.getMetrics) || []).map((metricName) => ({
        metricName,
        after: timeRange,
      })),
    },
  });

  const { data: newMeasurements, loading: loadingNewMeasurements } = useSubscription(
    subscribeToNewMeasurements, {
      onSubscriptionData: () => {
        if (!loadingNewMeasurements) {
          const rawMeasurement = newMeasurements.newMeasurement;
          dispatch(actions.metricMeasurementDataReceived({ ...rawMeasurement }));
        }
      },
    },
  );

  useEffect(() => {
    if (metricsNamesData) {
      dispatch(actions.setMetricsNames(metricsNamesData.getMetrics));
    }
  }, [metricsNamesData]);

  useEffect(() => {
    if (
      multipleMeasurementsData
        && "getMultipleMeasurements" in multipleMeasurementsData
        && Object.keys(metricsMeasurements).length === 0
    ) {
      dispatch(
        actions.multipleMeasurementDataReceived(multipleMeasurementsData.getMultipleMeasurements),
      );
    }
  }, [selectedMetrics, loadingMultipleMeasurements]);

  useEffect(() => {
    if (metricsNamesError || multipleMeasurementsError || multipleMeasurementsError) {
      const error = metricsNamesError || multipleMeasurementsError || multipleMeasurementsError;
      // @ts-ignore
      dispatch(actions.metricsApiErrorReceived({ error: error.message }));
    }
  }, [metricsNamesError, metricsNamesError, multipleMeasurementsError]);

  const setSelectedMetrics = (newSelectedMetrics: string[]) => {
    dispatch(actions.setSelectedMetrics(newSelectedMetrics));
  };

  if (loadingMetricsNames || loadingNewMeasurements || loadingMultipleMeasurements) return <LinearProgress />;

  return (
    <div style={{ width: "100%", height: "50%" }}>
      <MostRecentValueCards selectedMetrics={selectedMetrics} metricsMeasurements={metricsMeasurements} />
      <Charts
        selectedMetrics={selectedMetrics}
        metricsMeasurements={metricsMeasurements}
        lineColors={lineColors}
      />
      <MetricSelect
        selectedMetrics={selectedMetrics}
        setSelectedMetrics={setSelectedMetrics}
        metricsOptions={metricsNamesData.getMetrics}
      />
    </div>
  );
}

export default () => (
  <ApolloProvider client={MetricsService.client}>
    <Metrics />
  </ApolloProvider>
);
