import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { FiGift, FiHome, FiUsers, FiBarChart2, FiCreditCard } from 'react-icons/fi';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Inter', Arial, sans-serif;
    background: linear-gradient(180deg, #1a1331 0%, #33215e 100%);
    color: #fff;
  }
`;

const Container = styled.div`
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 18px 16px 10px 16px;
  background: linear-gradient(90deg, #2d2342 0%, #3c256c 100%);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  position: relative;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff3;
  margin-right: 12px;
  object-fit: cover;
  border: 2px solid #ffe066;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
`;

const Rank = styled.div`
  font-size: 0.85rem;
  color: #ffe066;
`;

const AirdropBtn = styled.button`
  background: linear-gradient(90deg, #ff6b6b 0%, #ffe066 100%);
  color: #231b36;
  border: none;
  border-radius: 18px;
  padding: 8px 18px;
  font-weight: bold;
  font-size: 0.95rem;
  margin-left: 14px;
  cursor: pointer;
`;

const LangBtn = styled.button`
  background: #2e2d4d;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  padding: 0;
  margin-left: 10px;
  border: none;
  color: #fff;
`;

const RewardPanel = styled.div`
  background: #2d2342;
  border-radius: 18px;
  margin: 16px;
  padding: 16px;
  text-align: center;
`;
const RewardMain = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
`;
const RewardValue = styled.div`
  font-size: 2rem;
  color: #ffe066;
  margin: 0 10px;
`;
const RewardLabel = styled.div`
  font-size: 1rem;
  color: #fff;
  margin: 0 10px;
`;

const EggPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0 16px 0;
`;
const EggImg = styled.img`
  width: 120px;
  height: 140px;
  margin-bottom: 12px;
`;
const EggBtn = styled.button`
  background: linear-gradient(90deg, #7c5be7 0%, #ffe066 100%);
  color: #231b36;
  border: none;
  border-radius: 24px;
  padding: 12px 32px;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 8px;
`;

const Collection = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 24px 0;
`;
const CollectionItem = styled.div`
  background: #fff2;
  border-radius: 14px;
  padding: 10px 22px;
  color: #ffe066;
  font-weight: 600;
  font-size: 1.05rem;
`;

const BottomNav = styled.div`
  position: fixed;
  left: 0; right: 0; bottom: 0;
  background: #2d2342;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
`;
const NavBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const mockUser = {
  avatar: 'https://i.imgur.com/4M34hi2.png',
  username: 'Quang Dang 🪐 Nebulaat',
  rank: 'Golden Gladiator',
};
const mockReward = {
  total: 5.7788,
  daily: 0.1992,
};
const mockEgg = {
  img: 'https://i.imgur.com/6XbHjKj.png',
  label: "0.1 What's Inside?",
};
const mockCollection = [
  { name: 'Catopia', earn: '0.1 /day', img: 'https://i.imgur.com/8Km9tLL.png' },
  { name: 'Doge', earn: '0.01 /day', img: 'https://i.imgur.com/bx1K3hF.png' },
];

function App() {
  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <Avatar src={mockUser.avatar} alt="avatar" />
          <UserInfo>
            <Username>{mockUser.username}</Username>
            <Rank>🏅 {mockUser.rank}</Rank>
          </UserInfo>
          <AirdropBtn>AIRDROP</AirdropBtn>
          <LangBtn>🇬🇧</LangBtn>
        </Header>
        <RewardPanel>
          <RewardMain>
            <RewardValue>{mockReward.total}</RewardValue>
            <RewardLabel>Total Reward</RewardLabel>
            <RewardValue>{mockReward.daily}</RewardValue>
            <RewardLabel>Daily Reward</RewardLabel>
          </RewardMain>
        </RewardPanel>
        <EggPanel>
          <EggImg src={mockEgg.img} alt="egg" />
          <EggBtn>{mockEgg.label}</EggBtn>
        </EggPanel>
        <Collection>
          {mockCollection.map((c, i) => (
            <CollectionItem key={i}>
              <img src={c.img} alt={c.name} style={{width:28, height:28, borderRadius:8, marginRight:8, verticalAlign:'middle'}} />
              {c.name} <span style={{fontSize:'0.9em', color:'#fff', marginLeft:6}}>{c.earn}</span>
            </CollectionItem>
          ))}
        </Collection>
        <div style={{flex:1}} />
        <BottomNav>
          <NavBtn><FiHome size={22}/>Home</NavBtn>
          <NavBtn><FiBarChart2 size={22}/>Stats</NavBtn>
          <NavBtn><FiUsers size={22}/>Invite</NavBtn>
          <NavBtn><FiGift size={22}/>Earn</NavBtn>
          <NavBtn><FiCreditCard size={22}/>Wallet</NavBtn>
        </BottomNav>
      </Container>
    </>
  );
}

export default App;
