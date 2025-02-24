// src/components/EditPlayer.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    fetchPlayer();
  }, [id]);

  const fetchPlayer = async () => {
    try {
      const res = await fetch(`/api/players/${id}/`);
      const data = await res.json();
      setPlayer(data);
    } catch (error) {
      console.error('Error fetching player:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlayer({ ...player, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/players/${id}/`, {
        method: 'PUT', // 如後端支援局部更新，可改用 PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player)
      });
      if (res.ok) {
        alert('玩家數據更新成功');
        navigate('/dashboard');
      } else {
        console.error('更新失敗：', await res.text());
      }
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  if (!player) return <div className="container my-5">載入中...</div>;

  return (
    <div className="container my-5">
      <h2>修改玩家數據</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label>名字</label>
          <input
            type="text"
            name="name"
            value={player.name}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group mb-3">
          <label>玩家號碼</label>
          <input
            type="text"
            name="number"
            value={player.number}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group mb-3">
          <label>個人分</label>
          <input
            type="number"
            name="personal_score"
            value={player.personal_score}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group mb-3">
          <label>籌碼</label>
          <input
            type="number"
            name="chips"
            value={player.chips}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group mb-3">
          <label>完成小遊戲數量</label>
          <input
            type="number"
            name="completed_minigame_count"
            value={player.completed_minigame_count}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group mb-3">
          <label>隊伍編號</label>
          <input
            type="text"
            name="team"
            value={player.team}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-success">
          更新玩家數據
        </button>
      </form>
    </div>
  );
}

export default EditPlayer;
