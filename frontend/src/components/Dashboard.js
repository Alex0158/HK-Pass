// src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table, Form, Button } from 'react-bootstrap';

// EditableCell component: inline editing input
function EditableCell({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(
    value !== null && value !== undefined ? value.toString() : ''
  );

  useEffect(() => {
    setTempValue(value !== null && value !== undefined ? value.toString() : '');
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') finishEditing();
  };

  const finishEditing = () => {
    setEditing(false);
    if (tempValue !== (value !== null && value !== undefined ? value.toString() : '')) {
      onSave(tempValue);
    }
  };

  return editing ? (
    <Form.Control
      type="text"
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={finishEditing}
      onKeyDown={handleKeyDown}
      autoFocus
      size="sm"
      style={{ fontSize: '0.9rem', padding: '3px' }}
    />
  ) : (
    <div onClick={() => setEditing(true)} style={{ cursor: 'pointer', padding: '2px 4px', fontSize: '0.9rem' }}>
      {value !== null && value !== undefined ? value.toString() : ''}
    </div>
  );
}

// EditableSelectCell component: inline editing dropdown
function EditableSelectCell({ value, options, onSave }) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  if (editing) {
    return (
      <Form.Control
        as="select"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={() => { setEditing(false); onSave(tempValue); }}
        autoFocus
        size="sm"
        style={{ fontSize: '0.9rem', padding: '3px' }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Control>
    );
  } else {
    const selected = options.find(opt => opt.value === value);
    return (
      <div onClick={() => setEditing(true)} style={{ cursor: 'pointer', padding: '2px 4px', fontSize: '0.9rem' }}>
        {selected ? selected.label : ''}
      </div>
    );
  }
}

function Dashboard() {
  // States for teams and players
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  // New rows for teams and players
  const [newTeam, setNewTeam] = useState({
    name: "",
    hide_ranking: false,
    hide_team_name: false,
  });
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    number: "",
    team: "",
    hide_name: false,
    hide_team: false,
    hide_personal_score: false,
    hide_completed_minigame_count: false,
  });

  // Common settings for attack calculations (fetched from backend)
  const [commonSettings, setCommonSettings] = useState({
    attacker_team_bonus: 2,
    attacker_player_bonus: 1,
    attacked_increment: 1,
    id: null,
  });

  // Fetch common settings
  const fetchCommonSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/');
      const data = await res.json();
      if (data.length > 0) {
        setCommonSettings(data[0]);
      }
    } catch (error) {
      console.error("Error fetching common settings:", error);
    }
  }, []);

  // Fetch teams data
  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch('/api/teams/');
      const data = await res.json();
      data.sort((a, b) => b.score - a.score);
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }, []);

  // Fetch players data sorted by number
  const fetchPlayers = useCallback(async () => {
    try {
      const res = await fetch('/api/players/');
      const data = await res.json();
      data.sort((a, b) => parseInt(a.number) - parseInt(b.number));
      setPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }, []);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchCommonSettings(),
      fetchTeams(),
      fetchPlayers(),
    ]);
  }, [fetchCommonSettings, fetchTeams, fetchPlayers]);

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 5000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // Auto-calculate max player number and update newPlayer state
  useEffect(() => {
    let maxNumber = 0;
    players.forEach(player => {
      const num = parseInt(player.number);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    });
    setNewPlayer(prev => ({ ...prev, number: (maxNumber + 1).toString() }));
  }, [players]);

  // Update team (PATCH)
  const updateTeam = async (teamId, field, newValue) => {
    const numericFields = ['score', 'attacked_count'];
    const payload = numericFields.includes(field)
      ? { [field]: Number(newValue) }
      : { [field]: newValue };
    try {
      const res = await fetch(`/api/teams/${teamId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updatedTeam = await res.json();
        setTeams(teams.map(team => team.id === updatedTeam.id ? updatedTeam : team));
      } else {
        console.error("Error updating team:", await res.text());
      }
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  // Update player (PATCH)
  const updatePlayer = async (playerId, field, newValue) => {
    const numericFields = ['personal_score', 'chips', 'completed_minigame_count'];
    const payload = numericFields.includes(field)
      ? { [field]: Number(newValue) }
      : { [field]: newValue };
    try {
      const res = await fetch(`/api/players/${playerId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updatedPlayer = await res.json();
        setPlayers(players.map(player => player.id === updatedPlayer.id ? updatedPlayer : player));
      } else {
        console.error("Error updating player:", await res.text());
      }
    } catch (error) {
      console.error("Error updating player:", error);
    }
  };

  // Delete player
  const deletePlayer = async (playerId) => {
    if (window.confirm("確定要刪除該玩家嗎？")) {
      try {
        const res = await fetch(`/api/players/${playerId}/`, { method: 'DELETE' });
        if (res.ok) {
          setPlayers(players.filter(player => player.id !== playerId));
        } else {
          alert("刪除玩家失敗！");
        }
      } catch (error) {
        console.error("Error deleting player:", error);
      }
    }
  };

  // Clear buttons for teams and players
  const clearTeamScore = async (teamId) => {
    if (window.confirm("確定要將該隊伍的分數清零嗎？")) {
      await updateTeam(teamId, 'score', 0);
    }
  };
  const clearTeamAttacked = async (teamId) => {
    if (window.confirm("確定要將該隊伍的被攻擊次數清零嗎？")) {
      await updateTeam(teamId, 'attacked_count', 0);
    }
  };
  const clearPlayerScore = async (playerId) => {
    if (window.confirm("確定要將該玩家的得分清零嗎？")) {
      await updatePlayer(playerId, 'personal_score', 0);
    }
  };
  const clearPlayerChips = async (playerId) => {
    if (window.confirm("確定要將該玩家的籌碼清零嗎？")) {
      await updatePlayer(playerId, 'chips', 0);
    }
  };

  // Add new team row
  const addTeam = async () => {
    if (!newTeam.name.trim()) {
      alert("請輸入隊伍名稱！");
      return;
    }
    const payload = {
      name: newTeam.name,
      score: 0,
      attacked_count: 0,
      hide_ranking: newTeam.hide_ranking,
      hide_team_name: newTeam.hide_team_name,
    };
    try {
      const res = await fetch('/api/teams/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("隊伍新增成功！");
        setNewTeam({ name: "", hide_ranking: false, hide_team_name: false });
        fetchTeams();
      } else {
        alert("新增隊伍失敗！");
      }
    } catch (error) {
      console.error(error);
      alert("新增隊伍時發生錯誤！");
    }
  };

  // Add new player row
  const addPlayer = async () => {
    if (!newPlayer.name.trim() || !newPlayer.number.trim() || !newPlayer.team) {
      alert("請輸入玩家名稱、號碼及選擇所屬隊伍！");
      return;
    }
    const payload = {
      name: newPlayer.name,
      number: newPlayer.number,
      personal_score: 0,
      chips: 0,
      completed_minigame_count: 0,
      team: newPlayer.team,
      hide_name: newPlayer.hide_name,
      hide_team: newPlayer.hide_team,
      hide_personal_score: newPlayer.hide_personal_score,
      hide_completed_minigame_count: newPlayer.hide_completed_minigame_count,
    };
    try {
      const res = await fetch('/api/players/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("玩家新增成功！");
        setNewPlayer({
          name: "",
          number: "",
          team: "",
          hide_name: false,
          hide_team: false,
          hide_personal_score: false,
          hide_completed_minigame_count: false,
        });
        fetchPlayers();
      } else {
        alert("新增玩家失敗！");
      }
    } catch (error) {
      console.error(error);
      alert("新增玩家時發生錯誤！");
    }
  };

  // Inline editing display: if hidden, return '---'
  const displayValueByFieldFunc = (value, item, field) => {
    if (field === 'score' || field === 'attacked_count') {
      return item.hide_ranking ? '---' : value;
    } else if (field === 'personal_score') {
      return item.hide_personal_score ? '---' : value;
    } else if (field === 'completed_minigame_count') {
      return item.hide_completed_minigame_count ? '---' : value;
    }
    return value;
  };

  // Prepare team dropdown options for player editing
  const teamOptions = teams.map(team => ({
    value: team.id.toString(),
    label: team.name,
  }));

  // Update common settings (PATCH) function defined inside the component
  const updateCommonSetting = async (field, newVal) => {
    const payload = { [field]: Number(newVal) };
    try {
      const res = await fetch(`/api/settings/${commonSettings.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setCommonSettings(updated);
      } else {
        console.error("Error updating common settings:", await res.text());
      }
    } catch (error) {
      console.error("Error updating common settings:", error);
    }
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4" style={{ fontSize: '1.3rem' }}>實時數據 Dashboard</h1>
      
      {/* Common Settings Section */}
      <Card className="mb-4">
        <Card.Header as="h5" style={{ fontSize: '1.1rem' }}>通用設定</Card.Header>
        <Card.Body style={{ padding: '5px' }}>
          <div style={{ marginBottom: '5px', fontSize: '0.9rem' }}>
            攻擊者隊伍加分量：{" "}
            <EditableCell
              value={commonSettings.attacker_team_bonus}
              onSave={(newVal) => updateCommonSetting('attacker_team_bonus', newVal)}
            />
          </div>
          <div style={{ marginBottom: '5px', fontSize: '0.9rem' }}>
            攻擊者玩家加分量：{" "}
            <EditableCell
              value={commonSettings.attacker_player_bonus}
              onSave={(newVal) => updateCommonSetting('attacker_player_bonus', newVal)}
            />
          </div>
          <div style={{ marginBottom: '5px', fontSize: '0.9rem' }}>
            被攻擊次數增加量：{" "}
            <EditableCell
              value={commonSettings.attacked_increment}
              onSave={(newVal) => updateCommonSetting('attacked_increment', newVal)}
            />
          </div>
        </Card.Body>
      </Card>

      {/* Teams Data Section */}
      <Card className="mb-4">
        <Card.Header as="h5" style={{ fontSize: '1.1rem' }}>隊伍數據</Card.Header>
        <Card.Body style={{ padding: '5px' }}>
          <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>隊伍名稱</th>
                <th style={{ width: '20%' }}>分數</th>
                <th style={{ width: '20%' }}>被攻擊次數</th>
                <th style={{ width: '30%' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.id}>
                  <td>
                    <EditableCell 
                      value={team.name} 
                      onSave={(newVal) => updateTeam(team.id, 'name', newVal)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      value={team.score} 
                      onSave={(newVal) => updateTeam(team.id, 'score', newVal)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      value={team.attacked_count} 
                      onSave={(newVal) => updateTeam(team.id, 'attacked_count', newVal)} 
                    />
                  </td>
                  <td>
                    <Button variant="warning" size="sm" className="me-1" onClick={() => clearTeamScore(team.id)} style={{ fontSize: '0.9rem', padding: '3px 6px' }}>
                      清零
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => clearTeamAttacked(team.id)} style={{ fontSize: '0.9rem', padding: '3px 6px' }}>
                      清零
                    </Button>
                  </td>
                </tr>
              ))}
              {/* New team row */}
              <tr>
                <td>
                  <Form.Control 
                    type="text" 
                    placeholder="新隊伍名稱" 
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    size="sm"
                    style={{ fontSize: '0.9rem', padding: '3px' }}
                  />
                </td>
                <td style={{ textAlign: 'center', fontSize: '0.9rem' }}>0</td>
                <td style={{ textAlign: 'center', fontSize: '0.9rem' }}>0</td>
                <td>
                  <Form.Check
                    type="checkbox"
                    label="隱藏排行榜數值"
                    checked={newTeam.hide_ranking}
                    onChange={(e) => setNewTeam({ ...newTeam, hide_ranking: e.target.checked })}
                    className="mb-1"
                    size="sm"
                    style={{ fontSize: '0.9rem' }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="隱藏隊伍名稱"
                    checked={newTeam.hide_team_name}
                    onChange={(e) => setNewTeam({ ...newTeam, hide_team_name: e.target.checked })}
                    className="mb-1"
                    size="sm"
                    style={{ fontSize: '0.9rem' }}
                  />
                  <Button variant="success" size="sm" onClick={addTeam} style={{ fontSize: '0.9rem', padding: '3px 6px' }}>
                    新增
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Players Data Section */}
      <Card className="mb-4">
        <Card.Header as="h5" style={{ fontSize: '1.1rem' }}>玩家數據</Card.Header>
        <Card.Body style={{ padding: '5px' }}>
          <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th style={{ width: '8%' }}>刪除</th>
                <th style={{ width: '12%' }}>所屬隊伍</th>
                <th style={{ width: '15%' }}>名字</th>
                <th style={{ width: '10%' }}>號碼</th>
                <th style={{ width: '10%' }}>個人得分</th>
                <th style={{ width: '12%' }}>籌碼</th>
                <th style={{ width: '15%' }}>完成遊戲數量</th>
                <th style={{ width: '13%' }}>得分/籌碼清零</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id}>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => deletePlayer(player.id)} style={{ fontSize: '0.9rem', padding: '3px 6px' }}>
                      刪除
                    </Button>
                  </td>
                  <td>
                    <EditableSelectCell 
                      value={player.team ? player.team.toString() : ""}
                      options={teamOptions}
                      onSave={(newVal) => updatePlayer(player.id, 'team', newVal)}
                    />
                  </td>
                  <td>
                    <EditableCell 
                      value={player.name} 
                      onSave={(newVal) => updatePlayer(player.id, 'name', newVal)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      value={player.number} 
                      onSave={(newVal) => updatePlayer(player.id, 'number', newVal)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      value={player.personal_score} 
                      onSave={(newVal) => updatePlayer(player.id, 'personal_score', newVal)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      value={player.chips} 
                      onSave={(newVal) => updatePlayer(player.id, 'chips', newVal)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      value={player.completed_minigame_count} 
                      onSave={(newVal) => updatePlayer(player.id, 'completed_minigame_count', newVal)} 
                    />
                  </td>
                  <td>
                    <Button variant="warning" size="sm" className="me-1" onClick={() => clearPlayerScore(player.id)} style={{ fontSize: '0.9rem', padding: '3px 6px' }}>
                      得分
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => clearPlayerChips(player.id)} style={{ fontSize: '0.9rem', padding: '3px 6px' }}>
                      籌碼
                    </Button>
                  </td>
                </tr>
              ))}
              {/* New player row */}
              <tr>
                <td></td>
                <td>
                  <Form.Control 
                    as="select" 
                    value={newPlayer.team}
                    onChange={(e) => setNewPlayer({ ...newPlayer, team: e.target.value })}
                    size="sm"
                    style={{ fontSize: '0.9rem', padding: '3px' }}
                  >
                    <option value="">選擇隊伍</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </Form.Control>
                </td>
                <td>
                  <Form.Control 
                    type="text" 
                    placeholder="新玩家名字" 
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    size="sm"
                    style={{ fontSize: '0.9rem', padding: '3px' }}
                  />
                </td>
                <td>
                  <Form.Control 
                    type="text" 
                    placeholder="新玩家號碼" 
                    value={newPlayer.number}
                    onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                    size="sm"
                    style={{ fontSize: '0.9rem', padding: '3px' }}
                  />
                </td>
                <td style={{ textAlign: 'center', fontSize: '0.9rem' }}>0</td>
                <td style={{ textAlign: 'center', fontSize: '0.9rem' }}>0</td>
                <td style={{ textAlign: 'center', fontSize: '0.9rem' }}>0</td>
                <td>
                  <Form.Check
                    type="checkbox"
                    label="隱藏名稱"
                    checked={newPlayer.hide_name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, hide_name: e.target.checked })}
                    className="mb-1"
                    size="sm"
                    style={{ fontSize: '0.9rem' }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="隱藏所屬隊伍"
                    checked={newPlayer.hide_team}
                    onChange={(e) => setNewPlayer({ ...newPlayer, hide_team: e.target.checked })}
                    className="mb-1"
                    size="sm"
                    style={{ fontSize: '0.9rem' }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="隱藏得分"
                    checked={newPlayer.hide_personal_score}
                    onChange={(e) => setNewPlayer({ ...newPlayer, hide_personal_score: e.target.checked })}
                    className="mb-1"
                    size="sm"
                    style={{ fontSize: '0.9rem' }}
                  />
                  <Form.Check
                    type="checkbox"
                    label="隱藏完成數"
                    checked={newPlayer.hide_completed_minigame_count}
                    onChange={(e) => setNewPlayer({ ...newPlayer, hide_completed_minigame_count: e.target.checked })}
                    className="mb-1"
                    size="sm"
                    style={{ fontSize: '0.9rem' }}
                  />
                  <Button variant="success" size="sm" onClick={addPlayer} style={{ fontSize: '0.9rem', padding: '3px 6px' }}>
                    新增
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Dashboard;