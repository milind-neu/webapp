
aws_profile = "packer"
aws_region  = "us-east-1"
source_ami  = "ami-0dfcb1ef8550277af"

ssh_username = "ec2-user"

ami_users         = ["084727156493", "452684689716"]
ami_instance_type = "t2.micro"

volume_size = 8
volume_type = "gp2"
volume_name = "/dev/xvda"

sources_to_configure = ["./packer/default.conf", "/home/runner/work/webapp/webapp/release.zip", "./packer/pg_hba.conf"]
shell_script         = ["./packer/config_env_webapp.sh"]