import React from "react";

interface LabeledValueCardProps {
    label: string,
    value: string | number
}

function LabeledValueCard({ label, value }: LabeledValueCardProps) {
  return (
    <div>
      <div>{label}</div>
      <div>{value}</div>
    </div>
  );
}

export default LabeledValueCard;
