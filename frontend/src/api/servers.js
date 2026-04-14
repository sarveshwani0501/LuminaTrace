import api from './client';

export const serversApi = {
  listServers: (projectId) => {
    return api.get(`/servers?projectId=${projectId}`);
  },

  getServerDetails: (projectId, serverId) => {
    return api.get(`/servers/${serverId}?projectId=${projectId}`);
  }
};
