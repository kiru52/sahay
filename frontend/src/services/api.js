const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = RAW_BASE ? `${RAW_BASE.replace(/\/+$/, '')}/api` : '/api';

export const api = {
  // Victims
  async getVictims(params = {}) {
    const query = new URLSearchParams();
    if (params.risk_level) query.append('risk_level', params.risk_level);
    if (params.district) query.append('district', params.district);
    if (params.has_alert !== undefined) query.append('has_alert', params.has_alert);
    if (params.search) query.append('search', params.search);
    
    const res = await fetch(`${API_BASE}/victims?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch victims');
    return res.json();
  },

  async getVictimDetail(id) {
    const res = await fetch(`${API_BASE}/victims/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch victim ${id}`);
    return res.json();
  },

  async getVictimTrajectory(id) {
    const res = await fetch(`${API_BASE}/victims/${id}/trajectory`);
    if (!res.ok) throw new Error(`Failed to fetch trajectory for ${id}`);
    return res.json();
  },

  async getVictimTimeline(id) {
    const res = await fetch(`${API_BASE}/victims/${id}/timeline`);
    if (!res.ok) throw new Error(`Failed to fetch timeline for ${id}`);
    return res.json();
  },

  // Checkins & AI
  async submitCheckin(payload) {
    const res = await fetch(`${API_BASE}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to submit check-in');
    return res.json();
  },

  async directAIAnalyze(payload) {
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('AI analysis failed');
    return res.json();
  },

  // Alerts
  async getAlerts(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.risk_level) query.append('risk_level', params.risk_level);
    if (params.victim_id) query.append('victim_id', params.victim_id);
    
    const res = await fetch(`${API_BASE}/alerts?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(id, payload = {}) {
    const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  },

  async resolveAlert(id, resolutionNotes) {
    const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution_notes: resolutionNotes })
    });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  // Interventions
  async recordIntervention(payload) {
    const res = await fetch(`${API_BASE}/interventions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to record intervention');
    return res.json();
  },

  async getInterventions(victimId = null) {
    const url = victimId ? `${API_BASE}/interventions?victim_id=${victimId}` : `${API_BASE}/interventions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch interventions');
    return res.json();
  },

  // Analytics
  async getOverviewAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch analytics overview');
    return res.json();
  },

  async getDistrictAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/districts`);
    if (!res.ok) throw new Error('Failed to fetch district analytics');
    return res.json();
  },

  async getModelValidation() {
    const res = await fetch(`${API_BASE}/analytics/model-validation`);
    if (!res.ok) throw new Error('Failed to fetch model validation metrics');
    return res.json();
  },

  async getAuditLogs(limit = 50) {
    const res = await fetch(`${API_BASE}/analytics/audit-logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Consent
  async getConsent(victimId) {
    const res = await fetch(`${API_BASE}/consent/${victimId}`);
    if (!res.ok) throw new Error('Failed to fetch consent');
    return res.json();
  },

  async updateConsent(victimId, payload) {
    const res = await fetch(`${API_BASE}/consent/${victimId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update consent');
    return res.json();
  }
};
