packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.2"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "ami-amazon-linux-2" {

  ami_users     = var.ami_users
  instance_type = var.ami_instance_type
  region        = var.aws_region
  source_ami    = var.source_ami
  ssh_username  = var.ssh_username

  tags = {
    Name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
    Environment = var.ami_environment
  }

  // profile 		  = "${var.aws_profile}"
  access_key = var.aws-access-key-id
  secret_key = var.aws-secret-access-key

  ami_name      = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "CSYE6225 - Cloud - Assignment 04 - Amazon Linux 2 AMI"

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"
  }
}

build {
  name = "build custom ami"
  sources = [
    "source.amazon-ebs.ami-amazon-linux-2"
  ]

  provisioner "file" {
    sources     = ["./packer/default.conf", "/home/runner/work/webapp/webapp/release.zip", "./packer/pg_hba.conf"]
    destination = "/tmp/"
  }

  provisioner "shell" {
    scripts          = ["./packer/config_env_webapp.sh"]
    environment_vars = ["DB_USER=${var.DB_USER}", "PASSWORD=${var.PASSWORD}", "HOST=${var.HOST}", "DB=${var.DB}"]
  }
}