export interface Persona {
  id: string;
  name: string;
  description: string;
  background: string;
  needs: string[];
}

export const personas: Persona[] = [
  {
    id: "p1",
    name: "Rural Farmer",
    description: "Small-scale farmer living in a rural area with limited access to technology and resources.",
    background: "Works with traditional farming methods but faces challenges from changing climate patterns.",
    needs: [
      "Affordable solutions that work without consistent electricity",
      "Tools to increase crop yield despite changing weather patterns",
      "Ways to access market information without reliable internet"
    ]
  },
  {
    id: "p2",
    name: "Urban Student",
    description: "University student living in a densely populated city with technological literacy but limited space.",
    background: "Concerned about sustainability and wants to make practical changes in their daily life.",
    needs: [
      "Solutions that work in small living spaces",
      "Tools to reduce resource consumption",
      "Affordable and practical sustainability improvements"
    ]
  },
  {
    id: "p3",
    name: "School Teacher",
    description: "Primary school teacher working in an underresourced community school.",
    background: "Passionate about education but limited by available teaching tools and resources.",
    needs: [
      "Low-cost educational tools that engage students",
      "Solutions that work with or without reliable electricity",
      "Tools to improve classroom sustainability and awareness"
    ]
  },
  {
    id: "p4",
    name: "Community Health Worker",
    description: "Healthcare provider working across multiple rural communities with basic medical training.",
    background: "Travels between villages providing essential care with limited equipment and support.",
    needs: [
      "Portable and durable health monitoring tools",
      "Solutions that work in areas without reliable infrastructure",
      "Ways to improve community health education and awareness"
    ]
  },
  {
    id: "p5",
    name: "Sustainability Coordinator",
    description: "Professional responsible for improving sustainability metrics at a medium-sized company.",
    background: "Needs to demonstrate ROI on sustainability initiatives to management.",
    needs: [
      "Tools to measure and visualize resource usage",
      "Solutions to engage employees in sustainability practices",
      "Cost-effective improvements that show clear benefits"
    ]
  },
  {
    id: "p6",
    name: "Elder Resident",
    description: "Older adult living independently in a changing neighborhood with limited digital literacy.",
    background: "Values self-sufficiency but faces challenges with new technologies and changing climate.",
    needs: [
      "Intuitive solutions that don't require technical expertise",
      "Tools to maintain comfort and safety in extreme weather",
      "Affordable ways to reduce utility costs"
    ]
  },
  {
    id: "p7",
    name: "Refugee Resettlement Worker",
    description: "Aid worker helping relocated refugees establish new lives in unfamiliar environments.",
    background: "Works with diverse populations facing language, cultural, and resource barriers.",
    needs: [
      "Multilingual or non-verbal tools for diverse populations",
      "Solutions for temporary housing with sustainability features",
      "Resource-efficient approaches to basic needs"
    ]
  },
  {
    id: "p8",
    name: "Small Business Owner",
    description: "Entrepreneur running a local shop with interest in sustainability but tight profit margins.",
    background: "Wants to implement green practices but needs solutions that are practical and affordable.",
    needs: [
      "Low-cost ways to reduce waste and energy use",
      "Tools to engage customers in sustainability initiatives",
      "Solutions that provide business benefits while being environmentally friendly"
    ]
  }
];

export interface PersonaCard {
  id: string;
  type: string;
  name: string;
  description: string;
}

export const personaCards: PersonaCard[] = [
  {
    id: "p1",
    type: "Persona",
    name: "Refugee",
    description: "A 22 years old war refugee, named Jena, or her friends and family."
  },
  {
    id: "p2",
    type: "Persona",
    name: "Emergency Worker",
    description: "A 46 year old firefighter, named Paul, or his rescue team."
  },
  {
    id: "p3",
    type: "Persona",
    name: "Tourist",
    description: "A 52 years old tourist, named Peter, or his travel group."
  },
  {
    id: "p4",
    type: "Persona",
    name: "Construction Worker",
    description: "A 37 years old city worker, named Jane, or her work team."
  },
  {
    id: "p5",
    type: "Persona",
    name: "Disabled",
    description: "A 43 years old that lives on a wheelchair, named Tom, or his paralympic sport team."
  },
  {
    id: "p6",
    type: "Persona",
    name: "Elderly",
    description: "A 72 years old retired man called Harry, or his group of friends from the retirement home."
  },
  {
    id: "p7",
    type: "Persona",
    name: "Child",
    description: "A 3 year old girl, named Bea or her group of friends and schoolmates."
  },
  {
    id: "p8",
    type: "Persona",
    name: "Yourself",
    description: "You, your family, or other social groups or communities you are part of."
  },
  {
    id: "p9",
    type: "Persona",
    name: "Custom Persona",
    description: "Sketch or describe your new user group or persona here."
  }
]; 