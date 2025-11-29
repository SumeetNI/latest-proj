import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavLink } from "@/components/NavLink";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { loadDataset, getCountryData, getAvailableCountries, WaterConsumptionData } from "@/lib/dataLoader";

const CountryAnalysis = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [countryData, setCountryData] = useState<WaterConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataset().then((data) => {
      const availableCountries = getAvailableCountries(data);
      setCountries(availableCountries);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      loadDataset().then((data) => {
        const filtered = getCountryData(data, selectedCountry);
        setCountryData(filtered);
      });
    }
  }, [selectedCountry]);

  const latestData = countryData.length > 0 ? countryData[countryData.length - 1] : null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-mono text-foreground tracking-wider">COUNTRY ANALYSIS</h1>
            <div className="flex gap-4 text-sm">
              <NavLink to="/" className="text-muted-foreground hover:text-primary transition-colors">[Home]</NavLink>
              <NavLink to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">[Dashboard]</NavLink>
              <NavLink to="/predict" className="text-muted-foreground hover:text-primary transition-colors">[Predict]</NavLink>
              <NavLink to="/compare" className="text-muted-foreground hover:text-primary transition-colors">[Compare]</NavLink>
            </div>
          </div>
        </div>

        {/* Country Selector */}
        <Card className="border-border bg-card p-6 mb-6">
          <h2 className="text-sm text-muted-foreground mb-4">[Country Selector]</h2>
          <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={loading}>
            <SelectTrigger className="w-full md:w-96 bg-background border-border">
              <SelectValue placeholder="Select a country..." />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {latestData && (
          <>
            {/* Country Overview */}
            <Card className="border-border bg-card p-6 mb-6">
              <h2 className="text-lg text-muted-foreground mb-6">[Country Overview]</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Population (2024)</p>
                  <p className="text-xl text-primary">{(latestData.Population / 1000000).toFixed(1)}M</p>
                </div>
                <div className="border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Water Consumption</p>
                  <p className="text-xl text-primary">{latestData['Total Water Consumption(Billion Cubic Meters)'].toFixed(1)} BCM</p>
                </div>
                <div className="border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Per Capita Use</p>
                  <p className="text-xl text-primary">{latestData['Per Capita Water Use (Liters per Day)'].toFixed(0)} L/day</p>
                </div>
                <div className="border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Scarcity Level</p>
                  <p className="text-xl text-chart-3">{latestData['Water Scarcity Level']}</p>
                </div>
              </div>
            </Card>

            {/* Historical Trends */}
            <Card className="border-border bg-card p-6 mb-6">
              <h2 className="text-lg text-muted-foreground mb-6">[Historical Trends & Future Projections]</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={countryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="Year" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Total Water Consumption(Billion Cubic Meters)" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="Water Consumption (BCM)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Consumption Drivers */}
            <Card className="border-border bg-card p-6">
              <h2 className="text-lg text-muted-foreground mb-6">[Consumption Drivers]</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-border p-4">
                  <h3 className="text-sm font-bold text-foreground mb-4">Population Growth Impact</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countryData.slice(-10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="Year" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '10px' }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '10px' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Bar dataKey="Population" fill="hsl(var(--chart-1))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border border-border p-4">
                  <h3 className="text-sm font-bold text-foreground mb-4">Sector Distribution</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Agricultural</span>
                        <span className="text-primary">{latestData['Agricultural Water Use (%)'].toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-chart-1 rounded-full" 
                          style={{ width: `${latestData['Agricultural Water Use (%)']}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Industrial</span>
                        <span className="text-primary">{latestData['Industrial Water Use (%)'].toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-chart-2 rounded-full" 
                          style={{ width: `${latestData['Industrial Water Use (%)']}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Household</span>
                        <span className="text-primary">{latestData['Household Water Use (%)'].toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-chart-3 rounded-full" 
                          style={{ width: `${latestData['Household Water Use (%)']}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-border p-4">
                  <h3 className="text-sm font-bold text-foreground mb-4">Environmental Factors</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Rainfall:</span>
                      <span className="text-primary">{latestData['Rainfall Impact (Annual Precipitation in mm)']} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GW Depletion:</span>
                      <span className="text-chart-3">{latestData['Groundwater Depletion Rate (%)']}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number of Dams:</span>
                      <span className="text-primary">{latestData['Number of dams']}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default CountryAnalysis;
