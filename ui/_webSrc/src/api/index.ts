/**
 * basic server health
 */
export const HEALTH_PING_INTERVAL = 5000; // 5 seconds
export const healthPing = async () => {
  let response = await fetch('/ping')
  const data = await response.json();
  return data;
}

/**
 * the local list of modifications
 */
export const loadModifications = async () => {
  const response = await fetch('/modifiers.json')
  const data = await response.text();
  return data;
}
