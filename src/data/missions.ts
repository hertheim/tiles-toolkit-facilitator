export interface MissionCard {
  id: string;
  type: string;
  name: string;
  goal: string;
  example: string;
}

export const missionCards: MissionCard[] = [
  {
    id: "m1",
    type: "Mission",
    name: "Time-saver",
    goal: "Create an idea that simplifies or automates a task that people normally spend time doing against their wishes.",
    example: "A washing machine that orders new detergent when it senses it is running low."
  },
  {
    id: "m2",
    type: "Mission",
    name: "Enjoyable Objects",
    goal: "Create an idea where the objects are so pleasant or playful to use that people will want to spend time with, regardless of what else it does.",
    example: "A piggy bank that starts smiling and grunting when you give it money."
  },
  {
    id: "m3",
    type: "Mission",
    name: "Social Interaction",
    goal: "Create an idea that helps to facilitate some kind of interaction between people.",
    example: "A pin for breaking the ice at a party that lights up when you are near your table companion."
  },
  {
    id: "m4",
    type: "Mission",
    name: "Habit Changing",
    goal: "Create an idea that helps a user to form or change a long-term habit. The usefulness decreases over time as the habit is established.",
    example: "Shoelaces that glow brighter or darker according with the number of steps taken during the day."
  },
  {
    id: "m5",
    type: "Mission",
    name: "Trojan Horse",
    goal: "Create an idea that seemingly does one thing, but where the intention is to produce another, deeper effect.",
    example: "A coffee cup that changes color when you have a scheduled appointment."
  },
  {
    id: "m6",
    type: "Mission",
    name: "Expression",
    goal: "Create an idea that allows new ways to express yourself creatively or emotionally.",
    example: "Stairs that turn into piano keys when someone steps on them."
  },
  {
    id: "m7",
    type: "Mission",
    name: "Safekeeping",
    goal: "Create an idea that protects the user or something that is valuable to the user.",
    example: "A bike that alerts you when it has moved while you are not around."
  },
  {
    id: "m8",
    type: "Mission",
    name: "Sixth Sense",
    goal: "Create an idea that gives the user some kind of superpower, like new types of senses, perceiving new information, etc.",
    example: "A necklace that changes color based on the air quality of your surroundings."
  },
  {
    id: "m9",
    type: "Mission",
    name: "Tangibles",
    goal: "Create an idea where the object itself solves a task where you would normally have had to use a screen.",
    example: "An umbrella that lights up when there is rain on the forecast for the day."
  },
  {
    id: "m10",
    type: "Mission",
    name: "Teleportation",
    goal: "Create and idea that makes you feel like being in multiple places at once, or that let you experience some aspects of a different place.",
    example: "An alarm clock that every morning wakes you up with sounds and lights from different places in the world."
  },
  {
    id: "m11",
    type: "Mission",
    name: "Obstacles",
    goal: "Create an idea where a task is intentionally made harder to discourage bad habits or create additional challenges.",
    example: "An alarm clock that moves around the room forcing the users to chase it if they are oversleeping."
  },
  {
    id: "m12",
    type: "Mission",
    name: "Omniscience",
    goal: "Create an idea that provides the user with knowledge, or with access to information.",
    example: "An earring that can translate foreign languages spoken around you to your native tongue."
  },
  {
    id: "m13",
    type: "Mission",
    name: "Immortality",
    goal: "Create an idea that can help the user save something for posterity, or perhaps that is able to give health benefits to the user.",
    example: "A mirror that takes a picture of you every day to keep a memory of that day in your life."
  },
  {
    id: "m14",
    type: "Mission",
    name: "Custom Mission",
    goal: "Formulate your own mission that addresses a specific challenge, value, or opportunity related to your chosen persona and context.",
    example: "How can we help refugees feel safer in public transport?"
  }
]; 