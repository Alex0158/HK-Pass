"use client";

import { useState, useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import TeamInfo from "./TeamInfo";
import AttackForm from "./AttackForm";
import MemberList from "./MemberList";
import { fetchTeam, fetchMembers, fetchAllTeams, fetchAllPlayers, fetchCommonSettings } from "../api/apiService";

export default function TeamPanel() {
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
      <TeamInfo team={team} setTeam={setTeam} />
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
      <MemberList members={members} setMembers={setMembers} />
    </Container>
  );
}