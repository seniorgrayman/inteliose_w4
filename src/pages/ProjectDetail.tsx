import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, Download, AlertCircle, CheckCircle, Menu, X, Loader, Sparkles, Copy, Check } from "lucide-react";
import { getProject, updateProject, deleteProject } from "@/lib/firebase/projects";
import { fetchSolanaTokenData, fetchBaseTokenData, fetchTokenData, fetchSecurityScan, generateAIAnalysis, type AIAnalysis } from "@/lib/tokendata";
import type { Project, TokenMetrics, ChecklistItem } from "@/types/profile";

const formatCurrency = (value: string | number | undefined): string => {
  if (!value || value === "—") return "—";
  
  // If it's already a formatted string (contains $ or M or K), return as-is
  if (typeof value === "string" && (value.includes("$") || value.includes("M") || value.includes("K"))) {
    return value;
  }
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  
  // If less than 1 million, show in thousands (K) format
  if (num < 1000000) {
    return `$${(num / 1000).toFixed(2)}K`;
  }
  
  // If 1 million or more, show with M
  return `$${(num / 1000000).toFixed(2)}M`;
};

const truncateAddress = (address: string, chars = 8): string => {
  if (!address) return "";
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [copiedCA, setCopiedCA] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadProject = async () => {
      try {
        setLoading(true);
        const proj = await getProject(id);
        if (!proj) {
          navigate("/manage-project");
          return;
        }
        setProject(proj);
        
        // Initialize checklist
        const defaultChecklist: ChecklistItem[] = [
          {
            id: "1",
            title: "Token Analyzed",
            description: "Project data loaded",
            completed: true,
            category: "token",
            timestamp: Date.now(),
          },
          {
            id: "3",
            title: "AI Analysis",
            description: "Generating...",
            completed: false,
            category: "analysis",
            timestamp: Date.now(),
          },
          {
            id: "4",
            title: "Market Metrics",
            description: "Loading...",
            completed: false,
            category: "market",
            timestamp: Date.now(),
          },
        ];
        setChecklist(defaultChecklist);

        // Fetch token metrics if not pre-launch
        if (!proj.profile.isPrelaunch && proj.profile.tokenAddress) {
          await fetchTokenMetrics(proj.profile.tokenAddress);
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const fetchTokenMetrics = async (tokenAddress: string) => {
    try {
      setTokenLoading(true);
      
      let metrics: TokenMetrics | null = null;

      // Detect chain based on token address format
      // If address starts with 0x, it's a Base token; otherwise it's Solana
      const isBase = tokenAddress.toLowerCase().startsWith("0x");

      if (isBase) {
        // Base token - fetch from Base directly
        try {
          const baseData = await fetchBaseTokenData(tokenAddress);
          if (baseData && baseData.name) {
            metrics = { ...baseData, chain: "Base" };
          }
        } catch {
          console.error("Failed to fetch Base token data");
        }
      } else {
        // Solana token - try Solana first, then Base as fallback
        try {
          const solanaData = await fetchSolanaTokenData(tokenAddress);
          if (solanaData && solanaData.name) {
            metrics = { ...solanaData, chain: "Solana" };
          }
        } catch {
          // Solana failed, try Base as fallback
          try {
            const baseData = await fetchBaseTokenData(tokenAddress);
            if (baseData && baseData.name) {
              metrics = { ...baseData, chain: "Base" };
            }
          } catch {
            console.error("Failed to fetch token data from both chains");
          }
        }
      }

      if (metrics) {
        setTokenMetrics(metrics);
        // Update checklist
        setChecklist((prev) =>
          prev.map((item) =>
            item.id === "4"
              ? {
                  ...item,
                  completed: true,
                  description: `${metrics.name} (${metrics.symbol})`,
                }
              : item
          )
        );

        // Generate AI Analysis for token advice to founder
        await generateFounderAIAnalysis(tokenAddress, metrics);
      }
    } catch (err) {
      console.error("Error fetching token metrics:", err);
    } finally {
      setTokenLoading(false);
    }
  };

  const generateFounderAIAnalysis = async (tokenAddress: string, tokenMetrics: TokenMetrics) => {
    try {
      setAILoading(true);

      const isBase = tokenAddress.toLowerCase().startsWith("0x");
      const chain = isBase ? "Base" : "Solana";

      // Fetch real token data from APIs - use fetchTokenData which handles all APIs
      const tokenData = await fetchTokenData(tokenAddress, chain);
      
      // Fetch security scan
      const securityData = await fetchSecurityScan(tokenAddress, chain);

      if (tokenData && securityData) {
        // Generate AI analysis tailored for founder advice with real-time token data
        const founderPrompt = `You are a professional cryptocurrency advisor providing strategic recommendations for a token founder. Analyze this token and provide actionable advice to improve the token based on current market conditions and security metrics.

Token: ${tokenMetrics.name} (${tokenMetrics.symbol})
Chain: ${chain}

Current Market Data:
- Price: ${tokenData.price || "N/A"}
- Market Cap: ${tokenData.marketCap || "N/A"}
- 24h Volume: ${tokenData.volume24h || "N/A"}
- Liquidity: ${tokenData.liquidity || "N/A"}

Security Audit Results:
- Hidden Owner: ${securityData.hiddenOwner ? "Yes ⚠️" : "No ✓"}
- Suspicious Functions: ${securityData.suspiciousFunctions ? "Yes ⚠️" : "No ✓"}
- Proxy Contract: ${securityData.proxyContract ? "Yes ⚠️" : "No ✓"}
- Mintable: ${securityData.mintable ? "Yes ⚠️" : "No ✓"}
- Can Pause Transfers: ${securityData.transferPausable ? "Yes ⚠️" : "No ✓"}
- Buy Tax: ${securityData.buyTax}
- Sell Tax: ${securityData.sellTax}

Provide founder-centric strategic advice in JSON format:
{
  "summary": "2-3 sentence assessment of the token's current state and what the founder should focus on",
  "riskLevel": "Very Low|Low|Medium|High|Very High (based on security and market metrics)",
  "recommendation": "Specific, actionable advice for the founder (e.g., 'Focus on liquidity depth', 'Reduce market cap concentration', etc.)",
  "keyPoints": ["founder action 1", "founder action 2", "founder action 3", "founder action 4"]
}

Be specific about founder actions they can take NOW to improve the token.`;

        // Use Gemini to generate founder-centric analysis
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
        if (geminiKey) {
          try {
            const response = await Promise.race([
              fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-goog-api-key": geminiKey,
                },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        {
                          text: founderPrompt,
                        },
                      ],
                    },
                  ],
                }),
              }),
              new Promise<Response>((_, reject) =>
                setTimeout(() => reject(new Error("Gemini API timeout")), 15000)
              ),
            ]) as Response;

            if (response.ok) {
              const data = await response.json();
              const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

              // Extract JSON from response
              const jsonMatch = responseText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                setAIAnalysis({
                  summary: analysis.summary || "Unable to generate summary",
                  riskLevel: analysis.riskLevel || "Medium",
                  recommendation: analysis.recommendation || "Review contract security",
                  keyPoints: analysis.keyPoints || [],
                });
                
                // Update checklist to show AI analysis is generated
                setChecklist((prev) =>
                  prev.map((item) =>
                    item.id === "3"
                      ? {
                          ...item,
                          completed: true,
                          description: analysis.riskLevel || "Analyzed",
                        }
                      : item
                  )
                );
              }
            }
          } catch (err) {
            console.error("Error with Gemini API:", err);
          }
        }
      }
    } catch (err) {
      console.error("Error generating AI analysis:", err);
    } finally {
      setAILoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteProject(id);
      navigate("/manage-project");
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleCopyCA = () => {
    if (project?.profile.tokenAddress) {
      navigator.clipboard.writeText(project.profile.tokenAddress);
      setCopiedCA(true);
      setTimeout(() => setCopiedCA(false), 2000);
    }
  };

  const handleExportPDF = () => {
    const element = document.querySelector("main") || document.body;
    const printWindow = window.open("", "", "height=auto,width=auto");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${project?.profile.tokenAddress || "Token Analysis"} - Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            h1 { color: #1e40af; }
            h2 { color: #1e40af; margin-top: 20px; }
            .section { margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb; }
            .label { font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase; }
            .value { font-size: 14px; color: #111827; margin-top: 5px; }
            .metric { padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; background: #f3f4f6; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 8px; border-bottom: 2px solid #1e40af; color: #1e40af; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <h1>Token Analysis Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          
          <div class="section">
            <h2>Project Information</h2>
            <div class="card">
              <p class="label">Token Address</p>
              <p class="value">${project?.profile.tokenAddress || "Pre-launch"}</p>
            </div>
          </div>

          ${tokenMetrics ? `
          <div class="section">
            <h2>Token Metrics</h2>
            <table>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
              <tr>
                <td>Name</td>
                <td>${tokenMetrics.name}</td>
              </tr>
              <tr>
                <td>Symbol</td>
                <td>${tokenMetrics.symbol}</td>
              </tr>
              <tr>
                <td>Price</td>
                <td>${tokenMetrics.price || "—"}</td>
              </tr>
              <tr>
                <td>Market Cap</td>
                <td>${tokenMetrics.marketCap || "—"}</td>
              </tr>
              <tr>
                <td>Liquidity</td>
                <td>${tokenMetrics.liquidity || "—"}</td>
              </tr>
              <tr>
                <td>24h Volume</td>
                <td>${tokenMetrics.volume24h || "—"}</td>
              </tr>
              <tr>
                <td>Chain</td>
                <td>${tokenMetrics.chain}</td>
              </tr>
            </table>
          </div>
          ` : ""}

          ${project?.snapshot ? `
          <div class="section">
            <h2>Risk Assessment</h2>
            <div class="card">
              <p class="label">Risk Level</p>
              <p class="value">${project.snapshot.riskBaseline}</p>
            </div>
          </div>
          ` : ""}

          ${aiAnalysis ? `
          <div class="section">
            <h2>AI Recommendations</h2>
            <div class="card">
              <p class="label">Risk Level</p>
              <p class="value">${aiAnalysis.riskLevel}</p>
            </div>
            <p><strong>Summary:</strong> ${aiAnalysis.summary}</p>
            <p><strong>Recommendation:</strong> ${aiAnalysis.recommendation}</p>
            ${aiAnalysis.keyPoints && aiAnalysis.keyPoints.length > 0 ? `
            <p><strong>Key Points:</strong></p>
            <ul>
              ${aiAnalysis.keyPoints.map(point => `<li>${point}</li>`).join("")}
            </ul>
            ` : ""}
          </div>
          ` : ""}

          ${project?.aiDiagnosis ? `
          <div class="section">
            <h2>Project Diagnosis</h2>
            <p>${project.aiDiagnosis.summary}</p>
          </div>
          ` : ""}

          <div class="section">
            <h2>Analysis Checklist</h2>
            <table>
              <tr>
                <th>Item</th>
                <th>Status</th>
              </tr>
              ${checklist.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.completed ? "✓ Completed" : "Pending"}</td>
              </tr>
              `).join("")}
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getRiskColor = (baseline: string) => {
    if (baseline === "Low") return "text-green-400 bg-green-400/10 border-green-400/30";
    if (baseline === "Moderate") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    if (baseline === "Elevated") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
    return "text-red-400 bg-red-400/10 border-red-400/30";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="inline-flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-10 sm:px-6 lg:pt-14">
          <button
            onClick={() => navigate("/manage-project")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6"
          >
            <ArrowLeft size={18} />
            Back to Projects
          </button>
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <AlertCircle size={48} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900">Project not found</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`h-screen w-80 bg-white border-r border-slate-200 overflow-y-auto
          hidden md:flex md:flex-col md:relative md:shadow-none md:fixed md:left-0 md:top-0 md:z-20
          fixed left-0 top-0 z-40 shadow-lg md:shadow-none
          ${sidebarOpen ? "flex flex-col" : "hidden"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Checklist</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Checklist Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-3">
              {checklist.map((item) => {
                const categoryColors = {
                  token: { bg: "bg-green-100", dot: "bg-green-600" },
                  safety: { bg: "bg-blue-100", dot: "bg-blue-600" },
                  analysis: { bg: "bg-purple-100", dot: "bg-purple-600" },
                  market: { bg: "bg-amber-100", dot: "bg-amber-600" },
                };
                const colors = categoryColors[item.category];

                return (
                  <motion.div key={item.id} layout className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full ${colors.bg} flex-shrink-0 mt-1`}>
                      {item.completed ? (
                        <CheckCircle size={16} className={`text-${colors.dot}`} />
                      ) : item.id === "4" && tokenLoading ? (
                        <Loader size={16} className={`text-${colors.dot} animate-spin`} />
                      ) : item.id === "3" && aiLoading ? (
                        <Loader size={16} className={`text-${colors.dot} animate-spin`} />
                      ) : (
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-slate-200 space-y-2">
            <button
              onClick={() => navigate(`/manage-project/${id}/checklist`)}
              className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm"
            >
              View Checklist
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition text-sm"
            >
              Export Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 w-full md:ml-80">
        <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-10 sm:px-6 lg:pt-14">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/manage-project")}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
              >
                <Menu size={20} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition px-3 gap-2" 
                title="Export as PDF"
              >
                <Download size={16} />
                <span className="text-xs hidden sm:inline">Export</span>
              </button>
              {/* <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition px-3"
              >
                <Edit size={16} />
              </button> */}
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 transition px-3"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Main Project Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-8">
              <div className="space-y-6">
                {/* Title Section */}
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700 mb-4 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    Project Details
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900">
                    {project.profile.isPrelaunch ? "Pre-launch Project" : "Token Analysis"}
                  </h1>
                  {project.profile.tokenAddress && !project.profile.isPrelaunch && (
                    <div className="mt-3 flex items-center gap-2">
                      <p className="font-mono text-slate-600 text-sm">{truncateAddress(project.profile.tokenAddress, 12)}</p>
                      <button
                        onClick={handleCopyCA}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                        title="Copy contract address"
                      >
                        {copiedCA ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Risk & Status */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200">
                  {project.snapshot && (
                    <div className={`rounded-xl border px-4 py-3 ${
                      project.snapshot.riskBaseline === "Low"
                        ? "border-green-300 bg-green-50"
                        : project.snapshot.riskBaseline === "Moderate"
                        ? "border-yellow-300 bg-yellow-50"
                        : project.snapshot.riskBaseline === "Elevated"
                        ? "border-orange-300 bg-orange-50"
                        : "border-red-300 bg-red-50"
                    }`}>
                      <p className={`text-xs font-semibold uppercase ${
                        project.snapshot.riskBaseline === "Low"
                          ? "text-green-700"
                          : project.snapshot.riskBaseline === "Moderate"
                          ? "text-yellow-700"
                          : project.snapshot.riskBaseline === "Elevated"
                          ? "text-orange-700"
                          : "text-red-700"
                      }`}>Risk Level</p>
                      <p className={`mt-1 text-lg font-bold ${
                        project.snapshot.riskBaseline === "Low"
                          ? "text-green-700"
                          : project.snapshot.riskBaseline === "Moderate"
                          ? "text-yellow-700"
                          : project.snapshot.riskBaseline === "Elevated"
                          ? "text-orange-700"
                          : "text-red-700"
                      }`}>{project.snapshot.riskBaseline}</p>
                    </div>
                  )}
                  <div className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase text-blue-700">Created</p>
                    <p className="mt-1 font-mono text-sm text-blue-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Configuration */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Token Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Stage</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                      {project.profile.stage || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Intent</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                      {project.profile.intent || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Mechanics</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Launch Platform</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                      {project.profile.launchPlatform || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Launch Type</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                      {project.profile.launchType || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category & Wallets */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Additional Info</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Category</p>
                  <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 capitalize font-medium">
                    {project.profile.category || "Not specified"}
                  </p>
                </div>
                {project.profile.devWallet && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Dev Wallet</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 truncate">
                      {project.profile.devWallet}
                    </p>
                  </div>
                )}
                {project.profile.marketingWallet && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Marketing Wallet</p>
                    <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-xs text-slate-900 truncate">
                      {project.profile.marketingWallet}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Analysis */}
            {project.snapshot && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Risk Assessment</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800 mb-3">Primary Failure Modes:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.snapshot.primaryFailureModes.map((mode) => (
                        <span
                          key={mode}
                          className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs text-orange-700 font-medium"
                        >
                          <AlertCircle size={12} />
                          {mode}
                        </span>
                      ))}
                    </div>
                  </div>
                  {project.snapshot.nextPrompt && (
                    <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 text-sm text-blue-900 font-medium">
                      {project.snapshot.nextPrompt}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Token Metrics */}
            {tokenMetrics && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Token Metrics</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600 uppercase">Name</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{tokenMetrics.name}</p>
                    <p className="text-sm text-slate-600">{tokenMetrics.symbol}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600 uppercase">Price</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{tokenMetrics.price || "—"}</p>
                    <p className="text-sm text-slate-600">Current value</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600 uppercase">Market Cap</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(tokenMetrics.marketCap)}</p>
                    <p className="text-sm text-slate-600">Total value</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600 uppercase">Liquidity</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(tokenMetrics.liquidity)}</p>
                    <p className="text-sm text-slate-600">Available funds</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-600 uppercase">24h Volume</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(tokenMetrics.volume24h)}</p>
                    <p className="text-sm text-slate-600">Trading volume</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 col-span-1 md:col-span-2">
                    <p className="text-xs font-semibold text-slate-600 uppercase">Chain</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{tokenMetrics.chain}</p>
                    <p className="text-sm text-slate-600">Network</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis for Token */}
            {(aiAnalysis || aiLoading) && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">AI Recommendations</h2>
                </div>
                
                {aiLoading ? (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Loader size={18} className="animate-spin" />
                    <span>Analyzing token data...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Risk Assessment</p>
                      <p className="text-lg font-bold text-blue-900">{aiAnalysis.riskLevel}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-2">Summary</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{aiAnalysis.summary}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-3">Key Recommendations</p>
                      <ul className="space-y-2">
                        {aiAnalysis.keyPoints && aiAnalysis.keyPoints.slice(0, 4).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {aiAnalysis.recommendation && (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-xs font-semibold text-green-700 uppercase mb-1">Recommendation</p>
                        <p className="text-sm font-bold text-green-900">{aiAnalysis.recommendation}</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* AI Diagnosis */}
            {project.aiDiagnosis && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Project Diagnosis</h2>
                <div className="space-y-4">
                  <p className="text-slate-800">{project.aiDiagnosis.summary}</p>
                  {project.aiDiagnosis.riskFactors.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-3">Risk Factors:</p>
                      <ul className="space-y-2">
                        {project.aiDiagnosis.riskFactors.map((factor) => (
                          <li key={factor} className="flex items-start gap-2 text-sm text-slate-700">
                            <AlertCircle size={14} className="mt-1 flex-shrink-0 text-red-600" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.aiDiagnosis.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-3">Recommendations:</p>
                      <ul className="space-y-2">
                        {project.aiDiagnosis.recommendations.map((rec) => (
                          <li key={rec} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle size={14} className="mt-1 flex-shrink-0 text-green-600" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Project?</h3>
                <p className="text-sm text-slate-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete this project? All associated data will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  handleDelete();
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
