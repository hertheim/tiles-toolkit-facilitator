export interface FeedbackCard {
  id: string;
  type: string;
  name: string;
  description: string;
}

export const feedbackCards: FeedbackCard[] = [
  {
    id: "f1",
    type: "Feedback",
    name: "Text",
    description: "The object displays a short text message to the user."
  },
  {
    id: "f2",
    type: "Feedback",
    name: "Motion",
    description: "The object moves in response to a trigger."
  },
  {
    id: "f3",
    type: "Feedback",
    name: "Emoji",
    description: "The object displays some kind of emotional response."
  },
  {
    id: "f4",
    type: "Feedback",
    name: "Timeline",
    description: "The object provides a visualization of data over time."
  },
  {
    id: "f5",
    type: "Feedback",
    name: "Shapeshift",
    description: "The object changes its shape in some way."
  },
  {
    id: "f6",
    type: "Feedback",
    name: "Vibrate",
    description: "The object starts vibrating."
  },
  {
    id: "f7",
    type: "Feedback",
    name: "Blink",
    description: "A point of light on the object starts blinking."
  },
  {
    id: "f8",
    type: "Feedback",
    name: "Color Change",
    description: "A light on the object changes or fades from one color to another."
  },
  {
    id: "f9",
    type: "Feedback",
    name: "Sound",
    description: "The object emits a sound."
  }
]; 