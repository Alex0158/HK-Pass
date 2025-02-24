// src/components/GameScore.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function GameScore() {
  // 從 URL 取得 gameId
  const { gameId } = useParams();

  // 狀態：遊戲資料、所有隊伍、所有玩家
  const [game, setGame] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  // 狀態：選擇的隊伍與玩家
  const [selectedTeam, setSelectedTeam] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');

  // 取得遊戲詳細資料
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/minigames/${gameId}/`);
        const data = await res.json();
        setGame(data);
      } catch (error) {
        console.error("Error fetching game data:", error);
      }
    };
    fetchGame();
  }, [gameId]);

  // 取得所有隊伍資料
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/teams/');
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
        const res = await fetch('/api/players/');
        const data = await res.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };
    fetchPlayers();
  }, []);

  // 當選擇的隊伍改變時，過濾出該隊伍的玩家
  useEffect(() => {
    if (selectedTeam) {
      const filtered = players.filter(player => {
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

  // 處理「計分」按鈕點擊：更新玩家的籌碼數值，同時增加該遊戲的 play_count
  const handleScore = async () => {
    if (!selectedTeam || !selectedPlayer || !game) {
      alert("請選擇隊伍和玩家，並確認遊戲資料已載入。");
      return;
    }
    // 找出選定的玩家
    const player = filteredPlayers.find(p => String(p.id) === selectedPlayer);
    if (!player) {
      alert("找不到選定的玩家。");
      return;
    }
    // 計算新的籌碼數：原有籌碼 + 遊戲的 available_chips
    const newChips = player.chips + game.available_chips;
    try {
      // 更新玩家的籌碼數
      const res = await fetch(`/api/players/${player.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chips: newChips })
      });
      if (res.ok) {
        alert("計分成功！");
        // 更新遊戲的被玩次數： play_count 加 1
        const resGame = await fetch(`/api/minigames/${gameId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ play_count: game.play_count + 1 })
        });
        if (resGame.ok) {
          // 重新取得更新後的遊戲資料
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
      <h1 className="text-center mb-4">遊戲計分介面</h1>
      {game ? (
        <Card className="mb-4">
          <Card.Header>遊戲資訊</Card.Header>
          <Card.Body>
            <p><strong>遊戲名稱：</strong>{game.name}</p>
            <p><strong>遊戲類別：</strong>{game.category}</p>
            <p><strong>房間：</strong>{game.room}</p>
            <p><strong>可得籌碼：</strong>{game.available_chips}</p>
            <p><strong>被玩次數：</strong>{game.play_count}</p>
          </Card.Body>
        </Card>
      ) : (
        <p>載入中...</p>
      )}
      <Card className="mb-4">
        <Card.Header>選擇玩家</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group as={Row} className="mb-3" controlId="formTeamSelect">
              <Form.Label column sm={3}>
                隊伍
              </Form.Label>
              <Col sm={9}>
                <Form.Control as="select" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                  <option value="">請選擇隊伍</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formPlayerSelect">
              <Form.Label column sm={3}>
                玩家
              </Form.Label>
              <Col sm={9}>
                <Form.Control as="select" value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} disabled={!selectedTeam}>
                  <option value="">請選擇玩家</option>
                  {filteredPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.number} - {player.name}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
            <Row className="justify-content-center">
              <Col xs="auto">
                <Button variant="primary" size="lg" onClick={handleScore}>
                  計分
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default GameScore;