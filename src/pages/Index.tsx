import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Interface updated to match the backend's expected request body
interface FormData {
  jobName: string;
  elapsedSec: string;
  cpuSec: string;
  totalTxnVolume: string;
  enterDate: string; // Changed from various fields to a single date input
  isWeekend: string;
  isMonthend: string;
  isHoliday: string;
}

// Interface updated to match the backend's full response
interface PredictionResult {
  status: "FAIL" | "SUCCESS";
  probability: string;
  cause: string;
  riskLevel: string;
  recommendedAction: string;
}

const Index = () => {
  // Initial state updated to match the new FormData interface
  const [formData, setFormData] = useState<FormData>({
    jobName: "",
    elapsedSec: "",
    cpuSec: "",
    totalTxnVolume: "",
    enterDate: new Date().toISOString().split("T")[0], // Default to today's date
    isWeekend: "0",
    isMonthend: "0",
    isHoliday: "0",
  });

  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Replaced the mock function with a real API call
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof FormData)[] = [
      "jobName",
      "elapsedSec",
      "cpuSec",
      "totalTxnVolume",
      "enterDate",
      "isWeekend",
      "isMonthend",
      "isHoliday",
    ];

    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields. Missing: ${emptyFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPredictionResult(null);

    try {
      // Fetch call to your deployed backend
      const response = await fetch(`https://backend-ibm-1.onrender.com/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          elapsedSec: parseFloat(formData.elapsedSec),
          cpuSec: parseFloat(formData.cpuSec),
          totalTxnVolume: parseInt(formData.totalTxnVolume, 10),
          isWeekend: parseInt(formData.isWeekend, 10),
          isMonthend: parseInt(formData.isMonthend, 10),
          isHoliday: parseInt(formData.isHoliday, 10),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setPredictionResult(result);

      toast({
        title: "Prediction Complete",
        description: `Job failure risk has been assessed: ${result.status}`,
      });
    } catch (error) {
      console.error("Prediction failed:", error);
      toast({
        title: "Prediction Error",
        description: "Could not connect to the prediction service. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Mainframe Failure Prediction Assistant
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter job and system context to predict the risk of failure before execution.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Job Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Job Name */}
                <div className="space-y-2">
                  <Label htmlFor="jobName">Job Name</Label>
                  <Input
                    id="jobName"
                    placeholder="e.g., CUST_REPORT_GEN"
                    value={formData.jobName}
                    onChange={(e) => handleInputChange("jobName", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                {/* Total Transaction Volume */}
                <div className="space-y-2">
                  <Label htmlFor="totalTxnVolume">Transaction Volume</Label>
                  <Input
                    id="totalTxnVolume"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.totalTxnVolume}
                    onChange={(e) => handleInputChange("totalTxnVolume", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                {/* Elapsed Sec */}
                <div className="space-y-2">
                  <Label htmlFor="elapsedSec">Expected Elapsed Time (sec)</Label>
                  <Input
                    id="elapsedSec"
                    type="number"
                    placeholder="e.g., 3600"
                    value={formData.elapsedSec}
                    onChange={(e) => handleInputChange("elapsedSec", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                {/* CPU Sec */}
                <div className="space-y-2">
                  <Label htmlFor="cpuSec">Expected CPU Time (sec)</Label>
                  <Input
                    id="cpuSec"
                    type="number"
                    placeholder="e.g., 1200"
                    value={formData.cpuSec}
                    onChange={(e) => handleInputChange("cpuSec", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                
                {/* Enter Date */}
                <div className="space-y-2">
                    <Label htmlFor="enterDate">Execution Date</Label>
                    <Input
                        id="enterDate"
                        type="date"
                        value={formData.enterDate}
                        onChange={(e) => handleInputChange("enterDate", e.target.value)}
                        className="bg-input border-border"
                    />
                </div>

                {/* Is Weekend */}
                <div className="space-y-2">
                  <Label htmlFor="isWeekend">Is it a Weekend?</Label>
                  <Select
                    value={formData.isWeekend}
                    onValueChange={(value) => handleInputChange("isWeekend", value)}
                  >
                    <SelectTrigger id="isWeekend" className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No</SelectItem>
                      <SelectItem value="1">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Is Month End */}
                <div className="space-y-2">
                  <Label htmlFor="isMonthend">Is it Month-End?</Label>
                  <Select
                    value={formData.isMonthend}
                    onValueChange={(value) => handleInputChange("isMonthend", value)}
                  >
                    <SelectTrigger id="isMonthend" className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No</SelectItem>
                      <SelectItem value="1">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Is Holiday */}
                <div className="space-y-2">
                  <Label htmlFor="isHoliday">Is it a Holiday?</Label>
                  <Select
                    value={formData.isHoliday}
                    onValueChange={(value) => handleInputChange("isHoliday", value)}
                  >
                    <SelectTrigger id="isHoliday" className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No</SelectItem>
                      <SelectItem value="1">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="flex justify-center pt-6">
                <Button type="submit" size="lg" className="px-16" disabled={isLoading}>
                  {isLoading ? "Predicting..." : "Predict Failure Risk"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Prediction Result</CardTitle>
            <CardDescription>The model's assessment of the job's failure risk.</CardDescription>
          </CardHeader>
          <CardContent>
            {!predictionResult ? (
              <p className="text-muted-foreground text-center py-12">
                Results will be displayed here after prediction.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <span className="font-medium text-foreground">Risk Level:</span>
                  <span className={`font-bold text-lg ${predictionResult.status === "FAIL" ? "text-destructive" : "text-success"}`}>
                    {predictionResult.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <span className="font-medium text-foreground">Status:</span>
                  <span className={`font-bold text-lg ${predictionResult.status === "FAIL" ? "text-destructive" : "text-success"}`}>
                    {predictionResult.status}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <span className="font-medium text-foreground">Failure Probability:</span>
                  <span className="font-bold text-lg text-foreground">{predictionResult.probability}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <span className="font-medium text-foreground">Predicted Cause:</span>
                  <span className="font-semibold text-right max-w-xs text-foreground">{predictionResult.cause}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <span className="font-medium text-foreground">Recommended Action:</span>
                  <span className="font-semibold text-right max-w-xs text-foreground">{predictionResult.recommendedAction}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
