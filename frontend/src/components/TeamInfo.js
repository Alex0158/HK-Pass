import { Card, Form, Row, Col } from "react-bootstrap"
import { updateTeam } from "../api/apiService"

export default function TeamInfo({ team, setTeam }) {
  const handleRankingToggle = async (e) => {
    const checked = e.target.checked
    try {
      const updatedTeam = await updateTeam(team.id, { hide_ranking: checked })
      setTeam(updatedTeam)
    } catch (error) {
      console.error("Error updating hide_ranking:", error)
    }
  }

  const handleHideTeamNameToggle = async (e) => {
    const checked = e.target.checked
    try {
      const updatedTeam = await updateTeam(team.id, { hide_team_name: checked })
      setTeam(updatedTeam)
    } catch (error) {
      console.error("Error updating hide_team_name:", error)
    }
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4>隊伍數據</h4>
        <p>
          分數: {team.score} | 被攻擊次數: {team.attacked_count}
        </p>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Check
              type="switch"
              id="ranking-hidden-switch"
              label="隱藏排行榜數值"
              checked={team.hide_ranking}
              onChange={handleRankingToggle}
            />
          </Col>
          <Col md={6}>
            <Form.Check
              type="switch"
              id="team-name-hidden-switch"
              label="隱藏排行榜隊伍名稱"
              checked={team.hide_team_name}
              onChange={handleHideTeamNameToggle}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

