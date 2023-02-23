#! /bin/bash
sudo yum update -y

# Install PostgreSQL
sudo yum install postgresql-contrib -y
sudo amazon-linux-extras enable postgresql14
sudo yum install postgresql-server -y

# Initialize DB
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "==> Checking the postgresql status"
sudo systemctl status postgresql

# Setup database
# Create a new PostgreSQL database and user
sudo -u postgres psql -c "CREATE DATABASE ${DB};"
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${PASSWORD}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB} TO ${DB_USER};"

sudo mv -f /tmp/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql

# Install Nginx
sudo amazon-linux-extras install nginx1
sudo systemctl start nginx
sudo systemctl enable nginx
echo "==> Checking the Nginx status"
sudo systemctl status nginx

sudo mv /tmp/default.conf /etc/nginx/conf.d/

sudo systemctl restart nginx
echo "==> Checking the Nginx status"
sudo systemctl status nginx

# Install Node.js and NPM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 16
node -e "console.log('Running Node.js ' + process.version)"

echo "==> Checking for npm version"
npm --version
echo "==> Print binary paths"
which node
which npm

cat <<EOT >> ~/.bash_profile
export HOST=${HOST}
export DB_USER=${DB_USER}
export DB=${DB}
export PASSWORD=${PASSWORD}
EOT

unzip /tmp/webapp.zip -d /home/ec2-user/
cd /home/ec2-user/webapp
npm i
npx sequelize-cli db:migrate

# Install pm2 to setup autorun
npm install pm2@latest -g
pm2 startup
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v16.19.1/bin /home/ec2-user/.nvm/versions/node/v16.19.1/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
sudo systemctl enable pm2-ec2-user
sudo systemctl start pm2-ec2-user
sudo systemctl status pm2-ec2-user

# Unzip the source code for webapp
unzip /tmp/release.zip -d /home/ec2-user/webapp

# Installing dependencies
cd /home/ec2-user/webapp
npm install

# Run webapp as a background process
pm2 start server.js
pm2 save