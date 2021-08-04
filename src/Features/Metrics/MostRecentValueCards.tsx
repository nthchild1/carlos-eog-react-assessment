import React from "react";
import LabeledValueCard from "../../components/LabeledValueCard";
import { MetricsMeasurements } from "./Metrics.reducer";

interface MostRecentValueCardsProps {
    selectedMetrics: string[],
    metricsMeasurements: MetricsMeasurements,
}

function MostRecentValueCards({
  selectedMetrics,
  metricsMeasurements,
} : MostRecentValueCardsProps) {
  const getLastKnownMeasurement = (selectedMetric : string) => {
    const lastKnownMeasurement = metricsMeasurements[selectedMetric][metricsMeasurements[selectedMetric].length - 1];
    return `${lastKnownMeasurement.value} ${lastKnownMeasurement.unit}`;
  };

  return (
    <div style={{
      display: "flex", flexDirection: "row", width: "100%", padding: "1%", alignContent: "flex-start",
    }}
    >
      {selectedMetrics && selectedMetrics.length > 0 && selectedMetrics.map(
        (selectedMetric: string) => (
          <LabeledValueCard
            label={selectedMetric}
            value={getLastKnownMeasurement(selectedMetric)}
            key={`${selectedMetric}-readingcard`}
          />
        ),
      )}
    </div>
  );
}

export default MostRecentValueCards;
