export interface CriteriaCard {
  id: string;
  type: string;
  name: string;
  description: string;
  question: string;
}

export const criteriaCards: CriteriaCard[] = [
  {
    id: "c1",
    type: "Criteria",
    name: "Sustainability",
    description: "An idea that is environmentally friendly or that can encourage sustainable behaviors.",
    question: "Would the product idea be a net positive for the environment? How does its lifecycle look like?"
  },
  {
    id: "c2",
    type: "Criteria",
    name: "Market Potential",
    description: "Product ideas that attract a large audience which is willing to pay to use them.",
    question: "How would investors respond to the product idea? Can you see a big company formed around the product?"
  },
  {
    id: "c3",
    type: "Criteria",
    name: "User Friendly",
    description: "Ideas that solve a real need for the users and that are easy to use for a large number of people.",
    question: "Would users' life be easier with the product than without it? Could both children and elderlies use it?"
  },
  {
    id: "c4",
    type: "Criteria",
    name: "Feasibility",
    description: "Ideas that solve the problem in a plausible manner and seem realistic to develop.",
    question: "Would you invest your savings in the development of the product idea? Do you know about similar products being successful?"
  },
  {
    id: "c5",
    type: "Criteria",
    name: "Creativity",
    description: "Ideas that solve the problem in a clever and unusual way.",
    question: "Does the product idea surprise you or make you think twice about the problem? Would you turn your head if you saw someone else using it?"
  },
  {
    id: "c6",
    type: "Criteria",
    name: "Attraction",
    description: "The attractiveness of the idea, as in products that the user is proud to own.",
    question: "Would you like to have the product for yourself? Do you think the target audience would like it as well?"
  },
  {
    id: "c7",
    type: "Criteria",
    name: "Utility",
    description: "How useful and practical are the ideas.",
    question: "Does the idea solve a real problem for its users? Can you imagine it being used every day?"
  },
  {
    id: "c8",
    type: "Criteria",
    name: "Enjoyment",
    description: "How fun or enjoyable are the ideas for their users.",
    question: "Would you like to spend time with the product, even if you don't really need it? Is it something you would tell your friends about?"
  },
  {
    id: "c9",
    type: "Criteria",
    name: "Innovation",
    description: "Ideas that solve new problems through skillful use of technology.",
    question: "Would technology pioneers be interested in your idea? How would the news headlines about the idea read like?"
  },
  {
    id: "c10",
    type: "Criteria",
    name: "Custom Criteria",
    description: "Describe a criteria of your choice here.",
    question: ""
  }
]; 