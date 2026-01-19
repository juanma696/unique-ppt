import { useState, useEffect } from "react";
import {
  Settings,
  X,
  Save,
  FileText,
  ImageIcon,
  MessageSquare,
  Globe,
  Loader2,
  Wifi,
  WifiOff,
  Key,
  Server,
} from "lucide-react";

export function SettingsModal({ isOpen, onClose, config, onSave, isDark }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [testing, setTesting] = useState({ text: false, image: false });
  const [testResults, setTestResults] = useState({ text: null, image: null });

  useEffect(() => {
    setLocalConfig(config);
    setTestResults({ text: null, image: null });
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleChange = (section, field, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setTestResults((prev) => ({ ...prev, [section]: null }));
  };

  const handleTest = async (section) => {
    setTesting((prev) => ({ ...prev, [section]: true }));
    setTestResults((prev) => ({ ...prev, [section]: null }));

    const cfg = localConfig[section];
    const baseUrl = cfg.baseUrl.replace(/\/+$/, "");
    const protocol = cfg.protocol || "openai";

    try {
      if (!cfg.key) throw new Error("API Key 不能为空");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let res;

      if (protocol === "gemini" || protocol === "gemini_content") {
        const url = `${baseUrl}/models/${cfg.model || "gemini-1.5-flash"}:generateContent?key=${cfg.key}`;
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] }),
          signal: controller.signal,
        });
      } else {
        const url = `${baseUrl}/chat/completions`;
        res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cfg.key}`,
          },
          body: JSON.stringify({
            model: cfg.model || "gpt-3.5-turbo",
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 1,
          }),
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
          const text = await res.text();
          if (text.includes("<!DOCTYPE") || text.includes("<html")) {
            throw new Error("URL配置错误: 返回了HTML页面 (请检查接口地址)");
          }
        }
        setTestResults((prev) => ({
          ...prev,
          [section]: { success: true, msg: "连接成功" },
        }));
      } else {
        if (res.status === 401 || res.status === 403) {
          throw new Error(`认证失败 (HTTP ${res.status})`);
        } else if (res.status === 404) {
          throw new Error(`路径不存在 (HTTP 404) - 请检查接口地址或模型名`);
        } else {
          setTestResults((prev) => ({
            ...prev,
            [section]: { success: true, msg: `验证通过 (HTTP ${res.status})` },
          }));
        }
      }
    } catch (e) {
      setTestResults((prev) => ({
        ...prev,
        [section]: { success: false, msg: e.message },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [section]: false }));
    }
  };

  const renderTestResult = (section) => {
    const result = testResults[section];
    if (testing[section])
      return (
        <div
          className={`flex items-center gap-2 text-xs mt-2 font-medium ${isDark ? "text-teal-400" : "text-teal-600"}`}
        >
          <Loader2 size={12} className="animate-spin" /> 正在测试连接...
        </div>
      );
    if (result)
      return (
        <div
          className={`flex items-center gap-2 text-xs mt-2 font-medium ${result.success ? (isDark ? "text-emerald-400" : "text-emerald-600") : isDark ? "text-rose-400" : "text-rose-500"}`}
        >
          {result.success ? <Wifi size={14} /> : <WifiOff size={14} />}{" "}
          {result.msg}
        </div>
      );
    return null;
  };

  const modalBg = isDark ? "bg-slate-900" : "bg-white";
  const headerBg = isDark ? "bg-slate-800/50" : "bg-slate-50/50";
  const borderColor = isDark ? "border-slate-700" : "border-slate-200";
  const textColor = isDark ? "text-slate-100" : "text-slate-800";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800" : "bg-slate-50";
  const inputBg = isDark
    ? "bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500"
    : "bg-white border-slate-200 text-slate-700 placeholder:text-slate-300";
  const buttonBg = isDark
    ? "bg-slate-100 text-slate-800"
    : "bg-slate-800 text-white";
  const tabActiveBg = isDark
    ? "bg-slate-700 text-teal-400"
    : "bg-white text-teal-600";
  const tabInactiveBg = isDark
    ? "text-slate-400 hover:text-slate-200"
    : "text-slate-500 hover:text-slate-700";
  const protocolActiveBg = isDark
    ? "bg-slate-700 border-teal-500 text-teal-400"
    : "bg-white border-teal-500 text-teal-700";
  const protocolInactiveBg = isDark
    ? "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300";

  return (
    <div
      className={`fixed inset-0 ${isDark ? "bg-black/70" : "bg-slate-900/40"} backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200`}
    >
      <div
        className={`${modalBg} border ${borderColor} w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
      >
        <div
          className={`px-6 py-5 border-b ${borderColor} flex justify-between items-center ${headerBg}`}
        >
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${textColor}`}
          >
            <Settings className="text-teal-500" size={20} /> 设置
          </h2>
          <button
            onClick={onClose}
            className={`${textSecondary} hover:${textColor} p-2 rounded-lg ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3
                className={`text-base font-bold ${textColor} flex items-center gap-2`}
              >
                <FileText size={18} className="text-teal-500" /> 文本模型
              </h3>
              <div
                className={`flex ${isDark ? "bg-slate-800" : "bg-slate-100"} rounded-lg p-1`}
              >
                {["system", "custom"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleChange("text", "provider", type)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${localConfig.text.provider === type ? tabActiveBg : tabInactiveBg}`}
                  >
                    {type === "system" ? "内置" : "自定义"}
                  </button>
                ))}
              </div>
            </div>

            {localConfig.text.provider === "custom" && (
              <div
                className={`${cardBg} p-6 rounded-2xl space-y-6 border ${borderColor} animate-in slide-in-from-top-2`}
              >
                <div className="space-y-3">
                  <label
                    className={`text-xs ${textSecondary} font-bold uppercase tracking-wider`}
                  >
                    接口协议
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        id: "openai",
                        name: "OpenAI 兼容",
                        icon: <MessageSquare size={16} />,
                        desc: "GPT-4、Claude 等通用接口",
                      },
                      {
                        id: "gemini",
                        name: "Google Gemini",
                        icon: <Globe size={16} />,
                        desc: "官方 Gemini API",
                      },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleChange("text", "protocol", p.id)}
                        className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border text-sm transition-all ${localConfig.text.protocol === p.id ? protocolActiveBg : protocolInactiveBg}`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          {p.icon} {p.name}
                        </div>
                        <span
                          className={`text-[10px] ${textSecondary} font-normal`}
                        >
                          {p.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label
                      className={`text-xs ${textSecondary} font-bold uppercase tracking-wider flex items-center gap-1`}
                    >
                      <Server size={12} /> 接口地址
                    </label>
                    <input
                      value={localConfig.text.baseUrl}
                      onChange={(e) =>
                        handleChange("text", "baseUrl", e.target.value)
                      }
                      placeholder={
                        localConfig.text.protocol === "gemini"
                          ? "https://generativelanguage.googleapis.com/v1beta"
                          : "https://api.openai.com/v1"
                      }
                      className={`w-full ${inputBg} border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`text-xs ${textSecondary} font-bold uppercase tracking-wider`}
                    >
                      模型名称
                    </label>
                    <input
                      value={localConfig.text.model}
                      onChange={(e) =>
                        handleChange("text", "model", e.target.value)
                      }
                      placeholder={
                        localConfig.text.protocol === "gemini"
                          ? "gemini-2.0-flash"
                          : "gpt-4-turbo"
                      }
                      className={`w-full ${inputBg} border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className={`text-xs ${textSecondary} font-bold uppercase tracking-wider flex items-center gap-1`}
                  >
                    <Key size={12} /> API 密钥
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={localConfig.text.key}
                      onChange={(e) =>
                        handleChange("text", "key", e.target.value)
                      }
                      placeholder="sk-..."
                      className={`flex-1 ${inputBg} border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all font-mono`}
                    />
                    <button
                      onClick={() => handleTest("text")}
                      className={`${buttonBg} hover:opacity-90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm`}
                    >
                      测试
                    </button>
                  </div>
                  {renderTestResult("text")}
                </div>
              </div>
            )}
          </div>

          <div
            className={`h-px ${isDark ? "bg-slate-700" : "bg-slate-100"} w-full`}
          ></div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3
                className={`text-base font-bold ${textColor} flex items-center gap-2`}
              >
                <ImageIcon size={18} className="text-teal-500" /> 图像模型
              </h3>
              <div
                className={`flex ${isDark ? "bg-slate-800" : "bg-slate-100"} rounded-lg p-1`}
              >
                {["system", "custom"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleChange("image", "provider", type)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${localConfig.image.provider === type ? tabActiveBg : tabInactiveBg}`}
                  >
                    {type === "system" ? "内置" : "自定义"}
                  </button>
                ))}
              </div>
            </div>

            {localConfig.image.provider === "custom" && (
              <div
                className={`${cardBg} p-6 rounded-2xl space-y-6 border ${borderColor} animate-in slide-in-from-top-2`}
              >
                <div className="space-y-3">
                  <label
                    className={`text-xs ${textSecondary} font-bold uppercase tracking-wider`}
                  >
                    接口协议
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "openai_image",
                        name: "DALL-E",
                        icon: <ImageIcon size={14} />,
                      },
                      {
                        id: "openai_chat",
                        name: "OpenAI Chat",
                        icon: <MessageSquare size={14} />,
                      },
                      {
                        id: "gemini_content",
                        name: "Gemini",
                        icon: <Globe size={14} />,
                      },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleChange("image", "protocol", p.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${localConfig.image.protocol === p.id ? protocolActiveBg : protocolInactiveBg}`}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm">
                          {p.icon} {p.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label
                      className={`text-xs ${textSecondary} font-bold uppercase tracking-wider flex items-center gap-1`}
                    >
                      <Server size={12} /> 接口地址
                    </label>
                    <input
                      value={localConfig.image.baseUrl}
                      onChange={(e) =>
                        handleChange("image", "baseUrl", e.target.value)
                      }
                      placeholder={
                        localConfig.image.protocol === "gemini_content"
                          ? "https://generativelanguage.googleapis.com/v1beta"
                          : "https://api.openai.com/v1"
                      }
                      className={`w-full ${inputBg} border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`text-xs ${textSecondary} font-bold uppercase tracking-wider`}
                    >
                      模型名称
                    </label>
                    <input
                      value={localConfig.image.model}
                      onChange={(e) =>
                        handleChange("image", "model", e.target.value)
                      }
                      placeholder="dall-e-3"
                      className={`w-full ${inputBg} border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className={`text-xs ${textSecondary} font-bold uppercase tracking-wider flex items-center gap-1`}
                  >
                    <Key size={12} /> API 密钥
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={localConfig.image.key}
                      onChange={(e) =>
                        handleChange("image", "key", e.target.value)
                      }
                      className={`flex-1 ${inputBg} border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all font-mono`}
                    />
                    <button
                      onClick={() => handleTest("image")}
                      className={`${buttonBg} hover:opacity-90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm`}
                    >
                      测试
                    </button>
                  </div>
                  {renderTestResult("image")}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`p-5 border-t ${borderColor} flex justify-end gap-3 ${headerBg} backdrop-blur-sm`}
        >
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl ${textSecondary} hover:${textColor} font-medium transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
          >
            取消
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-teal-500/20"
          >
            <Save size={18} /> 保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
