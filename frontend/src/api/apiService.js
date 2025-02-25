const API_BASE_URL = "/api";

async function fetchData(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function updateData(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export const fetchTeam = (teamName) =>
  fetchData(`/teams/?name=${encodeURIComponent(teamName)}`).then((data) => data[0]);

export const fetchMembers = (teamId) => fetchData(`/players/?team=${teamId}`);

export const fetchAllTeams = () => fetchData("/teams/");

export const fetchAllPlayers = () => fetchData("/players/");

export const fetchCommonSettings = () =>
  fetchData("/settings/").then((data) => data[0]);

// 新增 fetchGames 與 updateGame
export const fetchGames = () => fetchData("/minigames/");

export const updateGame = (gameId, data) =>
  updateData(`/minigames/${gameId}/`, data);

export const updateTeam = (teamId, data) =>
  updateData(`/teams/${teamId}/`, data);

export const updatePlayer = (playerId, data) =>
  updateData(`/players/${playerId}/`, data);