// src/components/TeamRankingBarChart.js
import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

// Framer Motion 動畫 variants：條狀圖從 0 寬度平滑展開到指定寬度
const barVariants = {
  hidden: { width: 0 },
  visible: (customWidth) => ({
    width: customWidth,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  }),
};

function TeamRankingBarChart() {
  const [teams, setTeams] = useState([]);

  // 每 5 秒拉取一次最新隊伍資料
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // 如果你已經在 Vercel 或其他地方，且要直接呼叫 Render 的網址：
        const res = await fetch('https://hk-pass-2.onrender.com/api/teams/');
        const data = await res.json();
        // 根據分數排序（降序）
        data.sort((a, b) => b.score - a.score);
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
    const interval = setInterval(fetchTeams, 5000);
    return () => clearInterval(interval);
  }, []);

  // 取得目前最高的分數，用來計算比例（避免除以 0）
  const maxScore = teams.reduce((max, team) => (team.score > max ? team.score : max), 0) || 1;

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4" style={{ color: '#fff' }}>
        隊伍排行榜
      </h1>
      <Card
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '20px',
          border: 'none',
          borderRadius: '12px',
        }}
      >
        {teams.map((team, index) => {
          // 計算該隊條狀圖的寬度（以百分比表示）
          const widthPercent = (team.score / maxScore) * 100;
          const barWidth = `${widthPercent}%`;

          return (
            <div
              key={team.id}
              style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* 左側顯示排名及隊伍編號 */}
              <div
                style={{
                  width: '100px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                }}
              >
                {index + 1}. 隊伍 {team.number}
              </div>
              {/* 中間為條狀圖 */}
              <div
                style={{
                  flexGrow: 1,
                  margin: '0 15px',
                  background: '#ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  height: '30px',
                }}
              >
                <motion.div
                  custom={barWidth}
                  variants={barVariants}
                  initial="hidden"
                  animate="visible"
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
                  }}
                />
              </div>
              {/* 右側顯示數值 */}
              <div
                style={{
                  width: '60px',
                  color: '#fff',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                }}
              >
                {team.score}
              </div>
            </div>
          );
        })}
      </Card>
    </Container>
  );
}

export default TeamRankingBarChart;