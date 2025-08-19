#!/bin/bash
ORIGIN="*"
JWT_SECREAT_KEY="jwtsecretkey"

npm install -loglevel verbose

npm run database:migrate-app -loglevel verbose
npm run database:migrate-auth -loglevel verbose
npm run database:migrate-cat -loglevel verbose
echo "Database initialized"

cd ..
cd web 
cat > .env.development.local << EOF
VITE_MODE=local
VITE_BASE_URL= 
VITE_URL_AUTH=
VITE_URL_CAT=
EOF
echo "web intall"

cd ..
cd auth 
cat > .env << EOF
CORS_ORIGIN=$ORIGIN
JWT_SECREAT_KEY=$JWT_SECREAT_KEY
PORT=3000
EOF
echo "auth intall"

cd ..
cd app
cat > .env << EOF
CORS_ORIGIN=$ORIGIN
JWT_SECREAT_KEY=$JWT_SECREAT_KEY
PORT=3001
EOF
echo "app intall"

cd ..
cd catalogos
cat > .env << EOF
CORS_ORIGIN=$ORIGIN
JWT_SECREAT_KEY=$JWT_SECREAT_KEY
PORT=3002
EOF
echo "catalogos intall"

cd ..
cd microservices


npm install -g chance-cli -loglevel verbose

git config --local user.name "jcpc91"
git config --local user.email "jcpc91@hotmail.com"