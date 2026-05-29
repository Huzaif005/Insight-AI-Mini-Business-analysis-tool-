const API_ROOT = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Generic HTTP methods
export async function get(path) {
  try {
    const res = await fetch(`${API_ROOT}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('API GET error:', error);
    throw error;
  }
}

export async function post(path, body) {
  try {
    const res = await fetch(`${API_ROOT}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('API POST error:', error);
    throw error;
  }
}

// Health check
export async function healthCheck() {
  return get('/health');
}

// Upload endpoint
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(`${API_ROOT}/api/upload/`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Analysis endpoints
export async function getCharts() {
  return get('/api/analysis/charts');
}

// Prediction endpoint
export async function predict(data) {
  return post('/api/predictions/', data);
}

// Insights endpoint
export async function getInsights() {
  return get('/api/insights/');
}

// Reports endpoint
export async function getReports() {
  return get('/api/reports/');
}

// Chatbot endpoint
export async function sendMessage(message) {
  return post('/api/chat/', { message });
}

