import React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";

interface MetricSelectProps {
  selectedMetrics: string[];
  setSelectedMetrics: Function;
  metricsOptions: string[];
}

function MetricSelect({ selectedMetrics, setSelectedMetrics, metricsOptions }: MetricSelectProps) {
  return (
    <Autocomplete
      style={{
        flex: 1, width: "100%", padding: "2%",
      }}
      multiple
      value={selectedMetrics}
      onChange={(event, newValue) => {
        setSelectedMetrics([...newValue]);
      }}
      options={metricsOptions}
      renderInput={(params) => <TextField {...params} variant="outlined" label="metrics" placeholder="Select a metric" />}
    />
  );
}

export default MetricSelect;
