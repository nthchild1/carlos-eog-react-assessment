import React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";

interface MetricSelectProps {
  selectedMetrics: string[];
  setSelectedMetrics: Function
  metricsOptions: string[];
  className: string
}

function MetricSelect({
  selectedMetrics, setSelectedMetrics, metricsOptions, className,
}: MetricSelectProps) {
  return (
    <Autocomplete
      className={className}
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
