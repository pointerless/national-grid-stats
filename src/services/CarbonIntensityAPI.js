

export function getGeneration(url = "https://api.carbonintensity.org.uk/generation"){
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => { resolve(response.json()); })
      .catch(reason => { reject(reason) });
  })
}

export function getGenerationTimeline(url = "https://api.carbonintensity.org.uk/generation"){
  return new Promise((resolve, reject) => {
    const now = new Date();
    fetch(url+`/${now.toISOString()}/pt24h`)
      .then(response => { resolve(response.json()); })
      .catch(reason => { reject(reason) });
  })
}

export function fuelTypes(){
  return [
    "gas",
    "coal",
    "nuclear",
    "imports",
    "biomass",
    "solar",
    "wind",
    "hydro",
    "other"
  ];
}

export function fuelColor(fuelName){
  const fuelCol = {
    gas: "#ff0055",
    coal: "#ff3300",
    nuclear: "#ab42ed",
    imports: "#688888",
    biomass: "#c0ed42",
    solar: "#40ff00",
    wind: "#00b518",
    hydro: "#3bffaa",
    other: "#777777",
  };

  return fuelCol[fuelName] || "#888888";
}

export function fuelSort(fuelName){
  const fuelOrd = {
    gas: 1,
    coal: 2,
    nuclear: 3,
    imports: 4,
    biomass: 5,
    solar: 6,
    wind: 7,
    hydro: 8,
    other: 9,
  };

  return fuelOrd[fuelName] || 10;
}