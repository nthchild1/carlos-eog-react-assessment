import React, { useEffect, useState } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import { ApolloProvider, useSubscription, useQuery } from "@apollo/client";
import { LineChart, Line, XAxis, CartesianGrid, YAxis } from "recharts";
import MetricSelect from "./MetricSelect";
import MeasurementsService from "./Measurements.service";

const getMinutesAgoDate = minutes => new Date() - minutes * 60 * 1000;
const timeRange = getMinutesAgoDate(30);

function Measurements() {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [displayedMetricsMeasurements, setDisplayedMetricsMeasurements] = useState({});

  const { subscribeToNewMeasurements, getMetricsNames, getMultipleMeasurements } = MeasurementsService.queries;

  const {
    loading: loadingMetricsNames,
    error: metricsNamesError,
    data: metricsNamesData = { getMetrics: [] },
  } = useQuery(getMetricsNames);

  const {
    loading: loadingMultipleMeasurements,
    error: multipleMeasurementsError,
    data: multipleMeasurementsData,
  } = useQuery(getMultipleMeasurements, {
    variables: {
      input: selectedMetrics.map(metricName => ({
        metricName,
        after: timeRange,
      })),
    },
  });

  const { data: newMeasurements, loading: loadingNewMeasurements } = useSubscription(subscribeToNewMeasurements);

  const loading = loadingMetricsNames || loadingNewMeasurements;

  useEffect(() => {
    if (!loadingNewMeasurements) {
      const rawMeasurement = newMeasurements.newMeasurement;
      const metricName = rawMeasurement.metric;

      if (metricName in displayedMetricsMeasurements) {
        const oldMeasurements = displayedMetricsMeasurements[rawMeasurement.metric] || [];

        setDisplayedMetricsMeasurements({
          ...displayedMetricsMeasurements,
          [rawMeasurement.metric]: [...oldMeasurements, rawMeasurement],
        });
      }
    }
  }, [newMeasurements]);

  useEffect(() => {
    if (multipleMeasurementsData && 'getMultipleMeasurements' in multipleMeasurementsData) {
      const rawData = multipleMeasurementsData.getMultipleMeasurements;

      const mappedMultipleMeasurements = rawData.reduce((acc, value, index) => {
        const oldMeasurements = displayedMetricsMeasurements[value.metric] || [];
        return {
          ...displayedMetricsMeasurements,
          [value.metric]: [...oldMeasurements, ...value.measurements],
        };
      }, displayedMetricsMeasurements);

      setDisplayedMetricsMeasurements(mappedMultipleMeasurements);
    }
  }, [selectedMetrics, loadingMultipleMeasurements]);

  if (loading) return <LinearProgress />;

  return (
    <div style={{ backgroundColor: "red", width: "100%", height: "100%" }}>
      <LineChart width={1000} height={400} style={{ backgroundColor: "white" }}>
        <XAxis dataKey="at" />
        <YAxis />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        {Object.keys(displayedMetricsMeasurements).map(metricName => (
          <Line
            key={metricName}
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            data={displayedMetricsMeasurements[metricName]}
          />
        ))}
      </LineChart>
      <div style={{ backgroundColor: "pink" }}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <MetricSelect {...{ selectedMetrics, setSelectedMetrics, metricsOptions: metricsNamesData.getMetrics }} />
      </div>
    </div>
  );
}

export default () => (
  <ApolloProvider client={MeasurementsService.client}>
    <Measurements />
  </ApolloProvider>
);
