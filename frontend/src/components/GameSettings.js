import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Form, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchGames, updateGame } from "../api/apiService";

// EditableCell 元件：點擊後轉為 input，失去焦點或按 Enter 自動送出更新
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
    />
  ) : (
    <div onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
      {value !== null && value !== undefined ? value.toString() : ''}
    </div>
  );
}

// Popup 動畫 variants
const popupVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.5 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120 } },
  exit: { opacity: 0, y: 50, scale: 0.5, transition: { duration: 0.5 } }
};

function GameSettings() {
  const [games, setGames] = useState([]);
  const [popup, setPopup] = useState(null);
  // 新增遊戲的狀態，預設欄位（被玩次數、顯示與限時等皆使用預設值）
  const [newGame, setNewGame] = useState({
    category: "",
    room: "",
    name: "",
    available_chips: "",
    play_count: 0,
    is_displayed: false,
    is_limited: false,
    limited_time: 0
  });

  // 取得所有小遊戲資料（透過 apiService）
  const loadGames = async () => {
    try {
      const data = await fetchGames();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  // 更新單筆遊戲資料，更新後重新取得最新資料
  const handleUpdateGame = async (id, updatedFields) => {
    try {
      const res = await updateGame(id, updatedFields);
      if (!res) {
        console.error('更新失敗');
      }
      loadGames();
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  // 刪除遊戲
  const deleteGame = async (gameId) => {
    if (window.confirm("確定要刪除這個遊戲嗎？")) {
      try {
        const res = await fetch(`/api/minigames/${gameId}/`, { method: 'DELETE' });
        if (res.ok) {
          alert("遊戲刪除成功！");
          loadGames();
        } else {
          alert("刪除失敗！");
        }
      } catch (error) {
        console.error("Error deleting game:", error);
      }
    }
  };

  // 清零被玩次數
  const clearPlayCount = async (gameId) => {
    if (window.confirm("確定要清零被玩次數嗎？")) {
      try {
        const res = await updateGame(gameId, { play_count: 0 });
        if (res) {
          alert("被玩次數已清零！");
          loadGames();
        } else {
          alert("清零失敗！");
        }
      } catch (error) {
        console.error("Error clearing play count:", error);
      }
    }
  };

  // 當限時開啟時觸發 Popup
  const triggerPopup = (game) => {
    setPopup(`限時遊戲 "${game.name}" 已啟用！限時 ${game.limited_time} 秒`);
    setTimeout(() => {
      setPopup(null);
    }, 5000);
  };

  // 處理限時開關
  const handleSwitchChange = (game, field, checked) => {
    handleUpdateGame(game.id, { [field]: checked });
    if (field === 'is_limited' && checked) {
      triggerPopup(game);
    }
  };

  // 新遊戲新增操作
  const addGame = async () => {
    // 驗證必要欄位
    if (!newGame.category.trim() || !newGame.room.trim() || !newGame.name.trim() || newGame.available_chips === "") {
      alert("請填寫所有必要的欄位！");
      return;
    }
    const payload = {
      category: newGame.category,
      room: newGame.room,
      name: newGame.name,
      available_chips: Number(newGame.available_chips),
      play_count: 0,
      is_displayed: false,
      is_limited: false,
      limited_time: 0
    };
    try {
      const res = await fetch('/api/minigames/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("新遊戲新增成功！");
        setNewGame({
          category: "",
          room: "",
          name: "",
          available_chips: "",
          play_count: 0,
          is_displayed: false,
          is_limited: false,
          limited_time: 0
        });
        loadGames();
      } else {
        alert("新增遊戲失敗！");
      }
    } catch (error) {
      console.error("Error adding game:", error);
      alert("新增遊戲時發生錯誤！");
    }
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">遊戲大全設定</h1>

      <AnimatePresence>
        {popup && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              background: '#ffc107',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}
          >
            {popup}
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <Card.Header as="h5">所有小遊戲數據</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>刪除</th>
                <th>類別</th>
                <th>房間</th>
                <th>名稱</th>
                <th>可得籌碼</th>
                <th>被玩次數</th>
                <th>顯示</th>
                <th>限時</th>
                <th>限時秒數</th>
                <th>清零被玩次數</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => deleteGame(game.id)}>
                      刪除
                    </Button>
                  </td>
                  <td>
                    <EditableCell
                      value={game.category}
                      onSave={(newVal) => handleUpdateGame(game.id, { category: newVal })}
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={game.room}
                      onSave={(newVal) => handleUpdateGame(game.id, { room: newVal })}
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={game.name}
                      onSave={(newVal) => handleUpdateGame(game.id, { name: newVal })}
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={game.available_chips}
                      onSave={(newVal) => handleUpdateGame(game.id, { available_chips: Number(newVal) })}
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={game.play_count}
                      onSave={(newVal) => handleUpdateGame(game.id, { play_count: Number(newVal) })}
                    />
                  </td>
                  <td>
                    <Form.Check
                      type="switch"
                      checked={game.is_displayed}
                      onChange={(e) => handleUpdateGame(game.id, { is_displayed: e.target.checked })}
                    />
                  </td>
                  <td>
                    <Form.Check
                      type="switch"
                      checked={game.is_limited}
                      onChange={(e) => handleSwitchChange(game, 'is_limited', e.target.checked)}
                    />
                  </td>
                  <td>
                    <EditableCell
                      value={game.limited_time !== null && game.limited_time !== undefined ? game.limited_time.toString() : ''}
                      onSave={(newVal) => handleUpdateGame(game.id, { limited_time: Number(newVal) })}
                    />
                  </td>
                  <td>
                    <Button variant="warning" size="sm" onClick={() => clearPlayCount(game.id)}>
                      清零
                    </Button>
                  </td>
                </tr>
              ))}
              {/* 新增遊戲的空白列 */}
              <tr>
                <td></td>
                <td>
                  <Form.Control
                    type="text"
                    placeholder="類別"
                    value={newGame.category}
                    onChange={(e) => setNewGame({ ...newGame, category: e.target.value })}
                    size="sm"
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    placeholder="房間"
                    value={newGame.room}
                    onChange={(e) => setNewGame({ ...newGame, room: e.target.value })}
                    size="sm"
                  />
                </td>
                <td>
                  <Form.Control
                    type="text"
                    placeholder="名稱"
                    value={newGame.name}
                    onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                    size="sm"
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    placeholder="可得籌碼"
                    value={newGame.available_chips}
                    onChange={(e) => setNewGame({ ...newGame, available_chips: e.target.value })}
                    size="sm"
                  />
                </td>
                {/* 其餘欄位使用預設值 */}
                <td style={{ textAlign: 'center' }}>0</td>
                <td style={{ textAlign: 'center' }}>Off</td>
                <td style={{ textAlign: 'center' }}>Off</td>
                <td style={{ textAlign: 'center' }}>0</td>
                <td>
                  <Button variant="success" size="sm" onClick={addGame}>
                    新增
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
          <p className="text-muted">點擊表格內數值即可直接修改</p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default GameSettings;