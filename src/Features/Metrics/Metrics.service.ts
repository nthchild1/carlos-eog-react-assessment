import { WebSocketLink } from "@apollo/client/link/ws";
import {
  ApolloClient, gql, HttpLink, InMemoryCache, split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";

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

const subscribeToNewMeasurements = gql`
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

const MetricsService = {
  client,
  queries: {
    subscribeToNewMeasurements,
    getMetricsNames,
    getMultipleMeasurements,
  },
};

export default MetricsService;
