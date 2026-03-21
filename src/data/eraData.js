export const ERA_DATA = {
  modern: {
    label: "Contemporary World",
    groups: {
      "western": { color: "#4a6fa5", opacity: 0.55, countries: ["United States of America","Canada","United Kingdom","France","Germany","Italy","Spain","Australia","Japan","South Korea"] },
      "eastern": { color: "#b5451b", opacity: 0.55, countries: ["China","Russia","Iran","North Korea","Cuba","Venezuela","Belarus"] },
      "neutral": { color: "#5a8a5a", opacity: 0.45, countries: ["Switzerland","Sweden","Austria","India","Brazil","South Africa","Mexico"] },
    }
  },
  coldwar: {
    label: "Cold War Era",
    groups: {
      "nato": { color: "#4a6fa5", opacity: 0.6, countries: ["United States of America","Canada","United Kingdom","France","West Germany","Italy","Spain","Greece","Turkey","Belgium","Netherlands","Denmark","Norway","Portugal"] },
      "warsaw": { color: "#b5451b", opacity: 0.6, countries: ["Russia","Poland","Czechoslovakia","East Germany","Hungary","Romania","Bulgaria","Yugoslavia"] },
      "nonaligned": { color: "#5a8a5a", opacity: 0.45, countries: ["India","Egypt","Indonesia","Yugoslavia","Ghana","Tanzania"] },
      "colonial": { color: "#8a6a4a", opacity: 0.45, countries: ["Angola","Mozambique","Zimbabwe","Namibia","Kenya","Algeria"] },
    }
  },
  wwii: {
    label: "World War II",
    groups: {
      "allies": { color: "#4a6fa5", opacity: 0.65, countries: ["United States of America","United Kingdom","France","Russia","Canada","Australia","China","India","Poland","Netherlands","Belgium","Greece","Yugoslavia","Norway","South Africa","New Zealand"] },
      "axis": { color: "#b5451b", opacity: 0.65, countries: ["Germany","Italy","Japan","Hungary","Romania","Bulgaria","Finland","Thailand"] },
      "occupied": { color: "#8a3a1a", opacity: 0.7, countries: ["Austria","Czechia","Denmark","Netherlands","Belgium","Luxembourg","France","Yugoslavia","Greece","Norway"] },
      "neutral": { color: "#5a8a5a", opacity: 0.45, countries: ["Switzerland","Sweden","Spain","Portugal","Turkey","Argentina"] },
    }
  },
  wwi: {
    label: "World War I",
    groups: {
      "entente": { color: "#4a6fa5", opacity: 0.65, countries: ["France","United Kingdom","Russia","Italy","United States of America","Romania","Serbia","Greece","Belgium","Portugal","Japan"] },
      "central": { color: "#b5451b", opacity: 0.65, countries: ["Germany","Austria","Turkey","Bulgaria"] },
      "colonial": { color: "#8a6a4a", opacity: 0.5, countries: ["India","Egypt","Algeria","Morocco","Nigeria","South Africa","Kenya","Cameroon","Tanzania","Mozambique","Angola","Vietnam","Indonesia","Libya"] },
      "neutral": { color: "#5a8a5a", opacity: 0.45, countries: ["Switzerland","Spain","Netherlands","Sweden","Norway","Denmark","Argentina","Brazil","Chile"] },
    }
  },
  napoleon: {
    label: "Napoleonic Era",
    groups: {
      "french": { color: "#b5451b", opacity: 0.65, countries: ["France","Spain","Italy","Netherlands","Belgium","Luxembourg","Switzerland","Germany","Poland","Croatia"] },
      "coalition": { color: "#4a6fa5", opacity: 0.6, countries: ["United Kingdom","Austria","Russia","Sweden","Portugal","Hungary"] },
      "ottoman": { color: "#8a6a4a", opacity: 0.55, countries: ["Turkey","Greece","Serbia","Romania","Bulgaria","Iraq","Syria","Lebanon","Israel","Jordan","Egypt","Libya","Tunisia","Algeria"] },
      "neutral": { color: "#5a8a5a", opacity: 0.45, countries: ["Denmark","Norway","United States of America"] },
    }
  },
  medieval: {
    label: "Medieval Period",
    groups: {
      "catholic": { color: "#4a6fa5", opacity: 0.5, countries: ["France","Spain","Italy","Germany","Poland","Hungary","Portugal","England","Scotland"] },
      "byzantine": { color: "#8a6a4a", opacity: 0.6, countries: ["Greece","Turkey","Bulgaria","Serbia","Romania"] },
      "islamic": { color: "#b5451b", opacity: 0.55, countries: ["Morocco","Algeria","Tunisia","Libya","Egypt","Iraq","Iran","Saudi Arabia","Syria","Lebanon","Israel","Jordan"] },
      "mongol": { color: "#c9973a", opacity: 0.5, countries: ["Mongolia","China","Russia","Kazakhstan","Uzbekistan","Turkmenistan","Afghanistan","Iraq","Iran"] },
    }
  },
};

export function getEraKey(year) {
  if (year >= 1991) return 'modern';
  if (year >= 1947) return 'coldwar';
  if (year >= 1939) return 'wwii';
  if (year >= 1914) return 'wwi';
  if (year >= 1800) return 'napoleon';
  return 'medieval';
}
