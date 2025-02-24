// src/components/TeamPanel.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function TeamPanel() {
  // 從路由參數取得隊伍名稱 (例如 "Team1")
  const { teamName } = useParams();

  // 狀態：當前面板隊伍、隊伍成員、所有隊伍 (用於攻擊者隊伍下拉選單)、所有玩家 (用於攻擊者玩家下拉選單)
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);

  // 攻擊操作輸入欄位：攻擊者隊伍、攻擊者號碼、攻擊次數
  const [attackerTeam, setAttackerTeam] = useState('');
  const [attackerNumber, setAttackerNumber] = useState('');
  const [attackCount, setAttackCount] = useState(1);
  // 從 allPlayers 中過濾出的攻擊者隊伍內玩家
  const [attackerPlayers, setAttackerPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');

  // 隱藏排行榜數值與隊伍名稱開關（依據後端 Team 設定）
  const [rankingHidden, setRankingHidden] = useState(false);
  const [hideTeamName, setHideTeamName] = useState(false);

  // 從後端取得通用設定（CommonSetting），用來計算攻擊操作時的加分
  // 初始值設為 null，待 fetch 後更新
  const [commonSettings, setCommonSettings] = useState(null);

  // 定期取得通用設定，每5秒更新一次
  useEffect(() => {
    const fetchCommonSettings = async () => {
      try {
        const res = await fetch('/api/settings/');
        const data = await res.json();
        if (data.length > 0) {
          setCommonSettings(data[0]);
        }
      } catch (error) {
        console.error("Error fetching common settings:", error);
      }
    };
    fetchCommonSettings();
    const interval = setInterval(fetchCommonSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  // 取得當前面板隊伍資料 (依 teamName 查詢)
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/teams/?name=${encodeURIComponent(teamName)}`);
        const data = await res.json();
        if (data.length > 0) {
          setTeam(data[0]);
        }
      } catch (error) {
        console.error("Error fetching team:", error);
      }
    };
    fetchTeam();
  }, [teamName]);

  // 當取得隊伍資料後，根據 team.id 取得該隊成員資料
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (team) {
          const res = await fetch(`/api/players/?team=${team.id}`);
          const data = await res.json();
          setMembers(data);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchMembers();
  }, [team]);

  // 取得所有隊伍資料 (用於攻擊者隊伍下拉選單)
  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        const res = await fetch('/api/teams/');
        const data = await res.json();
        setAllTeams(data);
      } catch (error) {
        console.error("Error fetching all teams:", error);
      }
    };
    fetchAllTeams();
  }, []);

  // 取得所有玩家資料 (用於攻擊者玩家下拉選單)
  useEffect(() => {
    const fetchAllPlayers = async () => {
      try {
        const res = await fetch('/api/players/');
        const data = await res.json();
        setAllPlayers(data);
      } catch (error) {
        console.error("Error fetching all players:", error);
      }
    };
    fetchAllPlayers();
  }, []);

  // 當攻擊者隊伍變動時，從 allPlayers 中過濾出該隊伍內的玩家
  useEffect(() => {
    if (attackerTeam) {
      const filtered = allPlayers.filter(player => {
        let playerTeamName = "";
        if (player.team && typeof player.team === 'object' && player.team.name) {
          playerTeamName = player.team.name;
        } else if (player.team) {
          const foundTeam = allTeams.find(t => t.id === player.team);
          if (foundTeam) {
            playerTeamName = foundTeam.name;
          }
        }
        return playerTeamName.trim().toLowerCase() === attackerTeam.trim().toLowerCase();
      });
      setAttackerPlayers(filtered);
    } else {
      setAttackerPlayers([]);
    }
    setSelectedPlayer('');
  }, [attackerTeam, allPlayers, allTeams]);

  // 讀取當前隊伍的隱藏設定（由後端資料決定）
  useEffect(() => {
    if (team) {
      setRankingHidden(team.hide_ranking);
      setHideTeamName(team.hide_team_name);
    }
  }, [team]);

  // 當切換隱藏排行榜數值開關時，更新後端的 hide_ranking 欄位
  const handleRankingToggle = async (e) => {
    const checked = e.target.checked;
    setRankingHidden(checked);
    if (team) {
      try {
        const res = await fetch(`/api/teams/${team.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hide_ranking: checked })
        });
        if (res.ok) {
          const updatedTeam = await res.json();
          setTeam(updatedTeam);
        } else {
          console.error("Failed to update hide_ranking");
        }
      } catch (error) {
        console.error("Error updating hide_ranking:", error);
      }
    }
  };

  // 當切換隱藏排行榜隊伍名稱開關時，更新後端的 hide_team_name 欄位
  const handleHideTeamNameToggle = async (e) => {
    const checked = e.target.checked;
    setHideTeamName(checked);
    if (team) {
      try {
        const res = await fetch(`/api/teams/${team.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hide_team_name: checked })
        });
        if (res.ok) {
          const updatedTeam = await res.json();
          setTeam(updatedTeam);
        } else {
          console.error("Failed to update hide_team_name");
        }
      } catch (error) {
        console.error("Error updating hide_team_name:", error);
      }
    }
  };

  // 自動刷新：每5秒重新取得當前面板隊伍、成員與所有玩家資料
  useEffect(() => {
    if (team) {
      const interval = setInterval(() => {
        fetch(`/api/teams/?name=${encodeURIComponent(teamName)}`)
          .then(res => res.json())
          .then(data => {
            if (data.length > 0) setTeam(data[0]);
          })
          .catch(error => console.error("Error refreshing team data:", error));
        fetch(`/api/players/?team=${team.id}`)
          .then(res => res.json())
          .then(data => setMembers(data))
          .catch(error => console.error("Error refreshing members data:", error));
        fetch('/api/players/')
          .then(res => res.json())
          .then(data => setAllPlayers(data))
          .catch(error => console.error("Error refreshing all players:", error));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [team, teamName]);

  // 定義 refreshData 函式，攻擊操作後立即刷新最新資料
  const refreshData = async () => {
    if (team) {
      try {
        const resTeam = await fetch(`/api/teams/?name=${encodeURIComponent(teamName)}`);
        const teamData = await resTeam.json();
        if (teamData.length > 0) setTeam(teamData[0]);
        const resMembers = await fetch(`/api/players/?team=${team.id}`);
        const membersData = await resMembers.json();
        setMembers(membersData);
        const resAllPlayers = await fetch('/api/players/');
        const allPlayersData = await resAllPlayers.json();
        setAllPlayers(allPlayersData);
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    }
  };

  // 處理攻擊操作：根據通用設定計算分數變化
  const handleAttack = async () => {
    if (!attackerTeam || !attackerNumber || !attackCount) {
      alert('請選擇攻擊者隊伍、攻擊者號碼，並輸入攻擊次數');
      return;
    }
    if (attackerTeam === team.name) {
      alert('攻擊者隊伍不能與目標隊伍相同');
      return;
    }
    const normAttackerTeam = attackerTeam.trim();
    const normAttackerNumber = attackerNumber.trim();
    const count = Number(attackCount);
    if (isNaN(count) || count <= 0) {
      alert('請輸入有效的攻擊次數');
      return;
    }
    if (!commonSettings) {
      alert('通用設定尚未載入，請稍後再試。');
      return;
    }

    try {
      // (1) 更新被攻擊隊伍（當前面板）的 attacked_count
      // 新 attacked_count = 現有 attacked_count + (攻擊次數 × commonSettings.attacked_increment)
      const newAttackedCount = team.attacked_count + count * commonSettings.attacked_increment;
      const teamUpdateRes = await fetch(`/api/teams/${team.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attacked_count: newAttackedCount })
      });
      if (!teamUpdateRes.ok) {
        throw new Error('Failed to update target team attacked_count');
      }

      // (2) 從 attackerPlayers 中找出攻擊者玩家（依據攻擊者號碼完全匹配）
      const attackerPlayer = attackerPlayers.find(p => p.number.trim() === normAttackerNumber);
      if (attackerPlayer) {
        // 新個人得分 = 現有個人得分 + (攻擊次數 × commonSettings.attacker_player_bonus)
        const newPlayerScore = attackerPlayer.personal_score + count * commonSettings.attacker_player_bonus;
        const playerUpdateRes = await fetch(`/api/players/${attackerPlayer.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personal_score: newPlayerScore })
        });
        if (!playerUpdateRes.ok) {
          throw new Error('Failed to update attacker player personal_score');
        }
      } else {
        alert(`找不到攻擊者玩家，請確認隊伍「${normAttackerTeam}」內是否有玩家號碼「${normAttackerNumber}」`);
        return;
      }

      // (3) 更新攻擊者隊伍的總分
      let attackerTeamId;
      const samplePlayer = attackerPlayers.find(p => p.number.trim() === normAttackerNumber);
      if (samplePlayer) {
        if (samplePlayer.team && typeof samplePlayer.team === 'object' && samplePlayer.team.id) {
          attackerTeamId = samplePlayer.team.id;
        } else if (samplePlayer.team) {
          const foundTeam = allTeams.find(t => t.id === samplePlayer.team);
          if (foundTeam) {
            attackerTeamId = foundTeam.id;
          }
        }
        if (attackerTeamId) {
          const resAttackerTeam = await fetch(`/api/teams/${attackerTeamId}/`);
          const attackerTeamObj = await resAttackerTeam.json();
          // 新隊伍分數 = 現有分數 + (攻擊次數 × commonSettings.attacker_team_bonus)
          const newTeamScore = attackerTeamObj.score + count * commonSettings.attacker_team_bonus;
          const teamScoreUpdateRes = await fetch(`/api/teams/${attackerTeamId}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: newTeamScore })
          });
          if (!teamScoreUpdateRes.ok) {
            throw new Error('Failed to update attacker team score');
          }
        } else {
          alert('找不到攻擊者隊伍資料');
        }
      } else {
        alert('攻擊者隊伍資料不足');
      }

      alert(`攻擊記錄已提交：
攻擊者隊伍: ${normAttackerTeam}，
攻擊者號碼: ${normAttackerNumber}，
攻擊次數: ${count}，
被攻擊次數增加: ${count * commonSettings.attacked_increment}，
攻擊者玩家加分: ${count * commonSettings.attacker_player_bonus}，
攻擊者隊伍加分: ${count * commonSettings.attacker_team_bonus}`);
      await refreshData();
    } catch (error) {
      console.error('Error updating data:', error);
      alert('更新失敗，請檢查後端 API');
    }

    // 清空攻擊輸入欄位
    setAttackerTeam('');
    setAttackerNumber('');
    setAttackCount(1);
  };

  if (!team) return <div className="container my-5">載入中...</div>;

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4" style={{ fontSize: '1.3rem' }}>{team.name} 操作面板</h1>

      {/* 隱藏排行榜數值與隱藏排行榜隊伍名稱開關 */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Check
            type="switch"
            id="ranking-hidden-switch"
            label="隱藏排行榜數值"
            checked={rankingHidden}
            onChange={handleRankingToggle}
          />
        </Col>
        <Col md={6}>
          <Form.Check
            type="switch"
            id="team-name-hidden-switch"
            label="隱藏排行榜隊伍名稱"
            checked={hideTeamName}
            onChange={handleHideTeamNameToggle}
          />
        </Col>
      </Row>

      {/* 攻擊操作區域 */}
      <Card className="mb-4">
        <Card.Header style={{ fontSize: '0.9rem' }}>攻擊操作</Card.Header>
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Group controlId="formAttackerTeam">
                  <Form.Label style={{ fontSize: '0.7rem' }}>攻擊者隊伍</Form.Label>
                  <Form.Control
                    as="select"
                    value={attackerTeam}
                    onChange={e => setAttackerTeam(e.target.value)}
                    size="xs"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <option value="">請選擇攻擊者隊伍</option>
                    {allTeams
                      .filter(t => t.name !== team.name)
                      .map(t => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="formAttackerNumber">
                  <Form.Label style={{ fontSize: '0.7rem' }}>攻擊者號碼</Form.Label>
                  <Form.Control
                    as="select"
                    value={attackerNumber}
                    onChange={e => setAttackerNumber(e.target.value)}
                    size="xs"
                    style={{ fontSize: '0.7rem' }}
                    disabled={!attackerTeam || attackerPlayers.length === 0}
                  >
                    <option value="">請選擇攻擊者號碼</option>
                    {attackerPlayers.map(player => (
                      <option key={player.id} value={player.number}>
                        {player.number}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="formAttackCount">
                  <Form.Label style={{ fontSize: '0.7rem' }}>攻擊次數</Form.Label>
                  <Form.Control
                    type="number"
                    value={attackCount}
                    onChange={e => setAttackCount(e.target.value)}
                    min={1}
                    size="xs"
                    style={{ fontSize: '0.7rem', padding: '2px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="text-center">
                <Button
                  variant="danger"
                  onClick={handleAttack}
                  size="xs"
                  style={{
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    fontSize: '1.2rem'
                  }}
                >
                  攻擊
                </Button>
              </Col>
            </Row>
          </Form>
          <p className="mt-2" style={{ fontSize: '0.7rem', color: '#555' }}>
            (通用設定：隊伍加分 {commonSettings ? commonSettings.attacker_team_bonus : '讀取中'}、玩家加分 {commonSettings ? commonSettings.attacker_player_bonus : '讀取中'}、被攻擊增加 {commonSettings ? commonSettings.attacked_increment : '讀取中'})
          </p>
        </Card.Body>
      </Card>

      {/* 隊伍資料與成員列表 */}
      <Card>
        <Card.Header>
          <h4>隊伍數據</h4>
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
                <th>隱藏設定</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.number}</td>
                  <td>{member.personal_score}</td>
                  <td>{member.chips}</td>
                  <td>{member.completed_minigame_count}</td>
                  <td>
                    <Form.Check
                      type="switch"
                      id={`hide_team_${member.id}`}
                      label="隱藏隊伍"
                      checked={member.hide_team}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        try {
                          const res = await fetch(`/api/players/${member.id}/`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ hide_team: checked })
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            setMembers(members.map(m => m.id === updated.id ? updated : m));
                          }
                        } catch (error) {
                          console.error("Error updating hide_team:", error);
                        }
                      }}
                    />
                    <Form.Check
                      type="switch"
                      id={`hide_name_${member.id}`}
                      label="隱藏姓名"
                      checked={member.hide_name}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        try {
                          const res = await fetch(`/api/players/${member.id}/`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ hide_name: checked })
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            setMembers(members.map(m => m.id === updated.id ? updated : m));
                          }
                        } catch (error) {
                          console.error("Error updating hide_name:", error);
                        }
                      }}
                    />
                    <Form.Check
                      type="switch"
                      id={`hide_personal_score_${member.id}`}
                      label="隱藏得分"
                      checked={member.hide_personal_score}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        try {
                          const res = await fetch(`/api/players/${member.id}/`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ hide_personal_score: checked })
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            setMembers(members.map(m => m.id === updated.id ? updated : m));
                          }
                        } catch (error) {
                          console.error("Error updating hide_personal_score:", error);
                        }
                      }}
                    />
                    <Form.Check
                      type="switch"
                      id={`hide_completed_minigame_count_${member.id}`}
                      label="隱藏完成數"
                      checked={member.hide_completed_minigame_count}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        try {
                          const res = await fetch(`/api/players/${member.id}/`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ hide_completed_minigame_count: checked })
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            setMembers(members.map(m => m.id === updated.id ? updated : m));
                          }
                        } catch (error) {
                          console.error("Error updating hide_completed_minigame_count:", error);
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TeamPanel;