export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWithRetry(
  url,
  options,
  retries = 3,
  delayMs = 2000,
) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) throw new Error("RATE_LIMIT");

      const text = await response.text();

      if (!response.ok) {
        console.error("API Error Detail:", text);
        throw new Error(`HTTP_${response.status}: ${text.slice(0, 100)}`);
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        if (
          text.trim().toLowerCase().startsWith("<!doctype") ||
          text.trim().toLowerCase().startsWith("<html")
        ) {
          console.error("Received HTML instead of JSON:", text.slice(0, 200));
          throw new Error(
            "API配置错误: 服务器返回了HTML而非JSON (请检查Base URL)",
          );
        }
        throw new Error("Invalid JSON response");
      }
    } catch (err) {
      if (i === retries - 1) throw err;
      const waitTime =
        err.message === "RATE_LIMIT" ? 10000 : delayMs * Math.pow(2, i);
      console.warn(
        `Retry ${i + 1}/${retries} after ${waitTime}ms: ${err.message}`,
      );
      await sleep(waitTime);
    }
  }
}

/**
 * 并发控制器 - 限制同时执行的 Promise 数量
 * @param {Array} items - 待处理的项目数组
 * @param {Function} fn - 处理函数 (item, index) => Promise
 * @param {number} concurrency - 最大并发数
 * @returns {Promise<Array>} - 所有结果 (包含 {status, value/reason})
 */
export const concurrentLimit = async (items, fn, concurrency = 5) => {
  const results = new Array(items.length);
  let currentIndex = 0;

  const worker = async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      try {
        results[index] = {
          status: "fulfilled",
          value: await fn(items[index], index),
        };
      } catch (error) {
        results[index] = { status: "rejected", reason: error };
      }
    }
  };

  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);
  return results;
};

export const urlToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("CORS/Network Error:", e);
    throw new Error("无法下载图片(CORS限制)，建议使用Base64返回模式");
  }
};
