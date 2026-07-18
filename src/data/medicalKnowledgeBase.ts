export interface KnowledgeParameter {
  name: string;
  aliases: string[];
  unit: string;
  normalRangeText: string;
  normalMin: number;
  normalMax: number;
  clinicalMeaning: string;
  whatItIs: string;
  meaningLessIsBad?: boolean; // e.g. for HDL, eGFR, Hemoglobin where low is bad
  simpleExplanations: {
    normal: string;
    high: string;
    low: string;
  };
  healthImpacts: {
    normal: string;
    high: string;
    low: string;
  };
  actions: {
    normal: string[];
    high: string[];
    low: string[];
  };
}

export const medicalKnowledgeBase: KnowledgeParameter[] = [
  {
    name: "Fasting Blood Sugar",
    aliases: ["bloodSugar", "glucose", "fasting glucose", "serum glucose", "fasting blood glucose", "sugar"],
    unit: "mg/dL",
    normalRangeText: "70 - 99 mg/dL",
    normalMin: 70,
    normalMax: 99,
    clinicalMeaning: "A measure of the glucose (sugar) in your blood after you haven't eaten for at least 8 hours.",
    whatItIs: "The fuel sugar in your bloodstream that your body uses for energy.",
    simpleExplanations: {
      normal: "Your blood sugar is right where it needs to be! Just like a car with the perfect amount of gas, your body has just enough energy sugar floating around.",
      high: "Your blood sugar is elevated. Imagine your blood has too many sweet sugar cubes floating in it, like a syrup that is a bit too thick.",
      low: "Your blood sugar is lower than recommended. It is like your body's motor is running out of fuel, which can make you feel sleepy or shaky."
    },
    healthImpacts: {
      normal: "This means your body is doing a great job turning food into energy and staying in perfect balance.",
      high: "Too much sugar over a long time can make blood scratch your tiny blood tube walls. This can make your heart work harder and increases diabetes risks.",
      low: "When sugar is too low, your brain doesn't get enough quick power, which can lead to dizziness or low energy."
    },
    actions: {
      normal: ["Keep eating healthy balanced meals.", "Stay active with daily play or walks.", "Drink plenty of water."],
      high: ["Eat fewer sugary snacks, cakes, and white bread.", "Walk or run for 20-30 minutes after meals.", "Have lots of high-fiber foods like vegetables."],
      low: ["Eat a small healthy snack if you feel weak.", "Don't skip your main meals.", "Consult a doctor for advice if it happens often."]
    }
  },
  {
    name: "Random Blood Sugar",
    aliases: ["random glucose", "casual blood sugar"],
    unit: "mg/dL",
    normalRangeText: "Under 140 mg/dL",
    normalMin: 70,
    normalMax: 140,
    clinicalMeaning: "A blood sugar measurement taken at any time, regardless of when you last ate.",
    whatItIs: "The sugar level in your blood at any random time during the day.",
    simpleExplanations: {
      normal: "Your blood sugar is currently in a safe and healthy spot! Your body is handling the food you ate really well.",
      high: "Your current sugar level is quite high. After eating, our body usually packs sugar away, but right now it's lingering in your blood like traffic.",
      low: "Your sugar level is very low. Your body needs a little boost of energy fuel right now."
    },
    healthImpacts: {
      normal: "Indicates normal insulin function and glucose clearing throughout a standard day.",
      high: "Consistently high casual sugars can make you feel very thirsty and tired, and point to sugar control difficulties.",
      low: "Can lead to immediate fatigue, sweating, or feeling faint because your cells are starving for glucose."
    },
    actions: {
      normal: ["Enjoy your healthy eating habits.", "Keep playing and exercising daily."],
      high: ["Avoid sweet sodas, juices, and candy.", "Drink water to flush out extra sugar.", "Consider getting a fasting HbA1c test."],
      low: ["Eat a piece of fresh fruit or a healthy snack.", "Eat regular small meals to stabilize energy."]
    }
  },
  {
    name: "HbA1c",
    aliases: ["hba1c", "glycohemoglobin", "hemoglobin a1c"],
    unit: "%",
    normalRangeText: "Below 5.7%",
    normalMin: 4.0,
    normalMax: 5.6,
    clinicalMeaning: "An average of your blood sugar levels over the past 2 to 3 months.",
    whatItIs: "A 'report card' showing your average blood sugar over the last 90 days.",
    simpleExplanations: {
      normal: "You received an A+ on your blood sugar report card! Your sugar levels have been very stable and cooperative for the past three months.",
      high: "Your blood sugar average score is above normal. It means your blood has been carrying around extra sugar 'baggage' for several weeks.",
      low: "Your average sugar score is quite low, which is rare but can happen if sugar levels are consistently dipped."
    },
    healthImpacts: {
      normal: "Confirms that you are at very low risk for pre-diabetes or metabolic strain.",
      high: "High average sugar can make body organs age faster and places permanent stress on blood vessels and cells.",
      low: "Very low levels might indicate overall body fuel reserves are low or you have frequent mild lows."
    },
    actions: {
      normal: ["Keep up the great lifestyle choices!", "Continue your active routines."],
      high: ["Work on reducing fried foods and refined carbs.", "Aim for 30 minutes of physical activity daily.", "Schedule a chat with a specialist to review control steps."],
      low: ["Review your diet with a expert to make sure you get enough continuous nutrients."]
    }
  },
  {
    name: "Total Cholesterol",
    aliases: ["cholesterolTotal", "total cholesterol", "cholesterol"],
    unit: "mg/dL",
    normalRangeText: "Under 200 mg/dL",
    normalMin: 100,
    normalMax: 199,
    clinicalMeaning: "The total amount of cholesterol (fatty substances) found in your blood.",
    whatItIs: "The total amount of candle-like soft wax fats circulating in your blood.",
    simpleExplanations: {
      normal: "Your total wax fats are nicely balanced. Your body uses this wax to build healthy cell walls without over-cluttering.",
      high: "Your fat levels are somewhat high. Imagine candle wax dripping into your blood pipes; too much can make the pathway narrower.",
      low: "Your blood fats are very low. While rare, we do need some fats to run our system normally."
    },
    healthImpacts: {
      normal: "Maintains strong and flexible cell membranes without building up rust or blockages inside pipes.",
      high: "Extra fats might slowly settle on the walls of blood vessels, forcing your heart to pump harder over time.",
      low: "Extremely low cholesterol might sometimes connect with low nutrient absorption or hormone variations."
    },
    actions: {
      normal: ["Keep enjoying a variety of veggies and healthy fats like olive oil."],
      high: ["Eat fewer fried foods, greasy cheeseburgers, and packaged baked items.", "Introduce fiber-rich foods like oats and lentils.", "Try to walk briskly every day."],
      low: ["Make sure you are eating enough calories and useful healthy fats like avocados and nuts."]
    }
  },
  {
    name: "LDL Cholesterol",
    aliases: ["ldlCholesterol", "ldl", "low-density lipoprotein", "bad cholesterol"],
    unit: "mg/dL",
    normalRangeText: "Under 100 mg/dL",
    normalMin: 0,
    normalMax: 99,
    clinicalMeaning: "Low-Density Lipoprotein, often called 'bad' cholesterol because high levels build up in blood vessels.",
    whatItIs: "Often called 'bad cholesterol' or 'sticky fat' because it leaves fatty deposits.",
    simpleExplanations: {
      normal: "Excellent! Your sticky fat level is low and clean. The delivery trucks are keeping your pipes clear.",
      high: "Your sticky fats are higher than recommended. Think of it like wet yellow clay lining your water hose, slowing down the flow.",
      low: "Your sticky cholesterol is very low, which is actually fantastic news for your blood vessel health."
    },
    healthImpacts: {
      normal: "Minimizes the chance of arterial plaque (hardening of the pipes) as you grow older.",
      high: "Over time, sticky fat buildup can form hard bumps. These bumps can make it harder for oxygen-filled blood to reach your heart.",
      low: "Provides superb long-term protection for your cardiovascular heart health."
    },
    actions: {
      normal: ["Keep up the good work focusing on colorful vegetables."],
      high: ["Swap butter or saturated grease for olive oil.", "Eat a bowl of oatmeal or soluble fiber daily.", "Exercise regularly to help clear out bad fats."],
      low: ["Continue your heart-healthy eating habits!"]
    }
  },
  {
    name: "HDL Cholesterol",
    aliases: ["hdlCholesterol", "hdl", "high-density lipoprotein", "good cholesterol"],
    unit: "mg/dL",
    normalRangeText: "Over 50 mg/dL",
    normalMin: 50,
    normalMax: 150,
    meaningLessIsBad: true,
    clinicalMeaning: "High-Density Lipoprotein, known as 'good' cholesterol because it vacuums up bad fats and sends them to the liver to be cleared.",
    whatItIs: "Commonly called 'good cholesterol' or the 'helper broom fat' that sweeps up.",
    simpleExplanations: {
      normal: "Awesome! Your helpful helper broom team is big and strong, sweeping up any garbage from your veins.",
      high: "Your good sweeping cholesterol is very high. This is like having an army of vacuums keeping your blood paths spotless!",
      low: "Your broom cholesterol is lower than we want. It means there aren't enough little cleaner helpers on duty."
    },
    healthImpacts: {
      normal: "Protects your heart by constantly recycling extra fats so they don't get stuck.",
      high: "Gives you a shield against cardiovascular problems, keeping things remarkably clean.",
      low: "When broom cholesterol is low, bad sticky fats can settle down and cause trouble more easily."
    },
    actions: {
      normal: ["Keep doing physical workouts which boost HDL naturally.", "Keep eating beneficial fats."],
      high: ["This is a healthy metric! Share a happy high-five and maintain your routines."],
      low: ["Add high-quality fats like salmon, olive oil, walnuts, and almonds to your plate.", "Walk, jog, or bicycle to naturally train your sweepers."]
    }
  },
  {
    name: "Triglycerides",
    aliases: ["triglycerides", "trigs", "triacylglycerols"],
    unit: "mg/dL",
    normalRangeText: "Under 150 mg/dL",
    normalMin: 0,
    normalMax: 149,
    clinicalMeaning: "A type of fat found in your blood that represents stored extra energy from food.",
    whatItIs: "Unused food calories that your body converted into tiny droplets of floating storage fat.",
    simpleExplanations: {
      normal: "Your floating storage fats are at a great level. You are burning off extra calories perfectly instead of turning them into stored clutter.",
      high: "Your storage fat droplets are a bit crowded. It means your body is keeping more leftover energy in your blood than it can burn.",
      low: "Your storage fats are quite low, meaning your cells are burning energy very efficiently."
    },
    healthImpacts: {
      normal: "Maintains normal pancreas and cardiovascular health.",
      high: "Very high store-fats can thick the blood and stress your metabolic glands, occasionally stressing the pancreas.",
      low: "Usually normal, but ensure you are consuming enough overall dietary calories."
    },
    actions: {
      normal: ["Continue normal healthy active living."],
      high: ["Eat fewer sugary treats and reduce refined carbs.", "Limit sweet snacks and sodas.", "Exercise regularly to burn up these floating storage fats."],
      low: ["No action needed, just ensure structured nutritional diet."]
    }
  },
  {
    name: "Creatinine",
    aliases: ["creatinine", "serum creatinine", "creat"],
    unit: "mg/dL",
    normalRangeText: "0.7 - 1.3 mg/dL",
    normalMin: 0.7,
    normalMax: 1.3,
    clinicalMeaning: "A chemical waste molecule generated from muscle metabolism that is filtered out by kidneys.",
    whatItIs: "A normal muscle cleanup waste product that your kidneys filter out and flush away.",
    simpleExplanations: {
      normal: "Your kidneys are acting like super water filters! They are clearing out standard muscle debris easily, leaving a perfect clean level.",
      high: "Your muscle debris is elevated. Think of a sink filter that's slightly clogged; the water is draining slower, so debris is piling up.",
      low: "Your waste level is low. This usually means you have slightly less muscle mass or might need more protein."
    },
    healthImpacts: {
      normal: "Indicates excellent, healthy dual kidney filtration.",
      high: "Suggests the kidneys are working harder than normal to clean your blood fluid, or you might be very dehydrated.",
      low: "No harm, but could reflect minor muscle loss or light overall weight."
    },
    actions: {
      normal: ["Drink 8 to 10 glasses of water daily to keep filters sparkling."],
      high: ["Drink plenty of fresh water to help the filters run smoothly.", "Avoid heavy high-dose synthetic protein powders or creatine supplements.", "Talk to a doctor to check your kidney health."],
      low: ["Engage in light strength-building exercises.", "Ensure adequate dietary proteins."]
    }
  },
  {
    name: "eGFR",
    aliases: ["egfr", "gfr", "glomerular filtration rate"],
    unit: "mL/min/1.73m²",
    normalRangeText: "90 or higher",
    normalMin: 90,
    normalMax: 200,
    meaningLessIsBad: true,
    clinicalMeaning: "Estimated Glomerular Filtration Rate, which checks how well your kidney filters are cleaning the blood.",
    whatItIs: "Your kidney filter's speed score. A higher score means fast, healthy cleaning!",
    simpleExplanations: {
      normal: "Fantastic! Your kidney filtering speed is fast and efficient. Your water filters are operating at top speed!",
      high: "Your filtering speed is speedy and healthy.",
      low: "Your filter speed score is lower than recommended. It is like your home's water filter is working in slow motion."
    },
    healthImpacts: {
      normal: "Confirms kidneys are doing an amazing job cleaning toxins out of your blood.",
      high: "Excellent kidney performance.",
      low: "Slow cleaning speed can lead to waste building up in the body, which can make you feel tired or swell up."
    },
    actions: {
      normal: ["Stay hydrated with daily clean water.", "Avoid regular usage of pain medicines like ibuprofen which stress filters."],
      high: ["Maintain hydration."],
      low: ["Drink enough water, but avoid extra salt in your meals.", "Avoid heavy OTC pain medications.", "Consult a doctor for kidney support."]
    }
  },
  {
    name: "Urea",
    aliases: ["urea", "bun", "blood urea nitrogen"],
    unit: "mg/dL",
    normalRangeText: "7 - 20 mg/dL",
    normalMin: 7,
    normalMax: 20,
    clinicalMeaning: "A waste product from protein digestion that is made in the liver and filtered out by kidneys.",
    whatItIs: "A dusty leftover waste product created when your body chops up and digests proteins.",
    simpleExplanations: {
      normal: "Your protein waste level is normal. Your body is digesting food and filtering out leftovers perfectly.",
      high: "Your protein waste is high. This often happens if you are dry (dehydrated) or ate a massive steak dinner recently.",
      low: "Your protein digestion waste is minor, which is fine and common on low-protein or vegan eating plans."
    },
    healthImpacts: {
      normal: "Indicates normal chemical breakdown and normal hydration levels.",
      high: "Can mean the body is slightly dehydrated, making the waste concentration look higher.",
      low: "No health concern; usually indicates low intake of meat/fish or high fluid states."
    },
    actions: {
      normal: ["Keep eating balanced proteins."],
      high: ["Grab a glass of water right now to hydrate!", "Keep protein portions moderate.", "Check in with a doctor if kidneys need reviewing."],
      low: ["Make sure you consume enough essential amino acids from beans, nuts, eggs, or clean meats."]
    }
  },
  {
    name: "SGPT (ALT)",
    aliases: ["alt", "sgpt", "alanine aminotransferase"],
    unit: "U/L",
    normalRangeText: "7 - 56 U/L",
    normalMin: 7,
    normalMax: 56,
    clinicalMeaning: "An enzyme found mostly in liver cells. Higher numbers mean the liver cells are under stress.",
    whatItIs: "A tiny chemical tool inside your liver cells. If liver cells are hurt, it leaks into the blood.",
    simpleExplanations: {
      normal: "Your liver cells are happy, healthy, and sealed tight! No enzymes are leaking out into your blood.",
      high: "Your liver enzyme is high. This is like a tiny alarm going off because some liver cells are stressed or working too hard.",
      low: "Your liver enzyme level is low, which is totally normal and safe."
    },
    healthImpacts: {
      normal: "Indicates your liver (your body's detox factory) is in great shape.",
      high: "Points to liver irritation, often from fatty foods, stress, medications, or high alcohol load.",
      low: "Indicates no cell leaking; liver is quiet."
    },
    actions: {
      normal: ["Keep up a clean diet.", "Avoid unneeded chemical pills."],
      high: ["Eat fewer oily, fatty, and processed foods.", "Avoid sugary drinks and alcohol completely.", "Exercise to reduce liver fat accumulation."],
      low: ["Maintain your current healthy routines!"]
    }
  },
  {
    name: "SGOT (AST)",
    aliases: ["ast", "sgot", "aspartate aminotransferase"],
    unit: "U/L",
    normalRangeText: "8 - 48 U/L",
    normalMin: 8,
    normalMax: 48,
    clinicalMeaning: "A liver and muscle enzyme. Raised levels point to cellular irritation or muscle repair issues.",
    whatItIs: "Another tool inside your liver and muscles. It exits into blood when these tissues are tired.",
    simpleExplanations: {
      normal: "Your cellular tools are resting safely inside. Great score!",
      high: "The level is higher than wanted. Your liver or heavy muscle cells are showing some signs of strain or mild damage.",
      low: "Normal low levels; nothing to worry about."
    },
    healthImpacts: {
      normal: "Confirms quiet liver and muscle homeostasis.",
      high: "Could mean the liver is struggling, or you did an extremely intense weight-lifting workout a day ago.",
      low: "Fully healthy indicator."
    },
    actions: {
      normal: ["Continue standard activity and balanced diet."],
      high: ["Limit rich, fatty foods.", "Make sure to rest your muscles after heavy sports.", "Reduce unnecessary medications and speak to a physician."],
      low: ["No action required."]
    }
  },
  {
    name: "Bilirubin",
    aliases: ["bilirubin", "total bilirubin", "bili"],
    unit: "mg/dL",
    normalRangeText: "0.2 - 1.2 mg/dL",
    normalMin: 0.2,
    normalMax: 1.2,
    clinicalMeaning: "A yellow pigment formed by the regular breakdown of old red blood cells, cleared by the liver.",
    whatItIs: "A yellow pigment made when old blood cells are recycled. Your liver is supposed to clean it up.",
    simpleExplanations: {
      normal: "Your liver is recycling blood cells like a master recycler, keeping everything clean and clear.",
      high: "Your yellow pigment level is slightly high. Think of a recycling center that is backlogged; it's taking a bit longer to process old cells.",
      low: "Low levels are completely normal and show no issues."
    },
    healthImpacts: {
      normal: "Your skin, eyes, and blood remain healthy and clear.",
      high: "If it gets very high, it can make eyes look yellow (jaundice) and suggests the liver drainage is sluggish.",
      low: "No clinical significance."
    },
    actions: {
      normal: ["Eat plenty of dark green leafy vegetables like broccoli and spinach."],
      high: ["Drink water and stay hydrated.", "Limit fatty items.", "See a doctor if you notice yellowing of eyes or dark urine."],
      low: ["No treatment needed."]
    }
  },
  {
    name: "Systolic Blood Pressure",
    aliases: ["systolicBP", "systolic", "systolic blood pressure", "bp systolic"],
    unit: "mmHg",
    normalRangeText: "90 - 119 mmHg",
    normalMin: 90,
    normalMax: 119,
    clinicalMeaning: "Blood pressure in the arteries when the heart beats and squeezes blood out.",
    whatItIs: "The squeeze pressure when your heart muscle beats and pushes blood forward.",
    simpleExplanations: {
      normal: "Perfect pressure! The heart is squeezing blood out with gentle, efficient force.",
      high: "Your squeeze pressure is elevated. It is like turning up the hose nozzle too tight; the water is slamming hard against the walls.",
      low: "Your squeeze pressure is low. It is like a soft water trickle, meaning blood might move a little slowly."
    },
    healthImpacts: {
      normal: "Protects your blood vessels from getting stretched too thin or worn out.",
      high: "Can wear out blood vessel walls over time, making them stiff and increasing heart work.",
      low: "Can make you feel dizzy or lightheaded, especially when you stand up quickly."
    },
    actions: {
      normal: ["Stay active with physical play and regular movement.", "Keep dietary sodium in a healthy zone."],
      high: ["Eat less salty foods and chips.", "Find ways to calm down, like breathing exercises.", "Do regular cardio walks to soften and relax blood pipes."],
      low: ["Drink enough fluids and add a tiny pinch of salt to meals.", "Stand up slowly from bed or chairs."]
    }
  },
  {
    name: "Diastolic Blood Pressure",
    aliases: ["diastolicBP", "diastolic", "diastolic blood pressure", "bp diastolic"],
    unit: "mmHg",
    normalRangeText: "60 - 79 mmHg",
    normalMin: 60,
    normalMax: 79,
    clinicalMeaning: "Blood pressure in the arteries in between heart beats, when the heart is resting.",
    whatItIs: "The resting pressure in your blood pipes when your heart takes a quick pause between beats.",
    simpleExplanations: {
      normal: "Excellent rest pressure! Your blood pipes get a nice, relaxed break between heartbeats.",
      high: "The resting pressure is elevated. Even when the heart pauses, your blood pipes remain tense and squeezed.",
      low: "Your resting pressure is low. The pipes are extremely relaxed, which is usually fine but can lower flow speed."
    },
    healthImpacts: {
      normal: "Ensures the heart and blood tubes have time to breathe and recuperate.",
      high: "Keeps continuous strain on the cardiovascular system, eventually wearing down elastic tissue.",
      low: "Can sometimes contribute to feeling easily tired or cold."
    },
    actions: {
      normal: ["Maintain physical exercise and adequate rest."],
      high: ["Practice slow breathing.", "Reduce caffeine (sodas/coffee).", "Aim for 7 to 8 hours of deep sleep to lower stress."],
      low: ["Avoid sudden changes in posture.", "Keep hydrated with electrolyte-balanced water."]
    }
  },
  {
    name: "Hemoglobin",
    aliases: ["hemoglobin", "hb", "hgb"],
    unit: "g/dL",
    normalRangeText: "12.0 - 17.5 g/dL",
    normalMin: 12.0,
    normalMax: 17.5,
    meaningLessIsBad: true,
    clinicalMeaning: "The protein in red blood cells that carries oxygen from your lungs to the rest of your body.",
    whatItIs: "Small trucks inside your red blood cells that carry precious oxygen to your brain and muscles.",
    simpleExplanations: {
      normal: "Splendid! You have plenty of red oxygen trucks. Your brain and muscles are getting 100% of the air they need.",
      high: "Your oxygen truck count is high. This can happen if you live in high mountain air or don't drink enough water (making cells concentrated).",
      low: "Your oxygen truck line is thin (anemia). Your body is acting like a delivery service with half its fleet missing, making you feel tired."
    },
    healthImpacts: {
      normal: "Maintains high energy, peak brain focus, and warm muscles.",
      high: "Can make blood slightly thick, which causes sluggish flow if not well hydrated.",
      low: "Leaves you feeling cold, pale, dizzy, or out of breath because cells are waiting for more oxygen."
    },
    actions: {
      normal: ["Keep eating leafy greens, beans, and healthy foods."],
      high: ["Drink more water to restore fluid balance.", "Avoid tobacco smoke completely."],
      low: ["Eat iron-rich foods like spinach, meat, beans, lentils, and fortified grains.", "Pair iron meals with Vitamin C (like oranges) to help absorption."]
    }
  },
  {
    name: "WBC (White Blood Cells)",
    aliases: ["wbc", "white blood cells", "white count"],
    unit: "/mcL",
    normalRangeText: "4,500 - 11,000 /mcL",
    normalMin: 4500,
    normalMax: 11000,
    clinicalMeaning: "White Blood Cells, which are the immune system's cellular soldiers fighting off infections.",
    whatItIs: "Your body's immune soldier army. They fight off germs, viruses, and bugs.",
    simpleExplanations: {
      normal: "Your army is in perfect standby! Your soldiers are patrolling calmly, ready to protect you if germs enter.",
      high: "Your soldier count is high. This means your army has deployed extra troops, usually because they are actively fighting a cold/infection or responding to stress.",
      low: "Your soldier count is a bit low. This means your defensive shields might be slightly weak right now, making it easier to catch a bug."
    },
    healthImpacts: {
      normal: "Maintains optimal defensive resilience without unnecessary internal allergies or alarms.",
      high: "Confirms that your body is working hard to heal an active infection, or dealing with heavy stress/inflammation.",
      low: "Indicates a slightly lower resistance to common cold viruses and infections."
    },
    actions: {
      normal: ["Eat colorful fruits that contain vitamins to support your immune system."],
      high: ["Get plenty of bed rest to help your army win the fight.", "Wash your hands often.", "Drink hot fluids and check in with a doctor if you have a fever."],
      low: ["Prioritize good sleep and rest.", "Wash hands thoroughly and avoid hanging out with sneezing friends."]
    }
  },
  {
    name: "RBC (Red Blood Cells)",
    aliases: ["rbc", "red blood cells", "red count"],
    unit: "million/mcL",
    normalRangeText: "4.3 - 5.9 M/mcL",
    normalMin: 4.3,
    normalMax: 5.9,
    meaningLessIsBad: true,
    clinicalMeaning: "Red Blood Cells, which carry oxygen and carbon dioxide throughout the cardiovascular system.",
    whatItIs: "The bulk red cells that hold the oxygen protein. They are the actual delivery boxes.",
    simpleExplanations: {
      normal: "Your red cell transport system is running smoothly. The boxes are flowing through the tubes with ease.",
      high: "The red cell boxes are high and crowded. Your blood has a surplus, which can make things tight inside pipes.",
      low: "Your delivery count is low, so there aren't enough boxes around to move oxygen efficiently."
    },
    healthImpacts: {
      normal: "Ensures rich tissue nutrition and standard energetic metabolism.",
      high: "Sometimes caused by sleeping breathing issues, smoking, or minor dehydration.",
      low: "Can make physical play feel tiring very quickly, leaving you with less stamina."
    },
    actions: {
      normal: ["Keep up a rich vitamins lifestyle."],
      high: ["Make sure you are drinking enough fluids.", "Get fresh air and exercise."],
      low: ["Add iron, folic acid, and vitamin B12-rich foods to your diet.", "Discuss blood levels with your pediatrician/physician."]
    }
  },
  {
    name: "Platelets",
    aliases: ["platelets", "plt", "platelet count"],
    unit: "/mcL",
    normalRangeText: "150,000 - 450,000 /mcL",
    normalMin: 150000,
    normalMax: 450000,
    clinicalMeaning: "Tiny cell fragments that clump together to stop bleeding when you get a cut.",
    whatItIs: "The little Bandaid makers of your blood! They sticky-glue together to plug holes when you get a scratch.",
    simpleExplanations: {
      normal: "Your Bandaid makers are at a perfect level! If you get a scratch, they'll patch it up normally and safely.",
      high: "Your Bandaid helpers are high. This means you have lots of glue molecules, which can make blood a tiny bit thick.",
      low: "Your Bandaid helpers are lower than wanted. If you get a cut, it might take a bit longer for the bleeding to stop, or you might bruise like a peach."
    },
    healthImpacts: {
      normal: "Ensures safe, quick blood drying when injured, with no risk of blood clots inside vessels.",
      high: "Sometimes happens after infection or irritation, making the body over-produce patchers.",
      low: "Increases risk of easy skin bruising or minor gums bleeding."
    },
    actions: {
      normal: ["Protect skin with standard clothing during adventures."],
      high: ["Ensure proper hydration and check with a doctor to see why the body is excited."],
      low: ["Be careful during rough playtime to avoid heavy bumps.", "See a doctor if you get unexplained bruising or nosebleeds."]
    }
  }
];

