import React from 'react';
import { useDispatch } from 'react-redux';
import LinearProgress from '@material-ui/core/LinearProgress';
import { WebSocketLink } from '@apollo/client/link/ws';
import { ApolloProvider, gql, HttpLink, split, useSubscription, ApolloClient, InMemoryCache } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { LineChart, Line } from 'recharts';

const wsLink = new WebSocketLink({
  uri: 'wss://react.eogresources.com/graphql',
  options: {
    reconnect: true,
  },
});

const httpLink = new HttpLink({
  uri: 'https://react.eogresources.com/graphql',
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

export default () => (
  <ApolloProvider client={client}>
    <Measurements />
  </ApolloProvider>
);

const Measurements = () => {
  const dispatch = useDispatch();

  const { data, loading } = useSubscription(newMeasurements);

  if (loading) return <LinearProgress />;

  return (
    <div style={{ backgroundColor: "red", flex: 1 }}>
      <LineChart width={400} height={400} data={data}>
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};
