import React, { useEffect, useState } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import { ApolloProvider, useSubscription, useQuery } from "@apollo/client";
import { LineChart, Line, XAxis, CartesianGrid, YAxis, Tooltip } from "recharts";
import moment from "moment";
import MetricSelect from './MetricSelect';
import MeasurementsService from './Measurements.service';

/* @ts-ignore */
const getMinutesAgoDate = minutes => new Date() - minutes * 60 * 1000;
const timeRange = getMinutesAgoDate(30);

function Measurements() {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [displayedMetricsMeasurements, setDisplayedMetricsMeasurements] = useState({});
  const [lineColors, setLineColors] = useState({});

  const { subscribeToNewMeasurements, getMetricsNames, getMultipleMeasurements } = MeasurementsService.queries;

  const { loading: loadingMetricsNames, error: metricsNamesError, data: metricsNamesData } = useQuery(getMetricsNames);

  const {
    loading: loadingMultipleMeasurements,
    error: multipleMeasurementsError,
    data: multipleMeasurementsData,
  } = useQuery(getMultipleMeasurements, {
    variables: {
      /* @ts-ignore */
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
          /* @ts-ignore */
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
        /* @ts-ignore */

        (acc, value) => ({
          ...acc,
          [value.metric]: [...value.measurements],
        }),
        {},
      );

      setDisplayedMetricsMeasurements(mappedMultipleMeasurements);
    }
  }, [selectedMetrics, loadingMultipleMeasurements]);

  useEffect(() => {
    setLineColors(
      /* @ts-ignore */
      ((metricsNamesData && metricsNamesData.getMetrics) || []).reduce(
        /* @ts-ignore */
        (acc, curr) => ({ ...acc, [curr]: `#${`${Math.random().toString(16)}00000`.slice(2, 8)}` }),
        {},
      ),
    );
  }, [metricsNamesData]);

  if (loading) return <LinearProgress />;

  return (
    <div style={{ flex: 1, width: '100%', height: '100%' }}>
      <LineChart width={1500} height={800}>
        <XAxis
          dataKey="at"
          domain={["auto", "auto"]}
          type="number"
          scale="time"
          tickFormatter={unixTime => moment(unixTime).format("mm:ss")}
        />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Tooltip labelFormatter={label => `${moment(label).format('hh:mm:ss')} hrs.`} />
        {selectedMetrics.map(metricName => (
          <YAxis dataKey="value" key={`${metricName}-yaxis`} yAxisId={metricName} />
        ))}
        {selectedMetrics.map(metricName => (
          <Line
            key={metricName}
            name={metricName}
            type="linear"
            strokeWidth={2}
            /* @ts-ignore */
            unit={displayedMetricsMeasurements[metricName][0].unit}
            dataKey="value"
            yAxisId={metricName}
            data={displayedMetricsMeasurements[metricName]}
            stroke={lineColors[metricName]}
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
