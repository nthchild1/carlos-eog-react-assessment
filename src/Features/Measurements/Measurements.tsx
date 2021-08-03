import React, { useEffect, useState } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import { ApolloProvider, useSubscription, useQuery } from "@apollo/client";
import { LineChart, Line, XAxis, CartesianGrid, YAxis, Tooltip } from "recharts";
import moment from "moment";
import MetricSelect from './MetricSelect';
import MeasurementsService from './Measurements.service';

const getMinutesAgoDate = minutes => new Date() - minutes * 60 * 1000;
const timeRange = getMinutesAgoDate(0.5);

function Measurements() {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [displayedMetricsMeasurements, setDisplayedMetricsMeasurements] = useState({});

  const { subscribeToNewMeasurements, getMetricsNames, getMultipleMeasurements } = MeasurementsService.queries;

  const { loading: loadingMetricsNames, error: metricsNamesError, data: metricsNamesData } = useQuery(getMetricsNames);

  const {
    loading: loadingMultipleMeasurements,
    error: multipleMeasurementsError,
    data: multipleMeasurementsData,
  } = useQuery(getMultipleMeasurements, {
    variables: {
      input: ((metricsNamesData && metricsNamesData.getMetrics) || []).map(metricName => ({
        metricName,
        after: timeRange,
      })),
    },
  });

  const { data: newMeasurements, loading: loadingNewMeasurements } = useSubscription(subscribeToNewMeasurements, {
    onSubscriptionData: () => {
      if (!loadingNewMeasurements) {
        const rawMeasurement = newMeasurements.newMeasurement;
        const metricName = rawMeasurement.metric;

        if (metricName in displayedMetricsMeasurements) {
          const oldMeasurements = [...displayedMetricsMeasurements[rawMeasurement.metric]] || [];

          oldMeasurements.shift();

          setDisplayedMetricsMeasurements({
            ...displayedMetricsMeasurements,
            [rawMeasurement.metric]: [...oldMeasurements, rawMeasurement],
          });
        }
      }
    },
  });

  const loading = loadingMetricsNames || loadingNewMeasurements;

  useEffect(() => {
    if (
      multipleMeasurementsData &&
      "getMultipleMeasurements" in multipleMeasurementsData &&
      Object.keys(displayedMetricsMeasurements).length === 0
    ) {
      const rawData = multipleMeasurementsData.getMultipleMeasurements;

      const mappedMultipleMeasurements = rawData.reduce(
        (acc, value) => ({
          ...acc,
          [value.metric]: [...value.measurements],
        }),
        {},
      );

      setDisplayedMetricsMeasurements(mappedMultipleMeasurements);
    }
  }, [selectedMetrics, loadingMultipleMeasurements]);

  if (loading) return <LinearProgress />;

  return (
    <div style={{ flex: 1, width: '100%', height: '100%' }}>
      <LineChart width={1000} height={800}>
        <XAxis dataKey="at" tickFormatter={unixTime => moment(unixTime).format("mm:ss")} />
        <YAxis dataKey="value" />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Tooltip labelFormatter={label => `${moment(label).format('hh:mm:ss')} hrs.`} />
        {selectedMetrics.map(metricName => (
          <Line
            key={metricName}
            name={metricName}
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            data={displayedMetricsMeasurements[metricName]}
          />
        ))}
      </LineChart>
      <div>
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
