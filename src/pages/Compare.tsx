import { Card } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, ComposedChart } from "recharts";

const performanceData = [
  { metric: "MAE", LASSO: 45.2, KNN: 52.1, Ridge: 47.8 },
  { metric: "RMSE", LASSO: 58.7, KNN: 65.3, Ridge: 61.2 },
  { metric: "R² Score", LASSO: 0.92, KNN: 0.89, Ridge: 0.91 },
  { metric: "MAPE (%)", LASSO: 3.2, KNN: 3.8, Ridge: 3.5 },
];

const comparisonData = Array.from({ length: 35 }, (_, i) => {
  const year = 1990 + i;
  const actual = 450 + (i * 5) + (Math.random() * 20 - 10);
  const lasso = 450 + (i * 5) + (Math.random() * 15 - 7);
  const knn = 450 + (i * 5) + (Math.random() * 18 - 9);
  const ridge = 450 + (i * 5) + (Math.random() * 16 - 8);
  
  return {
    year,
    actual,
    lasso,
    knn,
    ridge,
    // 95% confidence intervals
    lassoUpper: lasso + 25,
    lassoLower: lasso - 25,
    knnUpper: knn + 35,
    knnLower: knn - 35,
    ridgeUpper: ridge + 28,
    ridgeLower: ridge - 28,
  };
});

const Compare = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-mono text-foreground tracking-wider">MODEL COMPARISON</h1>
            <div className="flex gap-4 text-sm">
              <NavLink to="/" className="text-muted-foreground hover:text-primary transition-colors">[Home]</NavLink>
              <NavLink to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">[Dashboard]</NavLink>
              <NavLink to="/predict" className="text-muted-foreground hover:text-primary transition-colors">[Predict]</NavLink>
              <NavLink to="/history" className="text-muted-foreground hover:text-primary transition-colors">[History]</NavLink>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <Card className="border-border bg-card p-6 mb-6">
          <h2 className="text-lg mb-6 text-muted-foreground">[Model Performance Metrics]</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-muted-foreground">Metric</th>
                  <th className="text-center py-3 text-chart-1">LASSO</th>
                  <th className="text-center py-3 text-chart-2">KNN</th>
                  <th className="text-center py-3 text-chart-3">Ridge</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((row) => (
                  <tr key={row.metric} className="border-b border-border">
                    <td className="py-3 text-foreground">{row.metric}</td>
                    <td className="text-center py-3 text-chart-1">{row.LASSO}</td>
                    <td className="text-center py-3 text-chart-2">{row.KNN}</td>
                    <td className="text-center py-3 text-chart-3">{row.Ridge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Visual Comparison */}
        <Card className="border-border bg-card p-6 mb-6">
          <h2 className="text-lg mb-6 text-muted-foreground">[Visual Comparison with 95% Confidence Intervals]</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Model predictions with shaded confidence bands showing uncertainty range
          </p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="year" 
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
                
                {/* Confidence Intervals as shaded areas */}
                <Area 
                  type="monotone" 
                  dataKey="lassoUpper" 
                  stroke="none"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.15}
                  legendType="none"
                />
                <Area 
                  type="monotone" 
                  dataKey="lassoLower" 
                  stroke="none"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.15}
                  legendType="none"
                />
                
                <Area 
                  type="monotone" 
                  dataKey="knnUpper" 
                  stroke="none"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.15}
                  legendType="none"
                />
                <Area 
                  type="monotone" 
                  dataKey="knnLower" 
                  stroke="none"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.15}
                  legendType="none"
                />
                
                <Area 
                  type="monotone" 
                  dataKey="ridgeUpper" 
                  stroke="none"
                  fill="hsl(var(--chart-3))"
                  fillOpacity={0.15}
                  legendType="none"
                />
                <Area 
                  type="monotone" 
                  dataKey="ridgeLower" 
                  stroke="none"
                  fill="hsl(var(--chart-3))"
                  fillOpacity={0.15}
                  legendType="none"
                />
                
                {/* Actual data line */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={3}
                  dot={false}
                  name="Actual Data"
                />
                
                {/* Prediction lines */}
                <Line 
                  type="monotone" 
                  dataKey="lasso" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={false}
                  name="LASSO (±95% CI)"
                />
                <Line 
                  type="monotone" 
                  dataKey="knn" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={false}
                  name="KNN (±95% CI)"
                />
                <Line 
                  type="monotone" 
                  dataKey="ridge" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={false}
                  name="Ridge (±95% CI)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Model Strengths & Weaknesses */}
        <Card className="border-border bg-card p-6">
          <h2 className="text-lg mb-6 text-muted-foreground">[Model Strengths & Weaknesses]</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-chart-1 p-4">
              <h3 className="text-chart-1 font-bold mb-4">LASSO</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Feature selection</li>
                <li>• Handles multicollinearity</li>
                <li>• Sparse solutions</li>
              </ul>
            </div>
            <div className="border border-chart-2 p-4">
              <h3 className="text-chart-2 font-bold mb-4">KNN</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Simple implementation</li>
                <li>• No linear assumptions</li>
                <li>• Local patterns</li>
              </ul>
            </div>
            <div className="border border-chart-3 p-4">
              <h3 className="text-chart-3 font-bold mb-4">RIDGE</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Stable with collinearity</li>
                <li>• All features retained</li>
                <li>• Smooth predictions</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Compare;
