import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const API_BASE_URL = "https://hk-pass-2.onrender.com/api";

function GameScore() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [loading, setLoading] = useState(true);

  // 每 5 秒自動更新遊戲資料
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/minigames/${gameId}/`);
        const data = await res.json();
        setGame(data);
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };
    fetchGame();
    const interval = setInterval(fetchGame, 5000);
    return () => clearInterval(interval);
  }, [gameId]);

  // 取得所有隊伍資料
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/teams/`);
        const data = await res.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  // 取得所有玩家資料
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/players/`);
        const data = await res.json();
        setPlayers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching players:", error);
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  // 當選擇的隊伍改變時，過濾出該隊伍的玩家
  useEffect(() => {
    if (selectedTeam) {
      const filtered = players.filter(player => {
        // 如果 player.team 為物件則直接使用，否則嘗試從 teams 中查找
        let playerTeamName = "";
        if (player.team && typeof player.team === 'object' && player.team.name) {
          playerTeamName = player.team.name;
        } else if (player.team) {
          const foundTeam = teams.find(t => t.id === player.team);
          if (foundTeam) {
            playerTeamName = foundTeam.name;
          }
        }
        return playerTeamName.trim().toLowerCase() === selectedTeam.trim().toLowerCase();
      });
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers([]);
    }
    setSelectedPlayer('');
  }, [selectedTeam, players, teams]);

  const handleScore = async () => {
    if (!selectedTeam || !selectedPlayer || !game) {
      alert("請選擇隊伍和玩家，並確認遊戲資料已載入。");
      return;
    }
    const player = filteredPlayers.find(p => String(p.id) === selectedPlayer);
    if (!player) {
      alert("找不到選定的玩家。");
      return;
    }
    const newChips = player.chips + game.available_chips;
    try {
      // 更新玩家籌碼
      const res = await fetch(`${API_BASE_URL}/players/${player.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chips: newChips })
      });
      if (res.ok) {
        alert("計分成功！");
        // 更新遊戲被玩次數
        const resGame = await fetch(`${API_BASE_URL}/minigames/${gameId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ play_count: game.play_count + 1 })
        });
        if (resGame.ok) {
          const updatedGame = await resGame.json();
          setGame(updatedGame);
        } else {
          alert("更新遊戲被玩次數失敗！");
        }
        // 更新本地玩家資料
        const updatedPlayer = await res.json();
        setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
      } else {
        alert("計分失敗！");
      }
    } catch (error) {
      console.error("Error updating player's chips:", error);
      alert("計分時發生錯誤！");
    }
  };

  return (
    <Container className="my-5">
      {game ? (
        <h1 className="text-center mb-4" style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "black",
          padding: "10px"
        }}>
          {game.name} 計分介面
        </h1>
      ) : (
        <h1 className="text-center mb-4">載入遊戲資料中...</h1>
      )}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="dark" />
          <p>資料加載中...</p>
        </div>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Header style={{ fontWeight: "bold" }}>
              遊戲資訊
            </Card.Header>
            <Card.Body>
              <p><strong>類別：</strong>{game?.category}</p>
              <p><strong>房間：</strong>{game?.room}</p>
              <p><strong>可得籌碼：</strong>{game?.available_chips}</p>
              <p><strong>被玩次數：</strong>{game?.play_count}</p>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header style={{ fontWeight: "bold" }}>
              選擇玩家
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group controlId="formTeamSelect">
                  <Form.Label>隊伍</Form.Label>
                  <Form.Control as="select" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                    <option value="">請選擇隊伍</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formPlayerSelect" className="mt-3">
                  <Form.Label>玩家</Form.Label>
                  <Form.Control as="select" value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)}>
                    <option value="">請選擇玩家</option>
                    {filteredPlayers.map(player => (
                      <option key={player.id} value={player.id}>{player.number} - {player.name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Button className="mt-3 w-100" variant="primary" onClick={handleScore}>
                  計分
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default GameScore;