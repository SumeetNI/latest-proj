import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavLink } from "@/components/NavLink";
import { Slider } from "@/components/ui/slider";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { loadDataset, getAvailableCountries, WaterConsumptionData } from "@/lib/dataLoader";
import { X } from "lucide-react";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const Dashboard = () => {
  const [allData, setAllData] = useState<WaterConsumptionData[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1990, 2024]);
  const [scarcityFilter, setScarcityFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataset().then((data) => {
      setAllData(data);
      const availableCountries = getAvailableCountries(data);
      setCountries(availableCountries);
      // Select first 3 countries by default
      setSelectedCountries(availableCountries.slice(0, 3));
      setLoading(false);
    });
  }, []);

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter(c => c !== country));
    } else {
      if (selectedCountries.length < 5) {
        setSelectedCountries([...selectedCountries, country]);
      }
    }
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter(c => c !== country));
  };

  const filteredData = useMemo(() => {
    return allData.filter(row => 
      selectedCountries.includes(row.Country) &&
      row.Year >= yearRange[0] &&
      row.Year <= yearRange[1] &&
      (scarcityFilter === "all" || row['Water Scarcity Level'] === scarcityFilter)
    );
  }, [allData, selectedCountries, yearRange, scarcityFilter]);

  // Prepare data for consumption trends (line chart)
  const trendData = useMemo(() => {
    const yearMap = new Map<number, any>();
    
    filteredData.forEach(row => {
      if (!yearMap.has(row.Year)) {
        yearMap.set(row.Year, { year: row.Year });
      }
      yearMap.get(row.Year)[row.Country] = row['Total Water Consumption(Billion Cubic Meters)'];
    });

    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  }, [filteredData]);

  // Prepare data for latest year comparison (bar chart)
  const latestYearData = useMemo(() => {
    const latestYear = yearRange[1];
    return filteredData
      .filter(row => row.Year === latestYear)
      .map(row => ({
        country: row.Country,
        consumption: row['Total Water Consumption(Billion Cubic Meters)'],
        perCapita: row['Per Capita Water Use (Liters per Day)'],
      }));
  }, [filteredData, yearRange]);

  // Prepare data for sector distribution comparison
  const sectorData = useMemo(() => {
    const latestYear = yearRange[1];
    return filteredData
      .filter(row => row.Year === latestYear)
      .map(row => ({
        country: row.Country,
        agricultural: row['Agricultural Water Use (%)'],
        industrial: row['Industrial Water Use (%)'],
        household: row['Household Water Use (%)'],
      }));
  }, [filteredData, yearRange]);

  // Prepare data for environmental factors radar
  const radarData = useMemo(() => {
    const latestYear = yearRange[1];
    const latestData = filteredData.filter(row => row.Year === latestYear);
    
    if (latestData.length === 0) return [];

    const metrics = [
      { metric: 'Population', key: 'Population', max: Math.max(...latestData.map(r => r.Population)) },
      { metric: 'Rainfall', key: 'Rainfall Impact (Annual Precipitation in mm)', max: 3000 },
      { metric: 'GW Depletion', key: 'Groundwater Depletion Rate (%)', max: 100 },
      { metric: 'Dams', key: 'Number of dams', max: Math.max(...latestData.map(r => r['Number of dams'])) },
      { metric: 'Industries', key: 'Number_of_Industries', max: Math.max(...latestData.map(r => r.Number_of_Industries)) },
    ];

    return metrics.map(m => {
      const dataPoint: any = { metric: m.metric };
      latestData.forEach(row => {
        dataPoint[row.Country] = ((row[m.key] || 0) / m.max) * 100;
      });
      return dataPoint;
    });
  }, [filteredData, yearRange]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const totalConsumption = filteredData
      .filter(row => row.Year === yearRange[1])
      .reduce((sum, row) => sum + row['Total Water Consumption(Billion Cubic Meters)'], 0);

    const avgPerCapita = filteredData
      .filter(row => row.Year === yearRange[1])
      .reduce((sum, row) => sum + row['Per Capita Water Use (Liters per Day)'], 0) / selectedCountries.length;

    const highScarcity = filteredData
      .filter(row => row.Year === yearRange[1] && row['Water Scarcity Level'] === 'High')
      .length;

    return {
      totalConsumption: totalConsumption.toFixed(1),
      avgPerCapita: avgPerCapita.toFixed(0),
      highScarcity,
      countriesCount: selectedCountries.length,
    };
  }, [filteredData, selectedCountries, yearRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-mono text-foreground tracking-wider">INTERACTIVE DASHBOARD</h1>
            <div className="flex gap-4 text-sm">
              <NavLink to="/" className="text-muted-foreground hover:text-primary transition-colors">[Home]</NavLink>
              <NavLink to="/predict" className="text-muted-foreground hover:text-primary transition-colors">[Predict]</NavLink>
              <NavLink to="/compare" className="text-muted-foreground hover:text-primary transition-colors">[Compare]</NavLink>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card p-6 sticky top-6">
              <h2 className="text-lg mb-6 text-muted-foreground">[Filters & Controls]</h2>
              
              {/* Selected Countries */}
              <div className="mb-6">
                <label className="block text-sm text-muted-foreground mb-3">Selected Countries ({selectedCountries.length}/5):</label>
                <div className="space-y-2 mb-3">
                  {selectedCountries.map((country) => (
                    <div key={country} className="flex items-center justify-between bg-muted p-2 rounded border border-border">
                      <span className="text-sm text-foreground">{country}</span>
                      <button onClick={() => removeCountry(country)} className="text-destructive hover:text-destructive/80">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Country Selector */}
              <div className="mb-6">
                <label className="block text-sm text-muted-foreground mb-3">Add Countries:</label>
                <div className="max-h-64 overflow-y-auto border border-border rounded p-2 bg-background">
                  {countries.map((country) => (
                    <div key={country} className="flex items-center space-x-2 py-2 hover:bg-muted/50 px-2 rounded">
                      <Checkbox
                        id={country}
                        checked={selectedCountries.includes(country)}
                        onCheckedChange={() => toggleCountry(country)}
                        disabled={!selectedCountries.includes(country) && selectedCountries.length >= 5}
                      />
                      <label
                        htmlFor={country}
                        className="text-sm text-foreground cursor-pointer flex-1"
                      >
                        {country}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year Range */}
              <div className="mb-6">
                <label className="block text-sm text-muted-foreground mb-3">
                  Year Range: {yearRange[0]} - {yearRange[1]}
                </label>
                <Slider
                  min={1990}
                  max={2024}
                  step={1}
                  value={yearRange}
                  onValueChange={(value) => setYearRange(value as [number, number])}
                  className="mb-2"
                />
              </div>

              {/* Scarcity Level Filter */}
              <div className="mb-6">
                <label className="block text-sm text-muted-foreground mb-3">Water Scarcity Level:</label>
                <Select value={scarcityFilter} onValueChange={setScarcityFilter}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedCountries(countries.slice(0, 5))}
                >
                  Select Top 5
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedCountries([])}
                >
                  Clear All
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary Stats */}
            {summaryStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Consumption ({yearRange[1]})</p>
                  <p className="text-2xl text-primary font-bold">{summaryStats.totalConsumption} BCM</p>
                </Card>
                <Card className="border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Avg Per Capita</p>
                  <p className="text-2xl text-chart-2 font-bold">{summaryStats.avgPerCapita} L/day</p>
                </Card>
                <Card className="border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">High Scarcity</p>
                  <p className="text-2xl text-chart-3 font-bold">{summaryStats.highScarcity}</p>
                </Card>
                <Card className="border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Countries Selected</p>
                  <p className="text-2xl text-chart-4 font-bold">{summaryStats.countriesCount}</p>
                </Card>
              </div>
            )}

            {/* Consumption Trends */}
            <Card className="border-border bg-card p-6">
              <h2 className="text-lg mb-4 text-muted-foreground">[Multi-Country Consumption Trends]</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
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
                    {selectedCountries.map((country, idx) => (
                      <Line
                        key={country}
                        type="monotone"
                        dataKey={country}
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Year Comparison */}
              <Card className="border-border bg-card p-6">
                <h2 className="text-lg mb-4 text-muted-foreground">[Consumption Comparison {yearRange[1]}]</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={latestYearData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="country" 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '10px' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
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
                      <Bar dataKey="consumption" fill="hsl(var(--chart-1))" name="Total (BCM)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Per Capita Comparison */}
              <Card className="border-border bg-card p-6">
                <h2 className="text-lg mb-4 text-muted-foreground">[Per Capita Use {yearRange[1]}]</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={latestYearData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="country" 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '10px' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
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
                      <Bar dataKey="perCapita" fill="hsl(var(--chart-2))" name="Liters/Day" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Sector Distribution */}
            <Card className="border-border bg-card p-6">
              <h2 className="text-lg mb-4 text-muted-foreground">[Sector Distribution Comparison]</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="country" 
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
                    <Bar dataKey="agricultural" stackId="a" fill="hsl(var(--chart-1))" name="Agricultural %" />
                    <Bar dataKey="industrial" stackId="a" fill="hsl(var(--chart-2))" name="Industrial %" />
                    <Bar dataKey="household" stackId="a" fill="hsl(var(--chart-3))" name="Household %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Environmental Factors Radar */}
            {radarData.length > 0 && (
              <Card className="border-border bg-card p-6">
                <h2 className="text-lg mb-4 text-muted-foreground">[Environmental Factors Comparison]</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                      />
                      <PolarRadiusAxis 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '10px' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                      />
                      <Legend />
                      {selectedCountries.map((country, idx) => (
                        <Radar
                          key={country}
                          name={country}
                          dataKey={country}
                          stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          fillOpacity={0.3}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  * Values normalized to 0-100 scale for comparison
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
