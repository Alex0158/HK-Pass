// src/components/TeamPanel.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import AttackForm from './AttackForm';
import { fetchTeam, fetchMembers, fetchAllTeams, fetchAllPlayers, fetchCommonSettings } from '../api/apiService';

const API_BASE_URL = "https://hk-pass-2.onrender.com/api";

function TeamPanel() {
  const { teamName } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [commonSettings, setCommonSettings] = useState(null);

  useEffect(() => {
    if (!teamName) return; // 避免 teamName 為 undefined 時觸發請求

    const initializeData = async () => {
      try {
        const teamData = await fetchTeam(teamName);
        setTeam(teamData);

        if (teamData) {
          const membersData = await fetchMembers(teamData.id);
          setMembers(membersData);
        }

        const teamsData = await fetchAllTeams();
        setAllTeams(teamsData);

        const playersData = await fetchAllPlayers();
        setAllPlayers(playersData);

        const settingsData = await fetchCommonSettings();
        setCommonSettings(settingsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    initializeData();
    const interval = setInterval(initializeData, 1000);
    return () => clearInterval(interval);
  }, [teamName]);

  const refreshData = async () => {
    if (!team || !team.name) return; // 避免 team 為空時出錯

    try {
      const updatedTeam = await fetchTeam(team.name);
      setTeam(updatedTeam);

      if (updatedTeam) {
        const updatedMembers = await fetchMembers(updatedTeam.id);
        setMembers(updatedMembers);
      }

      const updatedPlayers = await fetchAllPlayers();
      setAllPlayers(updatedPlayers);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  if (!team) return <Container className="my-5">載入中...</Container>;

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4" style={{ fontSize: "1.3rem" }}>
        {team.name} 操作面板
      </h1>
      {/* 隊伍資料區塊：僅顯示分數與被攻擊次數 */}
      <Card className="mb-4">
        <Card.Header style={{ fontSize: "0.9rem" }}>隊伍資料</Card.Header>
        <Card.Body>
          <p>分數：{team.score}</p>
          <p>被攻擊次數：{team.attacked_count}</p>
        </Card.Body>
      </Card>
      {/* 攻擊操作區塊 */}
      <Card className="mb-4">
        <Card.Header style={{ fontSize: "0.9rem" }}>攻擊操作</Card.Header>
        <Card.Body>
          <AttackForm
            team={team}
            allTeams={allTeams}
            allPlayers={allPlayers}
            commonSettings={commonSettings}
            refreshData={refreshData}
          />
        </Card.Body>
      </Card>
      {/* 玩家資料區塊：僅顯示玩家基本資訊 */}
      <Card className="mb-4">
        <Card.Header style={{ fontSize: "0.9rem" }}>玩家資料</Card.Header>
        <Card.Body>
          {members.length === 0 ? (
            <p>沒有玩家資料</p>
          ) : (
            <Table striped bordered hover responsive style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>玩家名稱</th>
                  <th>玩家號碼</th>
                  <th>個人得分</th>
                  <th>籌碼</th>
                  <th>完成小遊戲數</th>
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
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TeamPanel;
