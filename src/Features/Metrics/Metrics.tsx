import React, { useEffect } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import { ApolloProvider, useSubscription, useQuery } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import MetricSelect from "./MetricSelect";
import MetricsService from "./Metrics.service";
import { actions } from "./Metrics.reducer";
import Charts from "./Charts";
import MostRecentValueCards from "./MostRecentValueCards";
import { IState } from "../../store";

const getMinutesAgoDate = (minutes : number) : number => new Date().getTime() - minutes * 60 * 1000;
const timeRange = getMinutesAgoDate(30);

const useStyles = makeStyles({
  container: { width: "100%", height: "50%" },
  card: {
    display: "flex", flexDirection: "row", width: "100%", padding: "1%", alignContent: "flex-start",
  },
  select: {
    flex: 1, width: "100%", padding: "2%",
  },
});

function Metrics() {
  const dispatch = useDispatch();
  const classes = useStyles();

  const { metricsMeasurements, selectedMetrics, lineColors } = useSelector((state: IState) => state.metrics);
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

  const { data: newMeasurements, error: newMeasurementsError, loading: loadingNewMeasurements } = useSubscription(
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
  }, [metricsNamesData, dispatch]);

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
  }, [selectedMetrics, loadingMultipleMeasurements, dispatch, metricsMeasurements, multipleMeasurementsData]);

  useEffect(() => {
    if (metricsNamesError || multipleMeasurementsError || newMeasurementsError) {
      const error = metricsNamesError || multipleMeasurementsError || newMeasurementsError;
      // @ts-ignore
      dispatch(actions.metricsApiErrorReceived({ error: error.message }));
    }
  }, [metricsNamesError, newMeasurementsError, multipleMeasurementsError, dispatch]);

  const setSelectedMetrics = (newSelectedMetrics: string[]) => {
    dispatch(actions.setSelectedMetrics(newSelectedMetrics));
  };

  if (loadingMetricsNames || loadingNewMeasurements || loadingMultipleMeasurements) return <LinearProgress />;


  return (
    <div className={classes.container}>
      <MostRecentValueCards
        selectedMetrics={selectedMetrics}
        metricsMeasurements={metricsMeasurements}
        containerClassName={classes.card}
      />
      <Charts
        selectedMetrics={selectedMetrics}
        metricsMeasurements={metricsMeasurements}
        lineColors={lineColors}
      />
      <MetricSelect
        selectedMetrics={selectedMetrics}
        setSelectedMetrics={setSelectedMetrics}
        metricsOptions={metricsNamesData.getMetrics}
        className={classes.select}
      />
    </div>
  );
}

export default () => (
  <ApolloProvider client={MetricsService.client}>
    <Metrics />
  </ApolloProvider>
);
