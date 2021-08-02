import React, { useEffect, useState } from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import { WebSocketLink } from "@apollo/client/link/ws";
import {
  ApolloProvider,
  gql,
  HttpLink,
  split,
  useSubscription,
  ApolloClient,
  InMemoryCache,
  useQuery,
  useLazyQuery,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { LineChart, Line, XAxis, CartesianGrid, YAxis } from "recharts";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import MetricSelect from "./MetricSelect";

const wsLink = new WebSocketLink({
  uri: "wss://react.eogresources.com/graphql",
  options: {
    reconnect: true,
  },
});

const httpLink = new HttpLink({
  uri: "https://react.eogresources.com/graphql",
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

const newMeasurements = gql`
  subscription MeasurementsSubs {
    newMeasurement {
      value
      metric
      at
      unit
    }
  }
`;

const getMetricsNames = gql`
  query {
    getMetrics
  }
`;

const getMultipleMeasurements = gql`
  query($input: [MeasurementQuery]) {
    getMultipleMeasurements(input: $input) {
      metric
      measurements {
        at
        value
        metric
        unit
      }
    }
  }
`;

export default () => (
  <ApolloProvider client={client}>
    <Measurements />
  </ApolloProvider>
);

const getMinutesAgoDate = minutes => new Date() - minutes * 60 * 1000;
const timeRange = getMinutesAgoDate(30);

const Measurements = () => {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [displayedMetricsMeasurements, setDisplayedMetricsMeasurements] = useState({});

  const {
    loading: metricsNamesLoading,
    error: metricsNamesError,
    data: metricsNamesData = { getMetrics: [] },
  } = useQuery(getMetricsNames);

  const {
    loading: multipleMeasurementsLoading,
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

  const { data, loading } = useSubscription(newMeasurements);

  useEffect(() => {
    if (!loading) {
      const rawMeasurement = data.newMeasurement;
      const metricName = rawMeasurement.metric;

      if (metricName in displayedMetricsMeasurements) {
        const oldMeasurements = displayedMetricsMeasurements[rawMeasurement.metric] || [];

        setDisplayedMetricsMeasurements({
          ...displayedMetricsMeasurements,
          [rawMeasurement.metric]: [...oldMeasurements, rawMeasurement],
        });
      }
    }
  }, [data]);

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
  }, [selectedMetrics, multipleMeasurementsLoading]);

  if (false) return <LinearProgress />;

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
};
