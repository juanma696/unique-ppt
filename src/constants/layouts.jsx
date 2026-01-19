import { CreditCard, Sidebar, Layout, AlignLeft } from "lucide-react";

export const LAYOUTS = {
  COVER: { id: "cover", name: "封面大片", icon: <CreditCard size={14} /> },
  SPLIT_RIGHT: {
    id: "split_right",
    name: "右侧图文",
    icon: <Sidebar size={14} />,
  },
  SPLIT_LEFT: {
    id: "split_left",
    name: "左侧图文",
    icon: <Sidebar className="rotate-180" size={14} />,
  },
  GLASS: { id: "glass", name: "磨砂浮层", icon: <Layout size={14} /> },
  MINIMAL: { id: "minimal", name: "极简杂志", icon: <AlignLeft size={14} /> },
};

export const DEFAULT_API_CONFIG = {
  text: {
    provider: "system",
    protocol: "openai",
    baseUrl: "https://api.openai.com/v1",
    key: "",
    model: "gpt-4o",
  },
  image: {
    provider: "system",
    protocol: "openai_image",
    baseUrl: "https://api.openai.com/v1",
    key: "",
    model: "dall-e-3",
  },
};
