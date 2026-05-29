// Dashboard.jsx
// React + Tailwind CSS Frontend Design for InsightAI

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  LayoutDashboard,
  BrainCircuit,
  MessageSquare,
  Settings,
  FileText,
  TrendingUp,
  Upload,
  Moon,
  AlertCircle,
} from "lucide-react";
import * as api from "../services/api";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [insights, setInsights] = useState([]);
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [metadata, setMetadata] = useState({});

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hello! I am your InsightAI Chat Assistant. Upload a dataset or ask me any question about the current analysis." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Predictions State
  const [predictTarget, setPredictTarget] = useState("");
  const [predictFeatures, setPredictFeatures] = useState([]);
  const [predictInputs, setPredictInputs] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);

  // Reports State
  const [reports, setReports] = useState([]);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch data on mount & tab change
  useEffect(() => {
    fetchDashboardData();
    fetchReports();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [insightsData, chartsData] = await Promise.all([
        api.getInsights(),
        api.getCharts(),
      ]);
      setInsights(insightsData.insights || []);
      setCharts(chartsData.charts || []);
      
      // Pull dataset metadata from insights data if available
      if (insightsData.insights && insightsData.insights.length > 0) {
        // Find metadata insight
        const fileInsight = insightsData.insights.find(i => i.title.startsWith("Loaded Dataset:"));
        if (fileInsight) {
          // If we have data, we can estimate some values or request metadata
          // Let's set some default metadata structure
          setMetadata({
            filename: fileInsight.title.replace("Loaded Dataset: ", ""),
            hasData: true
          });
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.getReports();
      setReports(res.reports || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(true);
    try {
      const result = await api.uploadFile(file);
      console.log("File uploaded:", result);
      // Refresh dashboard data & reports
      await fetchDashboardData();
      await fetchReports();
      alert("Dataset uploaded and processed successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload file. Please check format.");
    } finally {
      setUploadProgress(false);
    }
  };

  // Chat message submit
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.sendMessage(userMsg.text);
      setChatMessages(prev => [...prev, { sender: "ai", text: res.response }]);
    } catch (err) {
      console.error("Chat failed:", err);
      setChatMessages(prev => [...prev, { sender: "ai", text: "Sorry, I had trouble communicating with the server. Please verify the backend is running." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Train and Run prediction model
  const handleTrainAndPredict = async (e) => {
    e.preventDefault();
    setPredictLoading(true);
    setPredictionResult(null);

    const payload = {
      target_column: predictTarget,
      feature_columns: predictFeatures,
      predict_values: predictInputs
    };

    try {
      const res = await api.predict(payload);
      setPredictionResult(res.prediction);
    } catch (err) {
      console.error("Prediction model failed:", err);
      alert("Error training ML model. Ensure columns selection matches data types.");
    } finally {
      setPredictLoading(false);
    }
  };

  const toggleFeatureSelect = (colName) => {
    setPredictFeatures(prev => 
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const handlePredictInputChange = (colName, val) => {
    setPredictInputs(prev => ({ ...prev, [colName]: val }));
  };

  // Auto-init prediction config when insights return available columns
  useEffect(() => {
    if (predictionResult && predictionResult.available_columns) {
      // Done already
    } else if (insights.length > 0) {
      // Synthesize available columns from statistical summaries
      const cols = [];
      insights.forEach(ins => {
        if (ins.title.startsWith("Statistical summary for ") || ins.title.startsWith("Dominant category in ")) {
          const rawCol = ins.title.replace("Statistical summary for ", "").replace("Dominant category in ", "");
          // Re-map to lowercase snake_case
          const key = rawCol.toLowerCase().replace(/ /g, "_");
          cols.push(key);
        }
      });
    }
  }, [insights]);

  // Derived variables for Dashboard view
  const loadedFilename = metadata.filename || "No File Loaded";
  const hasLoadedData = !!metadata.filename;

  return (
    <div className={`flex h-screen ${isDarkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-800"}`}>
      
      {/* Sidebar */}
      <div className="w-68 bg-gradient-to-b from-blue-950 to-blue-900 text-white p-5 flex flex-col justify-between shadow-2xl transition-all">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-500 p-2 rounded-2xl shadow-lg animate-pulse">
              <BarChart3 size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">InsightAI</h1>
          </div>

          <nav className="space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20} />} title="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
            <SidebarItem icon={<BarChart3 size={20} />} title="Analytics" active={activeTab === "Analytics"} onClick={() => setActiveTab("Analytics")} />
            <SidebarItem icon={<TrendingUp size={20} />} title="Predictions" active={activeTab === "Predictions"} onClick={() => setActiveTab("Predictions")} />
            <SidebarItem icon={<BrainCircuit size={20} />} title="AI Insights" active={activeTab === "AI Insights"} onClick={() => setActiveTab("AI Insights")} />
            <SidebarItem icon={<MessageSquare size={20} />} title="Chat Assistant" active={activeTab === "Chat Assistant"} onClick={() => setActiveTab("Chat Assistant")} />
            <SidebarItem icon={<FileText size={20} />} title="Reports" active={activeTab === "Reports"} onClick={() => setActiveTab("Reports")} />
            <SidebarItem icon={<Settings size={20} />} title="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
          </nav>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-2xl ${isDarkMode ? "bg-gray-900" : "bg-blue-800/40"} backdrop-blur-md border border-white/10`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-400 to-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md">
              U
            </div>
            <div>
              <p className="text-sm font-semibold">Workspace User</p>
              <p className="text-xs text-blue-200 font-medium">Standard Plan</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2 hover:bg-white/10 rounded-xl transition"
            title="Toggle Theme"
          >
            <Moon size={18} className="text-white" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-10">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {activeTab === "Dashboard" && "AI Executive Dashboard"}
              {activeTab === "Analytics" && "Advanced Visual Analytics"}
              {activeTab === "Predictions" && "Machine Learning Forecasts"}
              {activeTab === "AI Insights" && "Auto-Generated Data Insights"}
              {activeTab === "Chat Assistant" && "Interactive Data Chatbot"}
              {activeTab === "Reports" && "Downloadable Reports"}
              {activeTab === "Settings" && "Application Settings"}
            </h1>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {hasLoadedData ? `Active dataset: ${loadedFilename}` : "Upload a dataset to begin automated intelligence profiling"}
            </p>
          </div>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl shadow-lg cursor-pointer transition transform hover:-translate-y-0.5 active:translate-y-0">
              <Upload size={18} />
              <span className="font-semibold text-sm">Upload Dataset</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileUpload}
                disabled={uploadProgress}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Global Loading / Error Panels */}
        {uploadProgress && (
          <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl mb-8 flex items-center gap-4 animate-pulse">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-blue-600">Uploading and analyzing your dataset. Please wait...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        {/* ==================== TAB VIEWS ==================== */}

        {loading && activeTab !== "Chat Assistant" ? (
          <div className="flex flex-col items-center justify-center h-80">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm">Calculating analysis statistics...</p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === "Dashboard" && (
              <div className="space-y-6">
                
                {/* Drag and Drop Box if no file loaded */}
                {!hasLoadedData && (
                  <div className={`border-2 border-dashed ${isDarkMode ? "border-gray-800 bg-gray-900/20" : "border-blue-200 bg-blue-50/20"} rounded-3xl p-10 text-center hover:border-blue-500 transition-all`}>
                    <Upload className="mx-auto mb-4 text-blue-500" size={48} />
                    <h3 className="text-xl font-bold mb-1">Get Started by Uploading</h3>
                    <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
                      Support CSV, Excel (XLSX/XLS), or JSON formats. Once loaded, scikit-learn and pandas will automatically clean and forecast.
                    </p>
                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl cursor-pointer inline-flex font-semibold shadow-md">
                      Browse Files
                      <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                )}

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <KPICard 
                    title="Dataset Rows" 
                    value={hasLoadedData ? (insights.length > 0 ? (insights[0].summary.match(/\d+/) ? insights[0].summary.match(/\d+/)[0] : "Loaded") : "Loaded") : "0"} 
                    desc={hasLoadedData ? "Cleaned entries" : "No active file"} 
                    icon="📊" 
                    isDarkMode={isDarkMode}
                  />
                  <KPICard 
                    title="AI Insights" 
                    value={insights.length.toString()} 
                    desc="Key summaries generated" 
                    icon="🧠" 
                    isDarkMode={isDarkMode}
                  />
                  <KPICard 
                    title="Visual Graphs" 
                    value={charts.length.toString()} 
                    desc="Interactive SVGs" 
                    icon="📈" 
                    isDarkMode={isDarkMode}
                  />
                  <KPICard 
                    title="Available Reports" 
                    value={reports.length.toString()} 
                    desc="Markdown downloads" 
                    icon="📄" 
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Main Dashboard Layout Splits */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left: AI Insights Preview */}
                  <div className={`lg:col-span-2 rounded-3xl p-6 shadow-md border ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg font-bold">Generated Intelligence Highlights</h3>
                      <button onClick={() => setActiveTab("AI Insights")} className="text-xs font-semibold text-blue-500 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {insights.slice(0, 3).map((item, idx) => (
                        <InsightItem key={idx} title={item.title} text={item.summary} isDarkMode={isDarkMode} />
                      ))}
                      {insights.length === 0 && (
                        <p className="text-gray-400 text-sm py-4">No insights generated yet. Load a dataset to begin.</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Chat Assistant Widget */}
                  <div className={`rounded-3xl p-6 shadow-md border flex flex-col justify-between h-[360px] ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Ask Dataset AI</h3>
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                      </div>
                      <div className="overflow-y-auto max-h-[220px] text-xs space-y-2 pr-1">
                        {chatMessages.slice(-3).map((msg, idx) => (
                          <div key={idx} className={`p-2.5 rounded-xl ${msg.sender === "user" ? "bg-blue-600 text-white ml-6" : (isDarkMode ? "bg-gray-800" : "bg-gray-100")}`}>
                            <p className="font-semibold mb-0.5">{msg.sender === "user" ? "You" : "InsightAI"}</p>
                            <p className="opacity-90">{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <form onSubmit={handleChatSubmit} className="flex gap-2 mt-3">
                      <input 
                        type="text" 
                        placeholder="Ask about columns or statistics..." 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className={`flex-1 text-xs border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                      />
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs rounded-xl font-bold">Send</button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ANALYTICS VIEW (CHARTS) */}
            {activeTab === "Analytics" && (
              <div className="space-y-6">
                {charts.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <p className="mb-2">No visualization metrics found.</p>
                    <p className="text-xs">Please upload a valid data file (CSV/XLSX) to generate charts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {charts.map((chart, idx) => (
                      <SVGChartCard key={idx} chart={chart} isDarkMode={isDarkMode} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. PREDICTIONS VIEW (ML) */}
            {activeTab === "Predictions" && (
              <div className="space-y-6">
                {!hasLoadedData ? (
                  <div className="text-center py-20 text-gray-400">
                    <p className="mb-2">Machine Learning forecasting requires an uploaded dataset.</p>
                    <p className="text-xs">Upload a CSV or JSON file containing numerical or categorical variables.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Panel: Training configuration */}
                    <div className={`lg:col-span-1 rounded-3xl p-6 shadow-md border ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
                      <h3 className="text-xl font-bold mb-4">ML Configurator</h3>
                      
                      <form onSubmit={handleTrainAndPredict} className="space-y-5">
                        {/* Target Selection */}
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Target Variable (Y)</label>
                          <select 
                            className={`w-full border rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 text-sm ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                            value={predictTarget}
                            onChange={(e) => {
                              setPredictTarget(e.target.value);
                              setPredictFeatures([]);
                            }}
                          >
                            <option value="">-- Choose Target Column --</option>
                            {/* Derive columns list from loaded dataframe via default list or predictionResult */}
                            {predictionResult?.available_columns?.map(col => (
                              <option key={col} value={col}>{col}</option>
                            )) || insights.map((ins, i) => {
                              if (ins.title.startsWith("Statistical summary for ") || ins.title.startsWith("Dominant category in ")) {
                                const col = ins.title.replace("Statistical summary for ", "").replace("Dominant category in ", "").toLowerCase().replace(/ /g, "_");
                                return <option key={i} value={col}>{col}</option>;
                              }
                              return null;
                            })}
                          </select>
                        </div>

                        {/* Features Selection */}
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Predictor Features (X)</label>
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {/* Filter target from choices */}
                            {(predictionResult?.available_columns || []).filter(c => c !== predictTarget).map(col => (
                              <label key={col} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={predictFeatures.includes(col)}
                                  onChange={() => toggleFeatureSelect(col)}
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="font-medium text-xs truncate">{col}</span>
                              </label>
                            ))}
                            {(!predictionResult || !predictionResult.available_columns) && (
                              <p className="text-xs text-gray-400">Select target column first, or upload dataset to list features.</p>
                            )}
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          disabled={predictLoading}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          {predictLoading ? "Training Scikit-Learn Model..." : "Train ML Model"}
                        </button>
                      </form>
                    </div>

                    {/* Right Panel: Inference inputs and outputs */}
                    <div className={`lg:col-span-2 rounded-3xl p-6 shadow-md border ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
                      <h3 className="text-xl font-bold mb-4">Interactive Forecast Model</h3>
                      
                      {predictionResult ? (
                        <div className="space-y-6">
                          
                          {/* Training score feedback */}
                          <div className={`p-4 rounded-2xl flex justify-between items-center ${isDarkMode ? "bg-gray-800/40" : "bg-blue-50/50"}`}>
                            <div>
                              <p className="text-xs text-gray-400 uppercase font-bold">Trained Model Performance</p>
                              <h4 className="text-lg font-bold">
                                {predictionResult.is_classification ? "Random Forest Classifier" : "Linear Regressor"}
                              </h4>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 uppercase font-bold">{predictionResult.score_type}</p>
                              <span className="text-2xl font-black text-blue-600">{(predictionResult.score * 100).toFixed(1)}%</span>
                            </div>
                          </div>

                          {/* Predict inputs */}
                          {predictFeatures.length > 0 && (
                            <div>
                              <h4 className="text-sm font-bold mb-3 text-gray-400 uppercase">Input Feature Values</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {predictFeatures.map(col => (
                                  <div key={col}>
                                    <label className="block text-xs font-semibold mb-1 truncate">{col}</label>
                                    <input 
                                      type="text" 
                                      placeholder={`Enter ${col}...`} 
                                      value={predictInputs[col] || ""}
                                      onChange={(e) => handlePredictInputChange(col, e.target.value)}
                                      className={`w-full text-xs border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prediction output trigger & display */}
                          <div className="pt-4 border-t border-gray-200/25 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <button 
                              onClick={handleTrainAndPredict}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs"
                            >
                              Re-Calculate Prediction
                            </button>
                            
                            <div className="text-right">
                              <p className="text-xs text-gray-400 uppercase font-bold">Calculated Prediction Output</p>
                              <span className="text-3xl font-black text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500">
                                {predictionResult.prediction}
                              </span>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                          <p className="text-sm mb-1 font-medium">No Model Trained Yet</p>
                          <p className="text-xs">Configure the ML target and predictor features, and click "Train ML Model" to build a regression model.</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* 4. AI INSIGHTS VIEW */}
            {activeTab === "AI Insights" && (
              <div className="space-y-6">
                {insights.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <p className="mb-2">No insights available.</p>
                    <p className="text-xs">Please upload a dataset to begin profiling.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {insights.map((item, idx) => (
                      <div key={idx} className={`rounded-3xl p-6 shadow-md border ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-2xl">
                            <BrainCircuit size={20} />
                          </div>
                          <h3 className="text-md font-bold">{item.title}</h3>
                        </div>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{item.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. CHAT ASSISTANT VIEW (FULL SCREEN BOARD) */}
            {activeTab === "Chat Assistant" && (
              <div className={`rounded-3xl shadow-md border flex flex-col h-[520px] justify-between ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
                
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200/25 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-indigo-500 to-blue-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs">
                      AI
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">Data Assistant</h3>
                      <p className="text-2xs text-green-500 font-bold">Online</p>
                    </div>
                  </div>
                  <button onClick={() => setChatMessages([{ sender: "ai", text: "Hello! I am your InsightAI Chat Assistant. Upload a dataset or ask me any question about the current analysis." }])} className="text-2xs text-gray-400 hover:text-red-500 font-semibold transition">Clear History</button>
                </div>

                {/* Message Logs */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                          : (isDarkMode ? "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700" : "bg-gray-100 text-gray-700 rounded-bl-none")
                      }`}>
                        <p className="font-bold text-xs mb-1 opacity-75">{msg.sender === "user" ? "You" : "InsightAI"}</p>
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className={`p-3.5 rounded-2xl text-sm ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} animate-pulse rounded-bl-none`}>
                        <div className="flex gap-1.5 items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200/25 flex gap-3">
                  <input
                    type="text"
                    placeholder="Ask 'What columns are available?' or 'Summarize statistics'..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className={`flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-blue-500 text-sm ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                  />
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold text-sm shadow-md"
                  >
                    Send Message
                  </button>
                </form>

              </div>
            )}

            {/* 6. REPORTS VIEW */}
            {activeTab === "Reports" && (
              <div className="space-y-6">
                {reports.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <p className="mb-2">No generated reports available.</p>
                    <p className="text-xs">Upload a dataset to automatically create markdown summary reports.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report, idx) => (
                      <div key={idx} className={`rounded-3xl p-6 shadow-md border flex flex-col justify-between h-48 ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
                        <div className="flex items-start gap-3">
                          <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-2xl">
                            <FileText size={22} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold truncate max-w-[180px]">{report}</h3>
                            <p className="text-2xs text-gray-400 mt-1 uppercase font-bold">Markdown File</p>
                          </div>
                        </div>
                        
                        <a 
                          href={`http://127.0.0.1:8000/api/reports/${report}`} 
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-xl font-bold text-xs block shadow-sm transition"
                        >
                          Download Markdown Report
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. SETTINGS VIEW */}
            {activeTab === "Settings" && (
              <div className="space-y-6">
                <div className={`rounded-3xl p-6 shadow-md border ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
                  <h3 className="text-xl font-bold mb-5">Interface & Application Config</h3>
                  
                  <div className="space-y-6 divide-y divide-gray-200/25">
                    
                    {/* Toggle Dark Mode */}
                    <div className="flex justify-between items-center py-4">
                      <div>
                        <h4 className="text-sm font-bold">Theme Mode</h4>
                        <p className="text-xs text-gray-400">Toggle between light and dark backgrounds</p>
                      </div>
                      <button 
                        onClick={() => setIsDarkMode(!isDarkMode)} 
                        className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition ${isDarkMode ? "bg-blue-600" : "bg-gray-300"}`}
                      >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition duration-300 ${isDarkMode ? "translate-x-7" : ""}`}></div>
                      </button>
                    </div>

                    {/* Reset State */}
                    <div className="flex justify-between items-center py-4">
                      <div>
                        <h4 className="text-sm font-bold">Default fallback URL</h4>
                        <p className="text-xs text-gray-400">Backend API URL used for data request queries</p>
                      </div>
                      <input 
                        type="text" 
                        disabled
                        value="http://127.0.0.1:8000"
                        className={`text-xs border rounded-lg px-3 py-1.5 outline-none max-w-[180px] text-center ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-100 border-gray-200 text-gray-400"}`}
                      />
                    </div>

                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

/* Sidebar Item */
const SidebarItem = ({ icon, title, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all ${
        active
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg font-bold scale-102"
          : "hover:bg-blue-800/40 text-gray-300 hover:text-white"
      }`}
    >
      {icon}
      <span className="text-sm">{title}</span>
    </div>
  );
};

/* KPI Card */
const KPICard = ({ title, value, desc, icon, isDarkMode }) => {
  return (
    <div className={`rounded-3xl shadow-md p-6 border transition transform hover:-translate-y-1 ${
      isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
    }`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold opacity-75">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <h2 className="text-3xl font-extrabold mb-1 tracking-tight">{value}</h2>
      <p className="text-2xs text-gray-400 font-medium">{desc}</p>
    </div>
  );
};

/* Insight Item List */
const InsightItem = ({ title, text, isDarkMode }) => {
  return (
    <div className={`p-4 rounded-2xl border-l-4 border-blue-500 shadow-sm transition ${
      isDarkMode ? "bg-gray-800/40 border-l-blue-500" : "bg-blue-50/40 border-l-blue-500"
    }`}>
      <h4 className="text-sm font-bold mb-1">{title}</h4>
      <p className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{text}</p>
    </div>
  );
};

/* SVG CHART CARD */
const SVGChartCard = ({ chart, isDarkMode }) => {
  const { title, type, labels = [], datasets = [] } = chart;
  const data = datasets[0]?.data || [];
  const label = datasets[0]?.label || "Dataset";

  // Compute SVG dimensions and limits
  const width = 450;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = data.length > 0 ? Math.max(...data, 1) : 1;
  const minVal = data.length > 0 ? Math.min(...data, 0) : 0;
  const valueRange = maxVal - minVal;

  return (
    <div className={`rounded-3xl shadow-md p-6 border ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
      <h3 className="text-md font-bold mb-4">{title}</h3>
      
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-xs text-gray-400">No chart values available.</div>
      ) : (
        <div className="flex justify-center w-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[480px]">
            
            {/* Background Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingTop + chartHeight * (1 - ratio);
              const gridVal = Math.round(minVal + valueRange * ratio);
              return (
                <g key={i}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke={isDarkMode ? "#2d3748" : "#edf2f7"} 
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 4} 
                    textAnchor="end" 
                    className="text-[9px] fill-gray-400 font-semibold"
                  >
                    {gridVal}
                  </text>
                </g>
              );
            })}

            {/* Line Chart Render */}
            {type === "line" && (() => {
              // Map points to SVG coordinates
              const points = data.map((val, idx) => {
                const x = paddingLeft + (idx / (data.length - 1 || 1)) * chartWidth;
                const y = paddingTop + (1 - ((val - minVal) / (valueRange || 1))) * chartHeight;
                return { x, y, val, label: labels[idx] };
              });

              const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

              // Create gradient path points
              const closedPathPoints = [
                `${points[0].x},${paddingTop + chartHeight}`,
                ...points.map(p => `${p.x},${p.y}`),
                `${points[points.length - 1].x},${paddingTop + chartHeight}`
              ].join(" ");

              return (
                <g>
                  {/* Fill Area Gradient */}
                  <defs>
                    <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <polygon points={closedPathPoints} fill={`url(#grad-${title})`} />
                  
                  {/* Line stroke */}
                  <polyline 
                    points={polylinePoints} 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />

                  {/* Draw circles */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="4.5" 
                        fill={isDarkMode ? "#1d4ed8" : "#60a5fa"} 
                        stroke="#ffffff" 
                        strokeWidth="1.5" 
                        className="transition transform hover:scale-150 cursor-pointer"
                      />
                      {/* Optional mini label on point if short data */}
                      {data.length <= 10 && (
                        <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[8px] font-bold fill-blue-500">
                          {Math.round(p.val)}
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              );
            })()}

            {/* Bar Chart Render */}
            {type === "bar" && (() => {
              const barWidth = Math.min((chartWidth / data.length) * 0.6, 26);
              const gap = (chartWidth - barWidth * data.length) / (data.length - 1 || 1);

              return (
                <g>
                  {data.map((val, idx) => {
                    const x = paddingLeft + idx * (barWidth + gap) + gap / 2;
                    const valRatio = (val - minVal) / (valueRange || 1);
                    const barHeight = Math.max(valRatio * chartHeight, 4);
                    const y = paddingTop + chartHeight - barHeight;

                    return (
                      <g key={idx}>
                        <rect 
                          x={x} 
                          y={y} 
                          width={barWidth} 
                          height={barHeight} 
                          fill="url(#barGrad)"
                          rx="4"
                          className="hover:opacity-85 transition cursor-pointer"
                        />
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                        {/* Value Text */}
                        {data.length <= 10 && (
                          <text x={x + barWidth/2} y={y - 5} textAnchor="middle" className="text-[8px] font-bold fill-gray-500">
                            {val}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })()}

            {/* Donut breakdown Render (represented as dynamic stacked visual bars for stability) */}
            {type === "pie" && (() => {
              const total = data.reduce((a, b) => a + b, 0);
              let cumulative = 0;
              const colors = ["#3b82f6", "#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

              return (
                <g transform={`translate(${paddingLeft}, ${paddingTop})`}>
                  {/* Cumulative horizontal progress bars */}
                  {data.map((val, idx) => {
                    const widthRatio = (val / total) * chartWidth;
                    const x = cumulative;
                    cumulative += widthRatio;
                    return (
                      <g key={idx}>
                        <rect 
                          x={x} 
                          y={chartHeight / 2 - 12} 
                          width={widthRatio} 
                          height="24" 
                          fill={colors[idx % colors.length]}
                          className="hover:opacity-90 transition cursor-pointer"
                        />
                        {/* Legend text */}
                        <circle cx={idx * 75} cy={chartHeight - 5} r="4" fill={colors[idx % colors.length]} />
                        <text x={idx * 75 + 8} y={chartHeight - 2} className="text-[8px] fill-gray-400 font-bold truncate w-14">
                          {labels[idx] ? (labels[idx].length > 8 ? labels[idx].slice(0,6)+'..' : labels[idx]) : ""}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}

            {/* X Axis Labels */}
            {type !== "pie" && labels.map((label, idx) => {
              const x = paddingLeft + (idx / (labels.length - 1 || 1)) * chartWidth;
              // Clean long labels
              const cleanLabel = label.length > 9 ? label.slice(2, 10) : label;
              return (
                <text 
                  key={idx} 
                  x={x} 
                  y={height - 10} 
                  textAnchor="middle" 
                  className="text-[8px] fill-gray-400 font-semibold"
                >
                  {cleanLabel}
                </text>
              );
            })}

          </svg>
        </div>
      )}
    </div>
  );
};

export default Dashboard;