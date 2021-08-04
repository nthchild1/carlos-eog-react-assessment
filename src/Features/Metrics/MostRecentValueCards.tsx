import React from "react";
import LabeledValueCard from "../../components/LabeledValueCard";
import { MetricsMeasurements } from "./Metrics.reducer";

interface MostRecentValueCardsProps {
    selectedMetrics: string[],
    metricsMeasurements: MetricsMeasurements,
    containerClassName: string
}

function MostRecentValueCards({
  selectedMetrics,
  metricsMeasurements,
  containerClassName,
} : MostRecentValueCardsProps) {
  const getLastKnownMeasurement = (selectedMetric : string) => {
    const lastKnownMeasurement = metricsMeasurements[selectedMetric][metricsMeasurements[selectedMetric].length - 1];
    return `${lastKnownMeasurement.value} ${lastKnownMeasurement.unit}`;
  };

  return (
    <div className={containerClassName}>
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
