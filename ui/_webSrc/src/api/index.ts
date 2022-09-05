export const HEALTH_PING_INTERVAL = 5000; // 5 seconds
export const healthPing = async () => {
  let response = await fetch('/ping')
  const data = await response.json();
  return data;
}
