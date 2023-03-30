#! /bin/bash
sudo yum update -y

# Install PostgreSQL
sudo amazon-linux-extras install postgresql14

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

# Install pm2 to setup autorun
npm install pm2@latest -g
pm2 startup
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v16*/bin /home/ec2-user/.nvm/versions/node/v16*/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
sudo systemctl enable pm2-ec2-user
sudo systemctl start pm2-ec2-user
sudo systemctl status pm2-ec2-user

# Unzip the source code for webapp
unzip /tmp/release.zip -d /home/ec2-user/webapp

sudo mv /tmp/cloudwatch_config.json /opt/cloudwatch_config.json

# Installing dependencies
cd /home/ec2-user/webapp
npm install

# Run webapp as a background process
pm2 start npm --name "webapp" -- run "start"
pm2 save