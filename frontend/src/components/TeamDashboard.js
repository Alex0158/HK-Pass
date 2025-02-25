// src/components/TeamDashboard.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Table, Container, Row, Col } from 'react-bootstrap';

// 從環境變數中讀取 API_BASE_URL，若未設定則默認為 /api
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

function TeamDashboard() {
  // 表單輸入的 state
  const [attackerTeam, setAttackerTeam] = useState('');
  const [attackerNumber, setAttackerNumber] = useState('');
  const [targetTeam, setTargetTeam] = useState('');

  // 隊伍與玩家資料
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  // 排序方式：'' / 'score' / 'attacked'
  const [sortType, setSortType] = useState('');

  // 初始化取得隊伍與玩家資料
  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/teams/`);
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/players/`);
      const data = await res.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // 處理攻擊動作：此處只是模擬更新，實際上你應該用 API 請求更新後端資料
  const handleAttack = async () => {
    if (!attackerTeam || !attackerNumber || !targetTeam) {
      alert("請輸入攻擊者隊伍、攻擊者號碼以及被攻擊隊伍");
      return;
    }
    if (attackerTeam === targetTeam) {
      alert("攻擊者隊伍與被攻擊隊伍不能相同！");
      return;
    }

    // 模擬更新：更新隊伍分數、被攻擊次數，以及攻擊者玩家的個人分
    const updatedTeams = teams.map(team => {
      if (String(team.number) === attackerTeam) {
        return { ...team, score: team.score + 2 };
      } else if (String(team.number) === targetTeam) {
        return { ...team, attacked_count: team.attacked_count + 1 };
      }
      return team;
    });

    const updatedPlayers = players.map(player => {
      if (
        String(player.number) === attackerNumber &&
        String(player.team) === attackerTeam
      ) {
        return { ...player, personal_score: player.personal_score + 1 };
      }
      return player;
    });

    setTeams(updatedTeams);
    setPlayers(updatedPlayers);
    alert("攻擊計分已更新！");
  };

  // 依排序方式排序隊伍資料
  const sortedTeams = [...teams];
  if (sortType === 'score') {
    sortedTeams.sort((a, b) => b.score - a.score);
  } else if (sortType === 'attacked') {
    sortedTeams.sort((a, b) => b.attacked_count - a.attacked_count);
  }

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">隊伍作戰面板</h1>

      {/* 攻擊操作區域 */}
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Group controlId="formAttackerTeam">
                  <Form.Label>攻擊者隊伍</Form.Label>
                  <Form.Control
                    as="select"
                    value={attackerTeam}
                    onChange={e => setAttackerTeam(e.target.value)}
                  >
                    <option value="">選擇隊伍</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.number}>
                        隊伍 {team.number}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="formAttackerNumber">
                  <Form.Label>攻擊者號碼</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="輸入號碼"
                    value={attackerNumber}
                    onChange={e => setAttackerNumber(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="formTargetTeam">
                  <Form.Label>被攻擊隊伍</Form.Label>
                  <Form.Control
                    as="select"
                    value={targetTeam}
                    onChange={e => setTargetTeam(e.target.value)}
                  >
                    <option value="">選擇隊伍</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.number}>
                        隊伍 {team.number}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3} className="text-center">
                <Button
                  variant="danger"
                  onClick={handleAttack}
                  style={{
                    borderRadius: "50%",
                    width: "100px",
                    height: "100px",
                    fontSize: "1.2rem"
                  }}
                >
                  攻擊
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* 排序按鈕 */}
      <Row className="mb-3">
        <Col md={6}>
          <Button variant="primary" onClick={() => setSortType('score')}>
            按分數排名
          </Button>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="secondary" onClick={() => setSortType('attacked')}>
            按被攻擊次數排名
          </Button>
        </Col>
      </Row>

      {/* 隊伍資料展示 */}
      {sortedTeams.map(team => (
        <Card key={team.id} className="mb-4">
          <Card.Header>
            <h4>隊伍 {team.number}</h4>
            <p>
              分數: {team.score} | 被攻擊次數: {team.attacked_count}
            </p>
          </Card.Header>
          <Card.Body>
            <h5>隊伍成員</h5>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>名字</th>
                  <th>號碼</th>
                  <th>個人分</th>
                  <th>籌碼</th>
                  <th>完成小遊戲數量</th>
                </tr>
              </thead>
              <tbody>
                {players
                  .filter(player => String(player.team) === String(team.number))
                  .map(player => (
                    <tr key={player.id}>
                      <td>{player.name}</td>
                      <td>{player.number}</td>
                      <td>{player.personal_score}</td>
                      <td>{player.chips}</td>
                      <td>{player.completed_minigame_count}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default TeamDashboard;