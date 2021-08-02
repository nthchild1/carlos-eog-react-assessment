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
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { LineChart, Line, XAxis, CartesianGrid, YAxis } from "recharts";
import { TextField } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
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

const GET_Measurements = gql`
  query($input: MeasurementQuery!) {
    getMeasurements(input: $input) {
      at
      value
      unit
      metric
    }
  }
`;

const GET_MeasurementsNames = gql`
  query {
    getMetrics
  }
`;

export default () => (
  <ApolloProvider client={client}>
    <Measurements />
  </ApolloProvider>
);

const Measurements = () => {
  const [now, setNow] = useState<string>("10000");

  const { loading: dogsLoading, error: dogsError, data: dogsData } = useQuery(GET_Measurements, {
    variables: {
      input: {
        metricName: "tubingPressure",
        after: `${parseInt(now) - 1000000}`,
      },
    },
  });

  const { loading: metricsLoading, error: metricsError, data: metricsData } = useQuery(GET_MeasurementsNames);

  useEffect(() => {
    setNow(Date.now().toString(10));
  }, []);

  useEffect(() => {
    if (dogsData && "getMeasurements" in dogsData) {
      setMeasurements([...dogsData.getMeasurements, ...measurements]);
    }
  }, [dogsData && "getMeasurements" in dogsData]);

  const { data, loading } = useSubscription(newMeasurements);

  const [measurements, setMeasurements] = useState([{}]);

  useEffect(() => {
    if (data && "newMeasurement" in data) {
      const { newMeasurement } = data;
      newMeasurement.metric === "flareTemp" && setMeasurements([...measurements, { ...newMeasurement }]);
    }
  }, [data]);

  const [selectedMetrics, setSelectedMetrics] = useState([]);

  if (loading) return <LinearProgress />;

  return (
    <div style={{ backgroundColor: "red", width: "100%", height: "100%" }}>
      <LineChart width={1000} height={400} data={measurements} style={{ backgroundColor: "white" }}>
        <XAxis dataKey="at" />
        <YAxis />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
      <div style={{ backgroundColor: "pink" }}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <MetricSelect {...{ selectedMetrics, setSelectedMetrics, metricsOptions: metricsData.getMetrics }} />
      </div>
    </div>
  );
};
