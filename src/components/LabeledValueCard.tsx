import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Typography } from "@material-ui/core";

interface LabeledValueCardProps {
    label: string,
    value: string | number
}

function LabeledValueCard({ label, value }: LabeledValueCardProps) {
  return (
    <Card style={{ marginLeft: "1%", marginRight: "1%", width: "12em" }}>
      <CardContent>
        <Typography variant="h6">{label}</Typography>
        <Typography>{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default LabeledValueCard;
