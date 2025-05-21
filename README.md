# authentification-web-service

A comprehensive authentication system with frontend and backend implementation. Features secure user registration, login, password reset, and jwt token-based authentication

## Tech Stack

### Backend Server

- Bun: JavaScript/TypeScript 런타임 환경
- MongoDB: 사용자 데이터 저장용 NoSQL 데이터베이스
- Redis: 세션 및 토큰 관리
- JWT: 사용자 인증 및 권한 부여

### Frontend

- React: UI 구성 라이브러리
- TypeScript: 타입 안전성을 위한 정적 타입 시스템
- Vite: 빌드 도구
- Zustand: 상태 관리 라이브러리

## 주요 기능

- 사용자 등록: 이메일, 비밀번호, 이름으로 회원가입
- 로그인: JWT 액세스 및 리프레시 토큰 발급
- 세션 관리: Redis를 활용한 안전한 세션 관리
- 토큰 자동 갱신: 리프레시 토큰을 통한 액세스 토큰 갱신

## Install Dependencies

- Docker
  - MongoDB 및 Redis 컨테이너 환경 실행
- Bun
- Node.js

### MongoDB Community Server

#### Downlaod redis Docker Image

```
docker pull mongodb/mongodb-community-server:latest
```

#### Create & Run Docker Container

MongoDB 의 default port `27017` 를 로컬 `27017` port와 port fowarding

```
docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest
```

#### Docker Container Status Check

```
sudo docker ps -a
```

### redis

#### Downlaod redis Docker Image

```
docker pull redis
```

#### Create & Run Docker Container

redis 의 default port `6379` 를 로컬 `6379` port와 port fowarding

```
sudo docker run -p 6379:6379 --name redis-container redis
```

#### Docker Container Status Check

```
sudo docker ps -a
```

### Backend

```
cd backend
bun install
bun run index.ts
```

#### environment

`authentification-web-service/backend/.env`

```
JWT_SECRET_KEY=examplekey
JWT_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
JWT_ALGORITHM=HS256

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

MONGO_DB_NAME=auth-api
MONGO_DB_USER=admin
MONGO_DB_PASSWORD=admin
MONGO_DB_HOST=localhost
MONGO_DB_PORT=27017
```

### Frontend

```
cd frontend
npm install
npm run dev
```

#### environment

`authentification-web-service/frontend/.env`

```
VITE_API_URL=http://localhost:4000
```

---
