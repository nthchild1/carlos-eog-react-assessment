import React from "react";
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import moment from "moment";
import { MetricsMeasurements } from "./Metrics.reducer";

interface ChartsProps {
    selectedMetrics: string[],
    metricsMeasurements: MetricsMeasurements,
    lineColors: {[key: string] : string},
}

function Charts({ selectedMetrics, metricsMeasurements, lineColors }: ChartsProps) {
  return (
    <ResponsiveContainer>
      <LineChart>
        <XAxis
          dataKey="at"
          domain={["auto", "auto"]}
          type="number"
          scale="time"
          tickFormatter={(unixTime) => moment(unixTime).format("mm:ss")}
        />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Tooltip labelFormatter={(label) => `${moment(label).format("hh:mm:ss")} hrs.`} />
        {selectedMetrics.map((metricName) => (
          <YAxis
            dataKey="value"
            key={`${metricName}-yaxis`}
            yAxisId={metricName}
            name={metricName}
            unit={metricsMeasurements[metricName][0].unit}
          />
        ))}
        {selectedMetrics.map((metricName) => (
          <Line
            key={metricName}
            name={metricName}
            type="linear"
            strokeWidth={2}
            unit={metricsMeasurements[metricName][0].unit}
            dataKey="value"
            yAxisId={metricName}
            data={metricsMeasurements[metricName]}
            stroke={lineColors[metricName]}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default Charts;
