import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Trash2, Download, Eye } from "lucide-react";

interface PredictionRecord {
  id: number;
  country: string;
  date: string;
  baseYear: string;
  futureYear: string;
  change: string;
}

const mockPredictions: PredictionRecord[] = [
  { id: 1, country: "USA", date: "2024-05-20", baseYear: "2020", futureYear: "2050", change: "+15%" },
  { id: 2, country: "China", date: "2024-05-19", baseYear: "2015", futureYear: "2045", change: "+22%" },
  { id: 3, country: "India", date: "2024-05-18", baseYear: "2018", futureYear: "2048", change: "+35%" },
];

const History = () => {
  const [predictions, setPredictions] = useState<PredictionRecord[]>(mockPredictions);

  const handleDelete = (id: number) => {
    setPredictions(predictions.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    setPredictions([]);
  };

  const handleExportAll = () => {
    console.log("Exporting all predictions...");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-mono text-foreground tracking-wider">PREDICTION HISTORY</h1>
            <div className="flex gap-4 text-sm">
              <NavLink to="/" className="text-muted-foreground hover:text-primary transition-colors">[Home]</NavLink>
              <NavLink to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">[Dashboard]</NavLink>
              <NavLink to="/predict" className="text-muted-foreground hover:text-primary transition-colors">[Predict]</NavLink>
              <NavLink to="/compare" className="text-muted-foreground hover:text-primary transition-colors">[Compare]</NavLink>
            </div>
          </div>
        </div>

        <Card className="border-border bg-card p-6">
          {/* Search & Filter Options */}
          <div className="mb-6">
            <h2 className="text-sm text-muted-foreground mb-4">[Search & Filter Options]</h2>
            <div className="flex gap-4 text-sm">
              <span>Country: [All]</span>
              <span>|</span>
              <span>Date Range: [Last 30 days]</span>
              <span>|</span>
              <span>Sort: [Newest]</span>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="mb-6">
            <h2 className="text-sm text-muted-foreground mb-4">[Saved Predictions Table]</h2>
            {predictions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-muted-foreground">No.</th>
                      <th className="text-left py-3 text-muted-foreground">Country</th>
                      <th className="text-left py-3 text-muted-foreground">Date</th>
                      <th className="text-left py-3 text-muted-foreground">Base Year → Future</th>
                      <th className="text-left py-3 text-muted-foreground">Predicted Change</th>
                      <th className="text-left py-3 text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((pred) => (
                      <tr key={pred.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3">{pred.id}</td>
                        <td className="py-3">{pred.country}</td>
                        <td className="py-3">{pred.date}</td>
                        <td className="py-3">{pred.baseYear} → {pred.futureYear}</td>
                        <td className="py-3 text-accent">{pred.change}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => handleDelete(pred.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No predictions saved yet
              </div>
            )}
          </div>

          {/* Bulk Operations */}
          {predictions.length > 0 && (
            <div>
              <h2 className="text-sm text-muted-foreground mb-4">[Bulk Operations]</h2>
              <div className="flex gap-4">
                <Button 
                  variant="secondary"
                  onClick={handleExportAll}
                  className="border border-border"
                >
                  [Export All]
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleClearAll}
                >
                  [Clear History]
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default History;
