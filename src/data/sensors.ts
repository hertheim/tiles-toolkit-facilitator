export interface SensorCard {
  id: string;
  type: string;
  name: string;
  description: string;
}

export const sensorCards: SensorCard[] = [
  {
    id: "s1",
    type: "Sensor",
    name: "Water Quality",
    description: "Water quality of the environment where the object is placed."
  },
  {
    id: "s2",
    type: "Sensor",
    name: "Location",
    description: "Latitude and longitude coordinates of the object."
  },
  {
    id: "s3",
    type: "Sensor",
    name: "Air Pollution",
    description: "Pollution of the air surrounding the object."
  },
  {
    id: "s4",
    type: "Sensor",
    name: "Weight",
    description: "Weight or change of weight of the object."
  },
  {
    id: "s5",
    type: "Sensor",
    name: "Humidity",
    description: "Air humidity of the ambient where the object is placed."
  },
  {
    id: "s6",
    type: "Sensor",
    name: "Temperature",
    description: "Temperature of the object or the ambient in its surroundings."
  },
  {
    id: "s7",
    type: "Sensor",
    name: "Motion",
    description: "Movement of humans or animals detected in the proximity of the object."
  },
  {
    id: "s8",
    type: "Sensor",
    name: "Distance",
    description: "Distance measured from the object to an external obstacle."
  },
  {
    id: "s9",
    type: "Sensor",
    name: "Soil Moisture",
    description: "Humidity and water contained in the soil where the object is placed."
  },
  {
    id: "s10",
    type: "Sensor",
    name: "Energy",
    description: "Energy usage of the object."
  },
  {
    id: "s11",
    type: "Sensor",
    name: "Sound",
    description: "Noise and sounds from the ambient surrounding the object."
  },
  {
    id: "s12",
    type: "Sensor",
    name: "Custom Sensor",
    description: "Sketch or describe your new sensor here."
  }
]; 