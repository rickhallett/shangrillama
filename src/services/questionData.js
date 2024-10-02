// services/questionData.js
export const questions = [
    {
      id: "style_preference",
      text: "Before we dive in, how would you like the questions in this questionnaire to be worded?",
      type: "multiple-choice",
      options: [
        {"text": "Formal and straightforward", "style": "formal", "weight": 1},
        {"text": "Funny and lighthearted", "style": "funny", "weight": 1},
        {"text": "Flirty and playful", "style": "flirty", "weight": 1},
        {"text": "Outrageous and daring", "style": "outrageous", "weight": 1}
      ]
    },
    {
      id: "authenticity",
      text: "How comfortable are you sharing your true feelings, even when they're difficult?",
      type: "multiple-choice",
      options: [
        {"text": "Very comfortable, I always express my true self", "score": 5},
        {"text": "Somewhat comfortable, but it depends on the situation", "score": 3},
        {"text": "I prefer to keep my feelings to myself", "score": 1}
      ]
    },
    {
      id: "humor",
      text: "How would you react if your date accidentally called you by their ex's name?",
      type: "multiple-choice",
      options: [
        {"text": "Laugh it off and make a joke about it", "score": 5},
        {"text": "Feel a bit awkward but try to move past it", "score": 3},
        {"text": "Get upset and consider ending the date", "score": 1}
      ]
    },
    {
      id: "meditation",
      text: "How often do you practice meditation or mindfulness?",
      type: "multiple-choice",
      options: [
        {"text": "Daily", "score": 5},
        {"text": "A few times a week", "score": 4},
        {"text": "Occasionally", "score": 3},
        {"text": "I've tried it but don't practice regularly", "score": 2},
        {"text": "Never", "score": 1}
      ]
    },
    {
      id: "strength",
      text: "In a hypothetical scenario, how confident are you in your ability to pull a small plow?",
      type: "multiple-choice",
      options: [
        {"text": "I could probably pull a tractor", "score": 5},
        {"text": "I could manage a small plow with ease", "score": 4},
        {"text": "I might be able to pull a plow with some effort", "score": 3},
        {"text": "I'd struggle but give it my best shot", "score": 2},
        {"text": "I'd rather not try", "score": 1}
      ]
    }
  ];