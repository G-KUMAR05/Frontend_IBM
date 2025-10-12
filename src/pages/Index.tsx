import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface FormData {
  jobName: string;
  dataAnomalyFlag: string;
  totalTxnVolume: string;
  // abendCode: string; <-- REMOVED
  elapsedSec: string;
  cpuSec: string;
  diskSpaceUsedMb: string;
  storageStatus: string;
  systemId: string;
  cpuUtilization: string;
  jesQueueTimeSec: string;
  delayFromSchedule: string;
  restartCount: string;
  isMonthend: string;
  enterDate: string; // ADDED
  isWeekend: string; // ADDED
  isHoliday: string; // ADDED
}

interface PredictionResult {
  status: "FAIL" | "SUCCESS";
  probability: string;
  cause: string;
  riskLevel: string; // ADDED
  recommendedAction: string; // ADDED
}

const Index = () => {
  const [formData, setFormData] = useState<FormData>({
    jobName: "",
    dataAnomalyFlag: "0",
    totalTxnVolume: "",
    elapsedSec: "",
    cpuSec: "",
    diskSpaceUsedMb: "",
    storageStatus: "Normal",
    systemId: "SYS_A",
    cpuUtilization: "",
    jesQueueTimeSec: "",
    delayFromSchedule: "",
    restartCount: "",
    isMonthend: "0",
    enterDate: new Date().toISOString().split("T")[0], // Default to today
    isWeekend: "0",
    isHoliday: "0",
  });

  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof FormData)[] = [
      "jobName", "totalTxnVolume", "elapsedSec", "cpuSec", "diskSpaceUsedMb",
      "cpuUtilization", "jesQueueTimeSec", "delayFromSchedule", "restartCount", "enterDate"
    ];

    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before predicting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPredictionResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Network response was not ok");

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
        description: "Could not connect to the backend model. Please ensure it is running.",
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
          <h1 className="text-4xl font-bold text-foreground">Mainframe Batch Job Failure Prediction</h1>
          <p className="text-muted-foreground text-lg">
            Enter the job details below to predict the risk of failure.
          </p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-2xl font-bold">Input Form</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Job Info */}
                <div className="space-y-2"><Label htmlFor="jobName">Job Name</Label><Input id="jobName" placeholder="Enter job name" value={formData.jobName} onChange={(e) => handleInputChange("jobName", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="totalTxnVolume">Total TXN Volume</Label><Input id="totalTxnVolume" type="number" placeholder="Enter volume" value={formData.totalTxnVolume} onChange={(e) => handleInputChange("totalTxnVolume", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="restartCount">Restart Count</Label><Input id="restartCount" type="number" placeholder="Enter count" value={formData.restartCount} onChange={(e) => handleInputChange("restartCount", e.target.value)} /></div>
                
                {/* Performance Metrics */}
                <div className="space-y-2"><Label htmlFor="elapsedSec">Elapsed Sec</Label><Input id="elapsedSec" type="number" placeholder="Enter seconds" value={formData.elapsedSec} onChange={(e) => handleInputChange("elapsedSec", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="cpuSec">CPU Sec</Label><Input id="cpuSec" type="number" placeholder="Enter seconds" value={formData.cpuSec} onChange={(e) => handleInputChange("cpuSec", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="cpuUtilization">CPU Utilization %</Label><Input id="cpuUtilization" type="number" placeholder="Enter percentage" value={formData.cpuUtilization} onChange={(e) => handleInputChange("cpuUtilization", e.target.value)} /></div>

                {/* Resource Metrics */}
                <div className="space-y-2"><Label htmlFor="diskSpaceUsedMb">Disk Space Used MB</Label><Input id="diskSpaceUsedMb" type="number" placeholder="Enter MB" value={formData.diskSpaceUsedMb} onChange={(e) => handleInputChange("diskSpaceUsedMb", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="storageStatus">Storage Status</Label><Select value={formData.storageStatus} onValueChange={(v) => handleInputChange("storageStatus", v)}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Warning">Warning</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="systemId">System ID</Label><Select value={formData.systemId} onValueChange={(v) => handleInputChange("systemId", v)}><SelectTrigger><SelectValue placeholder="Select ID" /></SelectTrigger><SelectContent><SelectItem value="SYS_A">SYS_A</SelectItem><SelectItem value="SYS_B">SYS_B</SelectItem><SelectItem value="SYS_C">SYS_C</SelectItem></SelectContent></Select></div>

                {/* Scheduling and Flags */}
                <div className="space-y-2"><Label htmlFor="jesQueueTimeSec">JES Queue Time Sec</Label><Input id="jesQueueTimeSec" type="number" placeholder="Enter seconds" value={formData.jesQueueTimeSec} onChange={(e) => handleInputChange("jesQueueTimeSec", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="delayFromSchedule">Delay From Schedule</Label><Input id="delayFromSchedule" type="number" placeholder="Enter delay" value={formData.delayFromSchedule} onChange={(e) => handleInputChange("delayFromSchedule", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="dataAnomalyFlag">Data Anomaly Flag</Label><Select value={formData.dataAnomalyFlag} onValueChange={(v) => handleInputChange("dataAnomalyFlag", v)}><SelectTrigger><SelectValue placeholder="Select flag" /></SelectTrigger><SelectContent><SelectItem value="0">No</SelectItem><SelectItem value="1">Yes</SelectItem></SelectContent></Select></div>

                {/* NEW DATE FIELDS */}
                <div className="space-y-2"><Label htmlFor="enterDate">Enter Date</Label><Input id="enterDate" type="date" value={formData.enterDate} onChange={(e) => handleInputChange("enterDate", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="isWeekend">Is it a Weekend?</Label><Select value={formData.isWeekend} onValueChange={(v) => handleInputChange("isWeekend", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">No</SelectItem><SelectItem value="1">Yes</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="isHoliday">Is it a Holiday?</Label><Select value={formData.isHoliday} onValueChange={(v) => handleInputChange("isHoliday", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">No</SelectItem><SelectItem value="1">Yes</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="isMonthend">Is Month End?</Label><Select value={formData.isMonthend} onValueChange={(v) => handleInputChange("isMonthend", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">No</SelectItem><SelectItem value="1">Yes</SelectItem></SelectContent></Select></div>

              </div>
              <div className="flex justify-center pt-6"><Button type="submit" size="lg" className="px-16" disabled={isLoading}>{isLoading ? "Predicting..." : "Predict Failure Risk"}</Button></div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-2xl">Prediction Result</CardTitle></CardHeader>
          <CardContent>
            {!predictionResult ? (
              <p className="text-muted-foreground text-center py-12">Results will be displayed here.</p>
            ) : (
              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30"><span className="font-medium">Prediction Status:</span><span className={`font-bold ${predictionResult.status === "FAIL" ? "text-destructive" : "text-success"}`}>{predictionResult.status}</span></div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30"><span className="font-medium">Failure Probability:</span><span className="font-bold">{predictionResult.probability}</span></div>
                {/* NEW RESULT FIELDS */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30"><span className="font-medium">Risk Level:</span><span className="font-bold">{predictionResult.riskLevel}</span></div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30"><span className="font-medium">Predicted Cause:</span><span className="font-semibold text-right max-w-xs">{predictionResult.cause}</span></div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30"><span className="font-medium">💡 Recommended Action:</span><span className="font-semibold text-right max-w-xs">{predictionResult.recommendedAction}</span></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;