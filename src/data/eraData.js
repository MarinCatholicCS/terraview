export const ERA_DATA = {
  modern: {
    label: "Contemporary World",
    groups: {
      "nato": { color: "#4a6fa5", opacity: 0.55, countries: ["United States of America","Canada","United Kingdom","France","Germany","Italy","Spain","Australia","Japan","South Korea","Poland","Netherlands","Belgium","Denmark","Norway","Sweden","Finland","Portugal","Greece","Turkey","Czech Republic","Hungary","Slovakia","Romania","Bulgaria","Croatia","Albania","Montenegro","North Macedonia","Estonia","Latvia","Lithuania","Slovenia","Luxembourg","Iceland","New Zealand"] },
      "brics": { color: "#b5451b", opacity: 0.55, countries: ["China","Russia","India","Brazil","South Africa","Egypt","Ethiopia","Iran","United Arab Emirates","Saudi Arabia","Argentina","Indonesia"] },
      "nonaligned": { color: "#5a8a5a", opacity: 0.45, countries: ["Mexico","Nigeria","Pakistan","Bangladesh","Vietnam","Philippines","Malaysia","Thailand","Colombia","Kenya","Tanzania","Ghana","Morocco","Algeria","Tunisia","Libya","Uganda","Cameroon","Angola","Mozambique","Zimbabwe","Zambia","Senegal","Ivory Coast","Peru","Chile","Bolivia","Ecuador","Venezuela","Cuba","Myanmar","Sri Lanka","Nepal","Jordan","Lebanon"] },
      "neutral": { color: "#8a6a4a", opacity: 0.4, countries: ["Switzerland","Austria","Ireland","Sweden","Serbia","Belarus","Kazakhstan","Uzbekistan","Turkmenistan","Azerbaijan","Georgia","Armenia","Mongolia","Cambodia","Laos","Bhutan","Tajikistan","Kyrgyzstan","Afghanistan","Paraguay","Uruguay","Panama","Costa Rica","Guatemala","Honduras","El Salvador","Nicaragua","Haiti","Dominican Republic","Jamaica","Papua New Guinea","Fiji"] },
    }
  },
  coldwar: {
    label: "Cold War Era",
    groups: {
      "nato": { color: "#4a6fa5", opacity: 0.6, countries: ["United States of America","Canada","United Kingdom","France","West Germany","Italy","Spain","Greece","Turkey","Belgium","Netherlands","Denmark","Norway","Portugal","Luxembourg","Iceland","Australia","Japan","South Korea","Philippines","Thailand","Pakistan"] },
      "warsaw": { color: "#b5451b", opacity: 0.6, countries: ["Russia","Poland","East Germany","Czechoslovakia","Hungary","Romania","Bulgaria","Yugoslavia","Albania","Mongolia","Cuba","Vietnam","North Korea","Angola","Mozambique","Ethiopia","Afghanistan","Nicaragua","Laos","Cambodia","Yemen","Libya","Syria"] },
      "nonaligned": { color: "#5a8a5a", opacity: 0.45, countries: ["India","Indonesia","Egypt","Ghana","Tanzania","Kenya","Nigeria","Algeria","Morocco","Tunisia","Sudan","Mali","Guinea","Zambia","Zimbabwe","Senegal","Ivory Coast","Sri Lanka","Bangladesh","Malaysia","Singapore","Myanmar","Iraq","Iran","Saudi Arabia","Jordan","Lebanon","Libya"] },
      "latin america": { color: "#8a6a4a", opacity: 0.45, countries: ["Brazil","Argentina","Mexico","Chile","Colombia","Peru","Venezuela","Bolivia","Ecuador","Paraguay","Uruguay","Guatemala","Honduras","El Salvador","Nicaragua","Costa Rica","Panama","Cuba","Haiti","Dominican Republic","Jamaica","Trinidad and Tobago"] },
    }
  },
  wwii: {
    label: "World War II",
    groups: {
      "allies": { color: "#4a6fa5", opacity: 0.65, countries: ["United States of America","United Kingdom","France","Russia","Canada","Australia","China","India","Poland","Netherlands","Belgium","Greece","Yugoslavia","Norway","South Africa","New Zealand","Brazil","Mexico","Ethiopia","Philippines","Mexico"] },
      "axis": { color: "#b5451b", opacity: 0.65, countries: ["Germany","Italy","Japan","Hungary","Romania","Bulgaria","Finland","Thailand","Croatia","Slovakia","Iraq"] },
      "occupied": { color: "#8a3a1a", opacity: 0.7, countries: ["Austria","Czech Republic","Denmark","Belgium","Luxembourg","Netherlands","France","Yugoslavia","Greece","Norway","Poland","Albania","Libya","Ethiopia","Singapore","Malaysia","Indonesia","Philippines","Myanmar"] },
      "neutral": { color: "#5a8a5a", opacity: 0.45, countries: ["Switzerland","Sweden","Spain","Portugal","Turkey","Argentina","Chile","Colombia","Ireland","Afghanistan","Iran","Saudi Arabia","Egypt","Iceland"] },
    }
  },
  interwar: {
    label: "Interwar Period",
    groups: {
      "democratic": { color: "#4a6fa5", opacity: 0.6, countries: ["United States of America","United Kingdom","France","Canada","Australia","Belgium","Netherlands","Denmark","Sweden","Norway","Switzerland","Czechoslovakia","Ireland","New Zealand","South Africa","Argentina","Brazil","Chile","Uruguay","Colombia","Costa Rica","Finland"] },
      "fascist": { color: "#b5451b", opacity: 0.6, countries: ["Italy","Germany","Spain","Portugal","Hungary","Romania","Bulgaria","Yugoslavia","Japan","Lithuania","Latvia","Estonia","Greece"] },
      "communist": { color: "#c9973a", opacity: 0.6, countries: ["Russia","Mongolia","China"] },
      "colonial": { color: "#8a6a4a", opacity: 0.5, countries: ["India","Algeria","Morocco","Tunisia","Libya","Egypt","Sudan","Kenya","Tanzania","Nigeria","Ghana","Cameroon","Angola","Mozambique","Madagascar","Vietnam","Indonesia","Philippines","Malaysia","Singapore","Myanmar","Cambodia","Laos","Iraq","Syria","Lebanon","Palestine","Jordan","Saudi Arabia","Iran","Afghanistan","Kuwait","Oman","UAE","Bahrain","Qatar","Yemen","Senegal","Mali","Niger","Chad","Guinea","Ivory Coast","Burkina Faso","Central African Republic","Republic of the Congo","Democratic Republic of the Congo","Gabon","Equatorial Guinea","Somalia","Eritrea","Zimbabwe","Zambia","Malawi","Botswana","Namibia"] },
    }
  },
  wwi: {
    label: "World War I",
    groups: {
      "entente": { color: "#4a6fa5", opacity: 0.65, countries: ["France","United Kingdom","Russia","Italy","United States of America","Romania","Serbia","Greece","Belgium","Portugal","Japan","Montenegro","Brazil","Australia","Canada","South Africa","New Zealand","India","Iraq","Egypt","Armenia","Albania"] },
      "central": { color: "#b5451b", opacity: 0.65, countries: ["Germany","Austria","Turkey","Bulgaria","Hungary"] },
      "colonial": { color: "#8a6a4a", opacity: 0.5, countries: ["India","Egypt","Algeria","Morocco","Nigeria","South Africa","Kenya","Cameroon","Tanzania","Mozambique","Angola","Vietnam","Indonesia","Libya","Sudan","Ghana","Senegal","Ivory Coast","Madagascar","Somalia"] },
      "neutral": { color: "#5a8a5a", opacity: 0.45, countries: ["Switzerland","Spain","Netherlands","Sweden","Norway","Denmark","Argentina","Brazil","Chile","Colombia","Mexico","Iran","Afghanistan","China","Persia","Saudi Arabia","Yemen"] },
    }
  },
  nineteenthCentury: {
    label: "19th Century",
    groups: {
      "british empire": { color: "#4a6fa5", opacity: 0.6, countries: ["United Kingdom","India","Australia","Canada","South Africa","New Zealand","Egypt","Nigeria","Kenya","Ghana","Malaysia","Singapore","Myanmar","Pakistan","Bangladesh","Sri Lanka","Botswana","Lesotho","Eswatini","Zimbabwe","Zambia","Uganda","Tanzania","Malawi","Cyprus","Malta","Jamaica","Trinidad and Tobago","Guyana","Belize","Iraq","Kuwait","Oman","UAE","Qatar","Bahrain","Jordan","Palestine","Ireland"] },
      "french empire": { color: "#b5451b", opacity: 0.55, countries: ["France","Algeria","Tunisia","Vietnam","Cambodia","Laos","Senegal","Mali","Niger","Chad","Cameroon","Ivory Coast","Guinea","Burkina Faso","Central African Republic","Republic of the Congo","Gabon","Djibouti","Madagascar","Morocco","Lebanon","Syria"] },
      "european powers": { color: "#5a8a5a", opacity: 0.55, countries: ["Germany","Austria","Russia","Italy","Spain","Portugal","Belgium","Netherlands","Denmark","Sweden","Norway","Switzerland","Romania","Bulgaria","Greece","Serbia","Montenegro","Hungary","Angola","Mozambique","Namibia","Togo","Democratic Republic of the Congo","Rwanda","Burundi","Libya","Somalia","Eritrea"] },
      "ottoman empire": { color: "#8a6a4a", opacity: 0.55, countries: ["Turkey","Iraq","Syria","Lebanon","Israel","Jordan","Saudi Arabia","Yemen","Libya","Tunisia","Algeria","Greece","Bulgaria","Romania","Serbia","Albania","North Macedonia","Bosnia and Herzegovina","Montenegro","Kosovo","Armenia","Georgia","Azerbaijan","Kuwait"] },
      "americas": { color: "#c9973a", opacity: 0.45, countries: ["United States of America","Mexico","Brazil","Argentina","Chile","Colombia","Venezuela","Peru","Bolivia","Ecuador","Paraguay","Uruguay","Cuba","Guatemala","Honduras","El Salvador","Nicaragua","Costa Rica","Panama","Dominican Republic","Haiti","Japan","China","Iran","Afghanistan","Ethiopia","Liberia"] },
    }
  },
  napoleon: {
    label: "Napoleonic Era",
    groups: {
      "french empire": { color: "#b5451b", opacity: 0.65, countries: ["France","Spain","Italy","Netherlands","Belgium","Luxembourg","Switzerland","Germany","Poland","Croatia","Denmark","Norway","Austria","Hungary","Slovenia"] },
      "coalition": { color: "#4a6fa5", opacity: 0.6, countries: ["United Kingdom","Russia","Sweden","Portugal","Finland","Sweden","Sicily"] },
      "ottoman": { color: "#8a6a4a", opacity: 0.55, countries: ["Turkey","Greece","Serbia","Romania","Bulgaria","Iraq","Syria","Lebanon","Israel","Jordan","Egypt","Libya","Tunisia","Algeria","Saudi Arabia","Yemen","Algeria","Morocco","Albania","North Macedonia","Bosnia and Herzegovina","Montenegro","Kosovo","Armenia","Georgia","Azerbaijan","Kuwait"] },
      "americas": { color: "#5a8a5a", opacity: 0.45, countries: ["United States of America","Brazil","Haiti","Mexico","Venezuela","Colombia","Argentina","Chile","Peru","Bolivia","Ecuador","Canada"] },
    }
  },
  earlyModern: {
    label: "Early Modern Period",
    groups: {
      "western europe": { color: "#4a6fa5", opacity: 0.55, countries: ["France","Spain","Portugal","United Kingdom","Netherlands","Austria","Sweden","Denmark","Switzerland","Belgium","Luxembourg","Ireland","Poland","Hungary","Czech Republic","Slovakia","Croatia","Slovenia"] },
      "russian empire": { color: "#5a8a5a", opacity: 0.5, countries: ["Russia","Ukraine","Belarus","Finland","Estonia","Latvia","Lithuania","Kazakhstan","Uzbekistan","Turkmenistan","Tajikistan","Kyrgyzstan","Georgia","Armenia","Azerbaijan","Mongolia"] },
      "ottoman empire": { color: "#b5451b", opacity: 0.55, countries: ["Turkey","Greece","Albania","North Macedonia","Bosnia and Herzegovina","Serbia","Bulgaria","Romania","Iraq","Syria","Lebanon","Israel","Jordan","Egypt","Libya","Tunisia","Algeria","Saudi Arabia","Yemen","Kosovo","Montenegro","Moldova","Hungary","Georgia","Armenia","Azerbaijan","Kuwait"] },
      "asian empires": { color: "#c9973a", opacity: 0.5, countries: ["China","India","Japan","Iran","Afghanistan","Myanmar","Thailand","Vietnam","Laos","Cambodia","Indonesia","Malaysia","Philippines","Korea","Pakistan","Bangladesh","Nepal","Bhutan","Sri Lanka","Mongolia","Uzbekistan","Tajikistan","Kyrgyzstan","Turkmenistan","Kazakhstan"] },
      "americas": { color: "#8a6a4a", opacity: 0.45, countries: ["Mexico","Brazil","Colombia","Venezuela","Peru","Argentina","Chile","Bolivia","Ecuador","Paraguay","Uruguay","Cuba","Guatemala","Honduras","El Salvador","Nicaragua","Costa Rica","Panama","Dominican Republic","Haiti","United States of America","Canada"] },
    }
  },
  reformation: {
    label: "Reformation Era",
    groups: {
      "holy roman empire": { color: "#4a6fa5", opacity: 0.55, countries: ["Germany","Austria","Czech Republic","Switzerland","Netherlands","Belgium","Luxembourg","Slovenia","Croatia","Hungary","Slovakia","Poland","Denmark","Sweden","Norway","Finland"] },
      "iberian empires": { color: "#c9973a", opacity: 0.6, countries: ["Spain","Portugal","Mexico","Brazil","Colombia","Venezuela","Peru","Argentina","Chile","Bolivia","Ecuador","Paraguay","Uruguay","Cuba","Philippines","Indonesia","Angola","Mozambique","Cape Verde","São Tomé and Príncipe","Equatorial Guinea","Macau","Goa"] },
      "ottoman empire": { color: "#b5451b", opacity: 0.6, countries: ["Turkey","Greece","Bulgaria","Serbia","Romania","Hungary","Albania","North Macedonia","Bosnia and Herzegovina","Iraq","Syria","Lebanon","Israel","Jordan","Egypt","Libya","Tunisia","Algeria","Saudi Arabia","Yemen","Ukraine","Moldova","Georgia","Armenia","Azerbaijan","Kuwait","Kosovo","Montenegro"] },
      "france and england": { color: "#5a8a5a", opacity: 0.55, countries: ["France","United Kingdom","Ireland","Scotland"] },
      "eastern europe": { color: "#8a6a4a", opacity: 0.5, countries: ["Russia","Poland","Lithuania","Latvia","Estonia","Ukraine","Belarus","Finland","Sweden","Denmark","Norway","Mongolia","Iran","Afghanistan","Uzbekistan","Kazakhstan","Georgia","Armenia","Azerbaijan","Tajikistan","Kyrgyzstan","Turkmenistan"] },
      "asian empires": { color: "#7a5a3a", opacity: 0.45, countries: ["China","India","Japan","Vietnam","Thailand","Myanmar","Cambodia","Laos","Korea","Malaysia","Indonesia","Philippines","Pakistan","Bangladesh","Nepal","Sri Lanka","Bhutan"] },
    }
  },
  highMedieval: {
    label: "High Medieval",
    groups: {
      "holy roman empire": { color: "#4a6fa5", opacity: 0.55, countries: ["Germany","Austria","Czech Republic","Switzerland","Netherlands","Belgium","Luxembourg","Poland","Hungary","Croatia","Slovenia","Denmark","Sweden","Norway","Finland","Italy"] },
      "crusader states": { color: "#c9973a", opacity: 0.7, countries: ["Israel","Lebanon","Cyprus","Greece","Bulgaria","Romania","Serbia","Albania","North Macedonia","Bosnia and Herzegovina","Montenegro","Kosovo","Turkey"] },
      "mongol empire": { color: "#b5451b", opacity: 0.6, countries: ["Mongolia","China","Russia","Kazakhstan","Uzbekistan","Turkmenistan","Kyrgyzstan","Tajikistan","Afghanistan","Iran","Iraq","Turkey","Ukraine","Poland","Hungary","Romania","Azerbaijan","Georgia","Armenia","Pakistan","India"] },
      "islamic world": { color: "#8a3a1a", opacity: 0.55, countries: ["Morocco","Algeria","Tunisia","Libya","Egypt","Sudan","Saudi Arabia","Yemen","Oman","UAE","Kuwait","Bahrain","Qatar","Iraq","Iran","Pakistan","Malaysia","Indonesia","Senegal","Mali","Niger","Nigeria","Chad","Guinea","Ivory Coast","Burkina Faso","Gambia","Sierra Leone","Somalia","Eritrea","Djibouti","Ethiopia"] },
      "western kingdoms": { color: "#5a8a5a", opacity: 0.5, countries: ["France","United Kingdom","Ireland","Spain","Portugal","Norway","Sweden","Finland","Latvia","Lithuania","Estonia","Iceland","Scotland","Denmark"] },
    }
  },
  earlyMedieval: {
    label: "Early Medieval",
    groups: {
      "frankish carolingian": { color: "#4a6fa5", opacity: 0.55, countries: ["France","Germany","Belgium","Netherlands","Luxembourg","Austria","Switzerland","Italy","Spain","Portugal","Czech Republic","Hungary","Croatia","Slovenia","Poland","Denmark","Norway","Sweden"] },
      "byzantine empire": { color: "#c9973a", opacity: 0.6, countries: ["Turkey","Greece","Bulgaria","Serbia","Albania","North Macedonia","Bosnia and Herzegovina","Romania","Israel","Lebanon","Syria","Egypt","Libya","Tunisia","Italy","Croatia","Slovenia","Cyprus","Armenia","Georgia","Azerbaijan"] },
      "arab caliphate": { color: "#b5451b", opacity: 0.6, countries: ["Saudi Arabia","Yemen","Oman","UAE","Kuwait","Qatar","Bahrain","Iraq","Iran","Syria","Lebanon","Israel","Jordan","Egypt","Libya","Tunisia","Algeria","Morocco","Spain","Portugal","Pakistan","Afghanistan","Uzbekistan","Tajikistan","Turkmenistan","Kazakhstan","Kyrgyzstan","Sudan","Eritrea","Somalia","Djibouti"] },
      "norse kingdoms": { color: "#5a8a5a", opacity: 0.55, countries: ["Sweden","Norway","Denmark","Iceland","Finland","United Kingdom","Ireland","Russia","Ukraine","Latvia","Lithuania","Estonia","Belarus"] },
      "eastern empires": { color: "#8a6a4a", opacity: 0.5, countries: ["China","Japan","Korea","India","Mongolia","Vietnam","Thailand","Myanmar","Cambodia","Laos","Indonesia","Malaysia","Philippines","Kazakhstan","Kyrgyzstan","Georgia","Armenia","Azerbaijan","Tajikistan","Turkmenistan","Uzbekistan","Nepal","Bhutan","Sri Lanka","Bangladesh","Pakistan"] },
    }
  },
  ancient: {
    label: "Ancient World",
    groups: {
      "roman empire": { color: "#b5451b", opacity: 0.65, countries: ["Italy","France","Spain","Portugal","United Kingdom","Belgium","Netherlands","Luxembourg","Switzerland","Austria","Germany","Romania","Bulgaria","Greece","Turkey","Egypt","Libya","Tunisia","Algeria","Morocco","Syria","Lebanon","Israel","Jordan","Iraq","Hungary","Croatia","Slovenia","Serbia","North Macedonia","Albania","Bosnia and Herzegovina","Montenegro","Kosovo","Cyprus","Malta","Armenia","Georgia","Azerbaijan","Austria","Slovakia"] },
      "sassanid persian": { color: "#c9973a", opacity: 0.6, countries: ["Iran","Iraq","Afghanistan","Pakistan","Uzbekistan","Turkmenistan","Tajikistan","Kyrgyzstan","Kazakhstan","Armenia","Georgia","Azerbaijan","Turkey","Egypt","Syria","Lebanon","Israel","Jordan","Bahrain","Kuwait","Oman","UAE","Qatar","Yemen","Saudi Arabia"] },
      "han china": { color: "#4a6fa5", opacity: 0.55, countries: ["China","Mongolia","Vietnam","Korea","Taiwan","Kazakhstan","Kyrgyzstan","Tajikistan","Uzbekistan","Turkmenistan"] },
      "gupta india": { color: "#5a8a5a", opacity: 0.55, countries: ["India","Pakistan","Bangladesh","Nepal","Bhutan","Sri Lanka","Afghanistan","Myanmar"] },
      "independent": { color: "#8a6a4a", opacity: 0.4, countries: ["Sweden","Norway","Denmark","Finland","Iceland","Ireland","Scotland","Russia","Ukraine","Poland","Czech Republic","Slovakia","Lithuania","Latvia","Estonia","Belarus","Moldova","Sudan","Ethiopia","Kenya","Tanzania","Nigeria","Ghana","Senegal","Mali","Niger","Chad","Guinea","Ivory Coast","Burkina Faso","Central African Republic","Republic of the Congo","Democratic Republic of the Congo","Gabon","Equatorial Guinea","Cameroon","Eritrea","Djibouti","Somalia","Uganda","Rwanda","Burundi","Mozambique","Zambia","Zimbabwe","Malawi","Botswana","Namibia","South Africa","Lesotho","Eswatini","Madagascar","Comoros","Mauritius","Seychelles","Japan","Thailand","Cambodia","Laos","Indonesia","Malaysia","Philippines","Singapore","Myanmar","New Zealand","Australia","Papua New Guinea","Fiji","United States of America","Canada","Mexico","Brazil","Colombia","Venezuela","Guyana","Suriname","Argentina","Chile","Peru","Bolivia","Ecuador","Paraguay","Uruguay","Cuba","Jamaica","Haiti","Dominican Republic","Trinidad and Tobago","Barbados","Belize","Guatemala","Honduras","El Salvador","Nicaragua","Costa Rica","Panama"] },
    }
  },
};

export function getEraKey(year) {
  if (year >= 1991) return 'modern';
  if (year >= 1947) return 'coldwar';
  if (year >= 1939) return 'wwii';
  if (year >= 1919) return 'interwar';
  if (year >= 1914) return 'wwi';
  if (year >= 1815) return 'nineteenthCentury';
  if (year >= 1800) return 'napoleon';
  if (year >= 1648) return 'earlyModern';
  if (year >= 1350) return 'reformation';
  if (year >= 1000) return 'highMedieval';
  if (year >= 500) return 'earlyMedieval';
  return 'ancient';
}
