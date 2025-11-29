import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-mono text-primary tracking-wider mb-4">
              WATER CONSUMPTION FORECASTING
            </h1>
            <div className="h-1 w-32 bg-primary mx-auto mb-8"></div>
          </div>

          {/* Project Overview */}
          <Card className="border-border bg-card p-8 mb-8">
            <h2 className="text-xl text-muted-foreground mb-6">[Project Overview Section]</h2>
            <div className="space-y-4 text-foreground">
              <p className="leading-relaxed">
                <span className="text-primary">→</span> Brief description of the ML models used: 
                This project employs three advanced regression algorithms (LASSO, KNN, and Ridge) to forecast water consumption patterns.
              </p>
              <p className="leading-relaxed">
                <span className="text-primary">→</span> Dataset information: 
                20 countries analyzed from 1990-2024, encompassing population, economic factors, and environmental variables.
              </p>
              <p className="leading-relaxed">
                <span className="text-primary">→</span> Key features: 
                Multi-model comparison, interactive predictions, historical trend analysis, and policy recommendations.
              </p>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-xl text-muted-foreground mb-6">[Quick Actions]</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                className="border-primary bg-card p-6 cursor-pointer hover:bg-primary/10 transition-all group"
                onClick={() => navigate("/dashboard")}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-primary">DASHBOARD</h3>
                  <ArrowRight className="text-primary group-hover:translate-x-2 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Interactive multi-country comparison with filters and trends
                </p>
              </Card>

              <Card 
                className="border-chart-1 bg-card p-6 cursor-pointer hover:bg-chart-1/10 transition-all group"
                onClick={() => navigate("/predict")}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-chart-1">PREDICT</h3>
                  <ArrowRight className="text-chart-1 group-hover:translate-x-2 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate water consumption forecasts for any country and year
                </p>
              </Card>

              <Card 
                className="border-chart-2 bg-card p-6 cursor-pointer hover:bg-chart-2/10 transition-all group"
                onClick={() => navigate("/compare")}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-chart-2">COMPARE MODELS</h3>
                  <ArrowRight className="text-chart-2 group-hover:translate-x-2 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Compare performance metrics across all three ML models
                </p>
              </Card>

              <Card 
                className="border-chart-3 bg-card p-6 cursor-pointer hover:bg-chart-3/10 transition-all group"
                onClick={() => navigate("/analyze")}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-chart-3">ANALYZE RESULTS</h3>
                  <ArrowRight className="text-chart-3 group-hover:translate-x-2 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Deep dive into country-specific water consumption patterns
                </p>
              </Card>
            </div>
          </div>

          {/* Recent Predictions Carousel */}
          <Card className="border-border bg-card p-8">
            <h2 className="text-xl text-muted-foreground mb-6">[Recent Predictions Carousel]</h2>
            <p className="text-sm text-muted-foreground">(Display sample predictions)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {["USA → 2050: +15%", "China → 2045: +22%", "India → 2048: +35%"].map((pred, idx) => (
                <div key={idx} className="border border-border p-4 text-center">
                  <p className="text-primary font-mono">{pred}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Water Consumption Forecasting System | ML Models: LASSO, KNN, Ridge Regression
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
