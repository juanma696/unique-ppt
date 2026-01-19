import { fetchWithRetry, urlToBase64 } from "@/utils";
import { SYSTEM_API_KEY } from "@/constants";

export async function callTextAI(prompt, systemInstruction, apiConfig) {
  const { provider, baseUrl, key, model, protocol } = apiConfig.text;

  if (provider === "custom") {
    if (protocol === "gemini") {
      const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
      const url = `${cleanBaseUrl}/models/${model}:generateContent?key=${key}`;
      const res = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction + "\n" + prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });
      return JSON.parse(res.candidates[0].content.parts[0].text);
    } else {
      const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
      const url = `${cleanBaseUrl}/chat/completions`;
      const res = await fetchWithRetry(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content:
                systemInstruction +
                "\n请只返回纯JSON格式，不要Markdown代码块。",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });
      let content = res.choices[0].message.content;
      if (content.includes("```")) {
        content = content.replace(/```json/g, "").replace(/```/g, "");
      }
      return JSON.parse(content);
    }
  } else {
    const res = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${SYSTEM_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction + "\n" + prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
    return JSON.parse(res.candidates[0].content.parts[0].text);
  }
}

export async function callImageAI(prompt, apiConfig) {
  const { provider, baseUrl, key, model, protocol } = apiConfig.image;
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

  if (provider === "custom") {
    if (protocol === "openai_image") {
      const url = `${cleanBaseUrl}/images/generations`;
      const res = await fetchWithRetry(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model,
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
          }),
        },
        2,
        8000,
      );
      return `data:image/png;base64,${res.data[0].b64_json}`;
    } else if (protocol === "openai_chat") {
      const url = `${cleanBaseUrl}/chat/completions`;
      const res = await fetchWithRetry(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: `Draw this: ${prompt}` }],
          }),
        },
        2,
        10000,
      );
      const content = res.choices[0].message.content;
      const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
      const urlMatch = content.match(/https?:\/\/[^\s)]+/);
      const targetUrl = mdMatch ? mdMatch[1] : urlMatch ? urlMatch[0] : null;
      if (!targetUrl) throw new Error("无法从回复中提取图片链接");
      return await urlToBase64(targetUrl);
    } else if (protocol === "gemini_content") {
      const url = `${cleanBaseUrl}/models/${model}:generateContent?key=${key}`;
      const res = await fetchWithRetry(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
        2,
        8000,
      );
      const part = res.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData,
      );
      if (part?.inlineData?.data) {
        const { mimeType, data } = part.inlineData;
        if (!data || data.length < 100) {
          throw new Error("Gemini返回的图片数据不完整");
        }
        return `data:${mimeType || "image/png"};base64,${data}`;
      }
      throw new Error("Gemini未返回Base64数据");
    } else {
      throw new Error(`不支持的图片协议: ${protocol}`);
    }
  } else {
    const res = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${SYSTEM_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: prompt + ", 4k resolution, high quality" }],
          parameters: { sampleCount: 1, aspectRatio: "16:9" },
        }),
      },
      2,
      6000,
    );
    return `data:image/png;base64,${res.predictions[0].bytesBase64Encoded}`;
  }
}
