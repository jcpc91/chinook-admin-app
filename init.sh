cd database && npm install && npm run migrate-app && npm run migrate-auth && cd ..
cd web && npm install && cd ..
cd auth && npm install && cd ..
cd app && npm install && cd ..
wait
npm install -g chance-cli
wait
cd web
cat > .env.development.local << EOF
VITE_MODE=local
VITE_BASE_URL= 
VITE_URL_AUTH=
EOF
cd .. && cd auth
cat > .env << EOF
CORS_ORIGIN=
JWT_SECREAT_KEY=
PORT=3000
EOF
cd .. && cd app
cat > .env << EOF
CORS_ORIGIN=
JWT_SECREAT_KEY=
PORT=3001
EOF
git config --local user.name "jcpc91"
git config --local user.email "jcpc91@hotmail.com"