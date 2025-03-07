import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const API_BASE_URL = "https://hk-pass-2.onrender.com/api";

// 輔助函式：根據隊伍名稱從 players 中過濾出該隊伍的玩家
const getPlayersForTeam = (teamName, players, teams) => {
  if (!teamName) return [];
  return players.filter(player => {
    let playerTeamName = "";
    if (player.team && typeof player.team === 'object' && player.team.name) {
      playerTeamName = player.team.name;
    } else if (player.team) {
      const foundTeam = teams.find(t => t.id === player.team);
      if (foundTeam) {
        playerTeamName = foundTeam.name;
      }
    }
    return playerTeamName.trim().toLowerCase() === teamName.trim().toLowerCase();
  });
};

function GameScore() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  // 建立 10 行選擇資料，初始值皆為空
  const [selectionRows, setSelectionRows] = useState(
    Array.from({ length: 10 }, () => ({ selectedTeam: "", selectedPlayer: "" }))
  );
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
    const interval = setInterval(fetchGame, 1000);
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

  // 當某一行選擇的隊伍改變時，清空該行的選定玩家
  const updateSelection = (index, field, value) => {
    setSelectionRows(prev => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      if (field === "selectedTeam") {
        newRows[index].selectedPlayer = "";
      }
      return newRows;
    });
  };

  // 定義一個刷新資料的函式
  const refreshData = async () => {
    try {
      const resGame = await fetch(`${API_BASE_URL}/minigames/${gameId}/`);
      const updatedGame = await resGame.json();
      setGame(updatedGame);

      const resPlayers = await fetch(`${API_BASE_URL}/players/`);
      const updatedPlayers = await resPlayers.json();
      setPlayers(updatedPlayers);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // 處理計分：遍歷所有有效行（隊伍與玩家均有填寫），統一一次提交
  const handleScoreAll = async () => {
    if (!game) {
      alert("遊戲資料尚未載入");
      return;
    }
    // 有效的選擇行：該行的 selectedTeam 與 selectedPlayer 均有值
    const validRows = selectionRows.filter(row => row.selectedTeam && row.selectedPlayer);
    if (validRows.length === 0) {
      alert("請至少選擇一位攻擊者");
      return;
    }

    try {
      // 更新遊戲被玩次數：原有 play_count 加上有效行數
      await fetch(`${API_BASE_URL}/minigames/${gameId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ play_count: game.play_count + validRows.length })
      });

      // 更新目標隊伍的被攻擊次數：累計有效行數 × attacked_increment（假設 attacked_increment 存在於遊戲資料中）
      const newAttackedCount = game.attacked_count + validRows.length * Number(game.attacked_increment || 1);
      await fetch(`${API_BASE_URL}/minigames/${gameId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacked_count: newAttackedCount })
      });

      // 逐行處理有效選擇
      for (let row of validRows) {
        // 從所有玩家中找出該行所選隊伍的玩家
        const playersForRow = getPlayersForTeam(row.selectedTeam, players, teams);
        // 以玩家 id（下拉選單的 value 為玩家 id）找出攻擊者
        const attackerPlayer = playersForRow.find(p => String(p.id) === row.selectedPlayer);
        if (attackerPlayer) {
          const newChips = attackerPlayer.chips + Number(game.available_chips);
          await fetch(`${API_BASE_URL}/players/${attackerPlayer.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              chips: newChips, 
              completed_minigame_count: attackerPlayer.completed_minigame_count + 1 
            })
          });
        } else {
          console.error("找不到攻擊者玩家，行資料：", row);
        }
      }

      alert("計分成功！");
      // 重置所有選擇
      setSelectionRows(Array.from({ length: 10 }, () => ({ selectedTeam: "", selectedPlayer: "" })));
      // 刷新資料
      await refreshData();
    } catch (error) {
      console.error("Error updating score data:", error);
      alert("計分時發生錯誤！");
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="dark" />
        <p>資料加載中...</p>
      </Container>
    );
  }

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

      <Card className="mb-4">
        <Card.Header style={{ fontWeight: "bold" }}>遊戲資訊</Card.Header>
        <Card.Body>
          <p><strong>類別：</strong>{game?.category}</p>
          <p><strong>房間：</strong>{game?.room}</p>
          <p><strong>可得籌碼：</strong>{game?.available_chips}</p>
          <p><strong>被玩次數：</strong>{game?.play_count}</p>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header style={{ fontWeight: "bold" }}>選擇攻擊者（勝者Only）</Card.Header>
        <Card.Body>
          {/* 將計分按鈕放在頂部 */}
          <Row className="mb-4">
            <Col className="text-center">
              <Button variant="primary" onClick={handleScoreAll} size="sm">
                計分
              </Button>
            </Col>
          </Row>
          {selectionRows.map((row, index) => {
            const playersForRow = getPlayersForTeam(row.selectedTeam, players, teams);
            return (
              <Form key={index} className="mb-2">
                <Row className="align-items-end">
                  <Col md={4}>
                    <Form.Group controlId={`attackerTeam-${index}`}>
                      <Form.Label style={{ fontSize: "0.7rem" }}>隊伍</Form.Label>
                      <Form.Control
                        as="select"
                        value={row.selectedTeam}
                        onChange={(e) => updateSelection(index, "selectedTeam", e.target.value)}
                        size="sm"
                        style={{ fontSize: "0.7rem" }}
                      >
                        <option value="">請選擇隊伍</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId={`attackerPlayer-${index}`}>
                      <Form.Label style={{ fontSize: "0.7rem" }}>玩家</Form.Label>
                      <Form.Control
                        as="select"
                        value={row.selectedPlayer}
                        onChange={(e) => updateSelection(index, "selectedPlayer", e.target.value)}
                        size="sm"
                        style={{ fontSize: "0.7rem" }}
                        disabled={!row.selectedTeam || playersForRow.length === 0}
                      >
                        <option value="">請選擇玩家</option>
                        {playersForRow.map(player => (
                          <option key={player.id} value={player.id}>
                            {player.name} ({player.number})
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            );
          })}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default GameScore;
