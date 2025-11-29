import Papa from 'papaparse';

export interface WaterConsumptionData {
  Year: number;
  Country: string;
  'Country code': number;
  Population: number;
  'Total Water Consumption(Billion Cubic Meters)': number;
  'Per Capita Water Use (Liters per Day)': number;
  'Agricultural Water Use (%)': number;
  'Industrial Water Use (%)': number;
  'Household Water Use (%)': number;
  'Rainfall Impact (Annual Precipitation in mm)': number;
  'Groundwater Depletion Rate (%)': number;
  'Water Scarcity Level': string;
  'Number of dams': number;
  Reservoir_Capacity_TMC: number;
  Number_of_Industries: number;
  ISO_Code: string;
  [key: string]: any;
}

export const loadDataset = async (): Promise<WaterConsumptionData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse('/data/dataset.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as WaterConsumptionData[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const getCountryData = (data: WaterConsumptionData[], country: string) => {
  return data.filter(row => row.Country === country).sort((a, b) => a.Year - b.Year);
};

export const getAvailableCountries = (data: WaterConsumptionData[]): string[] => {
  const countries = new Set(data.map(row => row.Country));
  return Array.from(countries).sort();
};

export const predictWaterConsumption = async (
  country: string,
  targetYear: number
): Promise<{
  lasso: number;
  knn: number;
  ridge: number;
  baseline: { year: number; consumption: number };
}> => {
  try {
    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country: country,
        year: targetYear,
      }),
    });

    if (!response.ok) {
      throw new Error('Prediction failed');
    }

    const data = await response.json();
    return {
      lasso: data.predictions.lasso,
      knn: data.predictions.knn,
      ridge: data.predictions.ridge,
      baseline: data.baseline
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
