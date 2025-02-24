import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/teams/${id}/`);
        const data = await res.json();
        setTeam(data);
      } catch (error) {
        console.error('Error fetching team:', error);
      }
    };

    fetchTeam();
  }, [id]); // 依賴陣列只依賴 id

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeam({ ...team, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/teams/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team)
      });
      if (res.ok) {
        alert('隊伍數據更新成功');
        navigate('/dashboard');
      } else {
        console.error('更新失敗：', await res.text());
      }
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  if (!team) return <div className="container my-5">載入中...</div>;

  return (
    <div className="container my-5">
      <h2>修改隊伍數據</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label>隊伍編號</label>
          <input
            type="number"
            name="number"
            value={team.number}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group mb-3">
          <label>得分</label>
          <input
            type="number"
            name="score"
            value={team.score}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group mb-3">
          <label>被攻擊次數</label>
          <input
            type="number"
            name="attacked_count"
            value={team.attacked_count}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          更新隊伍數據
        </button>
      </form>
    </div>
  );
}

export default EditTeam;
