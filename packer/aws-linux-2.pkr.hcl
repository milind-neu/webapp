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
    Name = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  }

  // profile = "${var.aws_profile}"
  access_key = var.aws-access-key-id
  secret_key = var.aws-secret-access-key

  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "CSYE6225 - Cloud - Assignment 04 - Amazon Linux 2 AMI"

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = var.volume_name
    volume_size           = var.volume_size
    volume_type           = var.volume_type
  }
}

build {
  name = "build custom ami"
  sources = [
    "source.amazon-ebs.ami-amazon-linux-2"
  ]

  provisioner "file" {
    sources     = var.sources_to_configure
    destination = "/tmp/"
  }

  provisioner "shell" {
    scripts = var.shell_script
  }
}
