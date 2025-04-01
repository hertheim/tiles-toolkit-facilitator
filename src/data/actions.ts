export interface ActionCard {
  id: string;
  type: string;
  name: string;
  description: string;
}

export const actionCards: ActionCard[] = [
  {
    id: "a1",
    type: "Human Actions",
    name: "Shake",
    description: "The user shakes the object."
  },
  {
    id: "a2",
    type: "Human Actions",
    name: "Rotate",
    description: "The user rotates the object along one of the three axes."
  },
  {
    id: "a3",
    type: "Human Actions",
    name: "Proximity",
    description: "The user moves near the object without actually touching it."
  },
  {
    id: "a4",
    type: "Human Actions",
    name: "Tap",
    description: "The user taps the object, either with a single or double tap."
  },
  {
    id: "a5",
    type: "Human Actions",
    name: "Location Change",
    description: "The user moves the object to a specific location, or away from it."
  },
  {
    id: "a6",
    type: "Human Actions",
    name: "Tilt",
    description: "The user tilts the object on one of the three axes."
  },
  {
    id: "a7",
    type: "Human Actions",
    name: "Lift",
    description: "The user lifts the object from a static surface."
  },
  {
    id: "a8",
    type: "Human Actions",
    name: "Drop",
    description: "The user drops the object to the ground."
  },
  {
    id: "a9",
    type: "Human Actions",
    name: "Custom Action",
    description: "Sketch or describe your new human action here."
  }
]; 