cd database 
npm install -loglevel verbose
npm run migrate-app -loglevel verbose
npm run migrate-auth -loglevel verbose
echo "Database initialized"

cd ..
cd web 
npm install -loglevel verbose
cat > .env.development.local << EOF
VITE_MODE=local
VITE_BASE_URL= 
VITE_URL_AUTH=
EOF
echo "web intall"

cd ..
cd auth 
npm install -loglevel verbose
cat > .env << EOF
CORS_ORIGIN=
JWT_SECREAT_KEY=
PORT=3000
EOF
echo "auth intall"

cd ..
cd app
npm install -loglevel verbose
cat > .env << EOF
CORS_ORIGIN=
JWT_SECREAT_KEY=
PORT=3001
EOF
echo "app intall"

npm install -g chance-cli -loglevel verbose

git config --local user.name "jcpc91"
git config --local user.email "jcpc91@hotmail.com"