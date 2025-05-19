# authentification-web-service

A comprehensive authentication system with frontend and backend implementation. Features secure user registration, login, password reset, and jwt token-based authentication

## Install Dependencies

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

---
