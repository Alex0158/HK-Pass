const API_BASE_URL = "/api"

export const fetchGames = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/minigames/`)
    const data = await res.json()
    return data.filter((game) => {
      return game.is_displayed === true || game.is_displayed === "true" || !!game.is_displayed
    })
  } catch (error) {
    console.error("Error fetching games:", error)
    throw error
  }
}

