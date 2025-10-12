import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface FormData {
  jobName: string;
  dataAnomalyFlag: string;
  totalTxnVolume: string;
  abendCode: string;
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
}

interface PredictionResult {
  status: "FAIL" | "SUCCESS";
  probability: string;
  cause: string;
}

const Index = () => {
  const [formData, setFormData] = useState<FormData>({
    jobName: "",
    dataAnomalyFlag: "",
    totalTxnVolume: "",
    abendCode: "",
    elapsedSec: "",
    cpuSec: "",
    diskSpaceUsedMb: "",
    storageStatus: "",
    systemId: "",
    cpuUtilization: "",
    jesQueueTimeSec: "",
    delayFromSchedule: "",
    restartCount: "",
    isMonthend: "",
  });

  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const mockPredict = (): PredictionResult => {
    // Mock prediction logic based on form data
    const diskSpace = parseFloat(formData.diskSpaceUsedMb) || 0;
    const cpuUtil = parseFloat(formData.cpuUtilization) || 0;
    const restartCount = parseInt(formData.restartCount) || 0;
    const dataAnomaly = formData.dataAnomalyFlag === "1";
    const storageIsCritical = formData.storageStatus === "Critical";
    const storageIsWarning = formData.storageStatus === "Warning";
    const hasCriticalAbend = ["S0C7", "S322", "SB37"].includes(formData.abendCode);

    let failureScore = 0;
    let cause = "Normal Operation";

    // Calculate failure score
    if (diskSpace > 1200) failureScore += 30;
    if (cpuUtil > 75) failureScore += 25;
    if (restartCount > 0) failureScore += 20;
    if (dataAnomaly) failureScore += 15;
    if (storageIsCritical) failureScore += 15;
    if (storageIsWarning) failureScore += 8;
    if (hasCriticalAbend) failureScore += 25;

    // Determine cause
    if (hasCriticalAbend) {
      cause = "Critical ABEND Code Detected";
    } else if (diskSpace > 1200 || storageIsCritical) {
      cause = "Storage / Disk Space Issues";
    } else if (cpuUtil > 75) {
      cause = "High CPU Utilization";
    } else if (restartCount > 0) {
      cause = "Multiple Restart Attempts";
    } else if (dataAnomaly) {
      cause = "Data Anomaly Detected";
    } else if (storageIsWarning) {
      cause = "Storage Warning Detected";
    }

    const probability = Math.min(95, Math.max(5, failureScore + Math.random() * 20)).toFixed(2);
    const status = failureScore > 50 ? "FAIL" : "SUCCESS";

    return {
      status,
      probability: `${probability}%`,
      cause: status === "FAIL" ? cause : "Normal Operation",
    };
  };

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields: (keyof FormData)[] = [
      "jobName",
      "dataAnomalyFlag",
      "totalTxnVolume",
      "abendCode",
      "elapsedSec",
      "cpuSec",
      "diskSpaceUsedMb",
      "storageStatus",
      "systemId",
      "cpuUtilization",
      "jesQueueTimeSec",
      "delayFromSchedule",
      "restartCount",
      "isMonthend",
    ];

    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before predicting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const result = mockPredict();
      setPredictionResult(result);
      setIsLoading(false);
      toast({
        title: "Prediction Complete",
        description: `Job failure risk has been assessed: ${result.status}`,
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Input Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Mainframe Batch Job Failure Prediction
            </CardTitle>
            <CardDescription className="text-base">
              Enter the details of the batch job to predict its likelihood of failure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePredict} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="jobName">Job Name</Label>
                  <Input
                    id="jobName"
                    placeholder="e.g., JOB001"
                    value={formData.jobName}
                    onChange={(e) => handleInputChange("jobName", e.target.value)}
                  />
                </div>

                {/* Data Anomaly Flag */}
                <div className="space-y-2">
                  <Label htmlFor="dataAnomalyFlag">DATA ANOMALY FLAG</Label>
                  <Select
                    value={formData.dataAnomalyFlag}
                    onValueChange={(value) => handleInputChange("dataAnomalyFlag", value)}
                  >
                    <SelectTrigger id="dataAnomalyFlag">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Total Transaction Volume */}
                <div className="space-y-2">
                  <Label htmlFor="totalTxnVolume">TOTAL TXN VOLUME</Label>
                  <Input
                    id="totalTxnVolume"
                    type="number"
                    placeholder="e.g., 250000"
                    value={formData.totalTxnVolume}
                    onChange={(e) => handleInputChange("totalTxnVolume", e.target.value)}
                  />
                </div>

                {/* ABEND Code */}
                <div className="space-y-2">
                  <Label htmlFor="abendCode">ABEND CODE</Label>
                  <Select
                    value={formData.abendCode}
                    onValueChange={(value) => handleInputChange("abendCode", value)}
                  >
                    <SelectTrigger id="abendCode">
                      <SelectValue placeholder="Select code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S000">S000</SelectItem>
                      <SelectItem value="S0C7">S0C7</SelectItem>
                      <SelectItem value="S322">S322</SelectItem>
                      <SelectItem value="SB37">SB37</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Elapsed Sec */}
                <div className="space-y-2">
                  <Label htmlFor="elapsedSec">ELAPSED SEC</Label>
                  <Input
                    id="elapsedSec"
                    type="number"
                    placeholder="e.g., 300"
                    value={formData.elapsedSec}
                    onChange={(e) => handleInputChange("elapsedSec", e.target.value)}
                  />
                </div>

                {/* CPU Sec */}
                <div className="space-y-2">
                  <Label htmlFor="cpuSec">CPU SEC</Label>
                  <Input
                    id="cpuSec"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.cpuSec}
                    onChange={(e) => handleInputChange("cpuSec", e.target.value)}
                  />
                </div>

                {/* Disk Space Used MB */}
                <div className="space-y-2">
                  <Label htmlFor="diskSpaceUsedMb">DISK SPACE USED MB</Label>
                  <Input
                    id="diskSpaceUsedMb"
                    type="number"
                    placeholder="e.g., 1500"
                    value={formData.diskSpaceUsedMb}
                    onChange={(e) => handleInputChange("diskSpaceUsedMb", e.target.value)}
                  />
                </div>

                {/* Storage Status */}
                <div className="space-y-2">
                  <Label htmlFor="storageStatus">STORAGE STATUS</Label>
                  <Select
                    value={formData.storageStatus}
                    onValueChange={(value) => handleInputChange("storageStatus", value)}
                  >
                    <SelectTrigger id="storageStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Warning">Warning</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* System ID */}
                <div className="space-y-2">
                  <Label htmlFor="systemId">SYSTEM ID</Label>
                  <Select
                    value={formData.systemId}
                    onValueChange={(value) => handleInputChange("systemId", value)}
                  >
                    <SelectTrigger id="systemId">
                      <SelectValue placeholder="Select system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYS_A">SYS_A</SelectItem>
                      <SelectItem value="SYS_B">SYS_B</SelectItem>
                      <SelectItem value="SYS_C">SYS_C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* CPU Utilization % */}
                <div className="space-y-2">
                  <Label htmlFor="cpuUtilization">CPU UTILIZATION %</Label>
                  <Input
                    id="cpuUtilization"
                    type="number"
                    placeholder="e.g., 60"
                    value={formData.cpuUtilization}
                    onChange={(e) => handleInputChange("cpuUtilization", e.target.value)}
                  />
                </div>

                {/* JES Queue Time Sec */}
                <div className="space-y-2">
                  <Label htmlFor="jesQueueTimeSec">JES QUEUE TIME SEC</Label>
                  <Input
                    id="jesQueueTimeSec"
                    type="number"
                    placeholder="e.g., 15"
                    value={formData.jesQueueTimeSec}
                    onChange={(e) => handleInputChange("jesQueueTimeSec", e.target.value)}
                  />
                </div>

                {/* Delay from Schedule */}
                <div className="space-y-2">
                  <Label htmlFor="delayFromSchedule">DELAY FROM SCHEDULE</Label>
                  <Input
                    id="delayFromSchedule"
                    type="number"
                    placeholder="e.g., 0"
                    value={formData.delayFromSchedule}
                    onChange={(e) => handleInputChange("delayFromSchedule", e.target.value)}
                  />
                </div>

                {/* Restart Count */}
                <div className="space-y-2">
                  <Label htmlFor="restartCount">RESTART COUNT</Label>
                  <Input
                    id="restartCount"
                    type="number"
                    placeholder="e.g., 0"
                    value={formData.restartCount}
                    onChange={(e) => handleInputChange("restartCount", e.target.value)}
                  />
                </div>

                {/* Is Month End */}
                <div className="space-y-2">
                  <Label htmlFor="isMonthend">IS MONTHEND</Label>
                  <Select
                    value={formData.isMonthend}
                    onValueChange={(value) => handleInputChange("isMonthend", value)}
                  >
                    <SelectTrigger id="isMonthend">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button type="submit" size="lg" className="w-full md:w-auto px-12" disabled={isLoading}>
                  {isLoading ? "Predicting..." : "Predict Failure Risk"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Prediction Result Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Prediction Result</CardTitle>
          </CardHeader>
          <CardContent>
            {!predictionResult ? (
              <p className="text-muted-foreground text-center py-8">
                Results will be displayed here after prediction.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="font-medium">Prediction Status:</span>
                  <span
                    className={`font-bold text-lg ${
                      predictionResult.status === "FAIL"
                        ? "text-destructive"
                        : "text-success"
                    }`}
                  >
                    {predictionResult.status}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="font-medium">Failure Probability:</span>
                  <span className="font-bold text-lg">{predictionResult.probability}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="font-medium">Predicted Cause:</span>
                  <span className="font-semibold text-right max-w-xs">{predictionResult.cause}</span>
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
