import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavLink } from "@/components/NavLink";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { loadDataset, getCountryData, getAvailableCountries, predictWaterConsumption, type WaterConsumptionData } from "@/lib/dataLoader";
import { useToast } from "@/hooks/use-toast";

const Predict = () => {
  const [dataset, setDataset] = useState<WaterConsumptionData[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadDataset();
        setDataset(data);
        const availableCountries = getAvailableCountries(data);
        setCountries(availableCountries);
      } catch (error) {
        console.error("Error loading dataset:", error);
        toast({
          title: "Error",
          description: "Failed to load dataset",
          variant: "destructive",
        });
      }
    };
    loadData();
  }, []);

  const handlePredict = async () => {
    if (!selectedCountry || !selectedYear || dataset.length === 0) return;

    setLoading(true);

    try {
      const countryData = getCountryData(dataset, selectedCountry);

      if (countryData.length === 0) {
        toast({
          title: "Error",
          description: "No data available for selected country",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const yearNum = parseInt(selectedYear);

      // Get actual historical data
      const historicalData = countryData.map(row => ({
        year: row.Year,
        consumption: row['Total Water Consumption(Billion Cubic Meters)'],
      }));

      // Get the most recent (baseline) year data
      const latestData = countryData[countryData.length - 1];
      const baselineYear = latestData.Year;
      const baselineConsumption = latestData['Total Water Consumption(Billion Cubic Meters)'];

      // Generate future data points for visualization
      const futureYears = yearNum - baselineYear;

      // We'll fetch predictions for each year to build the chart
      // Start from baselineYear + 1 to avoid duplicating the baseline year
      const predictionPromises = Array.from({ length: futureYears }, async (_, i) => {
        const year = baselineYear + i + 1; // Start from next year after baseline

        const pred = await predictWaterConsumption(selectedCountry, year);
        return {
          year,
          lasso: pred.lasso,
          knn: pred.knn,
          ridge: pred.ridge,
        };
      });

      const predictedData = await Promise.all(predictionPromises);

      // Add the baseline year as the first point of predictions to connect the lines
      // Also add consumption: null to maintain consistent data structure
      const futureDataWithBaseline = [
        {
          year: baselineYear,
          consumption: null, // Add null to avoid breaking the chart
          lasso: baselineConsumption,
          knn: baselineConsumption,
          ridge: baselineConsumption
        },
        ...predictedData.map(d => ({
          ...d,
          consumption: null // Add null consumption to future data points
        }))
      ];

      // Get the target year values from the last prediction
      const targetPredictions = predictedData[predictedData.length - 1];

      // Normalize historical data to include null prediction keys for consistency
      const normalizedHistoricalData = historicalData.map(d => ({
        ...d,
        lasso: null,
        knn: null,
        ridge: null
      }));

      setPredictions({
        historical: normalizedHistoricalData,
        future: futureDataWithBaseline,
        baselineYear,
        current: baselineConsumption,
        predicted: {
          lasso: targetPredictions.lasso,
          knn: targetPredictions.knn,
          ridge: targetPredictions.ridge,
        }
      });

      toast({
        title: "Prediction Complete",
        description: `Generated predictions for ${selectedCountry} in ${selectedYear}`,
      });
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        title: "Error",
        description: "Failed to generate predictions. Ensure backend is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-mono text-foreground tracking-wider">PREDICTION TOOL</h1>
            <div className="flex gap-4 text-sm">
              <NavLink to="/" className="text-muted-foreground hover:text-primary transition-colors">[Home]</NavLink>
              <NavLink to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">[Dashboard]</NavLink>
              <NavLink to="/compare" className="text-muted-foreground hover:text-primary transition-colors">[Compare]</NavLink>
              <NavLink to="/history" className="text-muted-foreground hover:text-primary transition-colors">[History]</NavLink>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card p-6">
              <h2 className="text-lg mb-6 text-muted-foreground">[Predict Total Water Consumption]</h2>
              <p className="text-xs text-muted-foreground mb-6 pb-4 border-b border-border">
                Forecast total water consumption in Billion Cubic Meters (BCM) from 2025 onwards
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Country:</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select country..." />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Forecast Year (2025+):</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select year..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => 2025 + i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handlePredict}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!selectedCountry || !selectedYear || loading || dataset.length === 0}
                >
                  {loading ? "[PROCESSING...]" : "[PREDICT WATER CONSUMPTION]"}
                </Button>

                {dataset.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">Loading dataset...</p>
                )}
              </div>
            </Card>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card p-6 h-full">
              <h2 className="text-lg mb-6 text-muted-foreground">
                [Total Water Consumption Forecast (Billion Cubic Meters)]
              </h2>

              {predictions ? (
                <div className="space-y-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[...predictions.historical, ...predictions.future]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="year"
                          stroke="hsl(var(--muted-foreground))"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          style={{ fontSize: '12px' }}
                          label={{ value: 'Water Consumption (BCM)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))'
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="consumption"
                          stroke="hsl(var(--muted-foreground))"
                          fill="hsl(var(--muted))"
                          name="Historical Data"
                        />
                        <Line
                          type="monotone"
                          dataKey="lasso"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="LASSO"
                        />
                        <Line
                          type="monotone"
                          dataKey="knn"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="KNN"
                        />
                        <Line
                          type="monotone"
                          dataKey="ridge"
                          stroke="hsl(var(--chart-3))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--chart-3))', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Ridge"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Quick Stats */}
                  <div className="border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      [Total Water Consumption Predictions - Billion Cubic Meters]
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="border border-border p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Baseline ({predictions.baselineYear}):</p>
                        <p className="text-lg text-primary font-mono">{predictions.current.toFixed(2)} BCM</p>
                      </div>
                      <div className="border border-chart-1 p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">LASSO ({selectedYear}):</p>
                        <p className="text-lg text-chart-1 font-mono">{predictions.predicted.lasso.toFixed(2)} BCM</p>
                      </div>
                      <div className="border border-chart-2 p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">KNN ({selectedYear}):</p>
                        <p className="text-lg text-chart-2 font-mono">{predictions.predicted.knn.toFixed(2)} BCM</p>
                      </div>
                      <div className="border border-chart-3 p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Ridge ({selectedYear}):</p>
                        <p className="text-lg text-chart-3 font-mono">{predictions.predicted.ridge.toFixed(2)} BCM</p>
                      </div>
                    </div>

                    {/* Growth Rate Summary */}
                    <div className="mt-4 border border-border p-4">
                      <p className="text-xs text-muted-foreground mb-2">Growth Rate Analysis:</p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-chart-1 mb-1">LASSO</p>
                          <p className="text-xs text-chart-1 mb-1">
                            {(((predictions.predicted.lasso - predictions.current) / predictions.current) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-chart-2 mb-1">KNN</p>
                          <p className="text-xs text-chart-2 mb-1">
                            {(((predictions.predicted.knn - predictions.current) / predictions.current) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-chart-3 mb-1">Ridge</p>
                          <p className="text-xs text-chart-3 mb-1">
                            {(((predictions.predicted.ridge - predictions.current) / predictions.current) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground">Select a country and year (2025+) to generate predictions</p>
                    <p className="text-xs text-muted-foreground">
                      Predictions show total water consumption in Billion Cubic Meters (BCM)
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predict;
