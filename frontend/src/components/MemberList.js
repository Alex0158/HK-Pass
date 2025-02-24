import { Table, Form } from "react-bootstrap"
import { updatePlayer } from "../api/apiService"

export default function MemberList({ members, setMembers }) {
  const handleToggle = async (memberId, field, value) => {
    try {
      const updatedPlayer = await updatePlayer(memberId, { [field]: value })
      setMembers(members.map((m) => (m.id === updatedPlayer.id ? updatedPlayer : m)))
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
    }
  }

  return (
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
        {members.map((member) => (
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
                onChange={(e) => handleToggle(member.id, "hide_team", e.target.checked)}
              />
              <Form.Check
                type="switch"
                id={`hide_name_${member.id}`}
                label="隱藏姓名"
                checked={member.hide_name}
                onChange={(e) => handleToggle(member.id, "hide_name", e.target.checked)}
              />
              <Form.Check
                type="switch"
                id={`hide_personal_score_${member.id}`}
                label="隱藏得分"
                checked={member.hide_personal_score}
                onChange={(e) => handleToggle(member.id, "hide_personal_score", e.target.checked)}
              />
              <Form.Check
                type="switch"
                id={`hide_completed_minigame_count_${member.id}`}
                label="隱藏完成數"
                checked={member.hide_completed_minigame_count}
                onChange={(e) => handleToggle(member.id, "hide_completed_minigame_count", e.target.checked)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