export function getParameterExplanation(name: string, value: number): {
  matchedParam: KnowledgeParameter;
  status: "Normal" | "High" | "Low";
  explanation: string;
  impact: string;
  actions: string[];
} | null {
  const normalized = name.toLowerCase().trim();
  const matched = medicalKnowledgeBase.find(p => 
    p.name.toLowerCase() === normalized || 
    p.aliases.some(a => a.toLowerCase() === normalized || normalized.includes(a.toLowerCase()))
  );
  if (!matched) return null;

  let status: "Normal" | "High" | "Low" = "Normal";
  if (value > matched.normalMax) {
    status = matched.meaningLessIsBad ? "Normal" : "High"; // wait, hdl high is normal/great, check if custom logic needed
    if (matched.name === "HDL Cholesterol" || matched.name === "eGFR") {
      status = "Normal"; // High is excellent!
    } else {
      status = "High";
    }
  } else if (value < matched.normalMin) {
    status = matched.meaningLessIsBad ? "Low" : "Low"; 
  }

  return {
    matchedParam: matched,
    status,
    explanation: matched.simpleExplanations[status.toLowerCase() as "normal" | "high" | "low"],
    impact: matched.healthImpacts[status.toLowerCase() as "normal" | "high" | "low"],
    actions: matched.actions[status.toLowerCase() as "normal" | "high" | "low"]
  };
}
 