export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
};

