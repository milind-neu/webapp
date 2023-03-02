variable "aws_profile" {
  type = string
}
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "aws-access-key-id" {
  type        = string
  description = "Packer IAM User Access Key"
  default     = env("aws-access-key-id")
}

variable "aws-secret-access-key" {
  type        = string
  description = "Packer IAM User Access Secret Key"
  default     = env("aws-secret-access-key")
}

variable "source_ami" {
  type = string
}

variable "ssh_username" {
  type = string
}

variable "ami_users" {
  type = list(string)
}

variable "ami_instance_type" {
  type = string
}

variable "volume_size" {
  type        = number
  description = "Volume size"
}

variable "volume_type" {
  type        = string
  description = "Volume type"
}

variable "volume_name" {
  type        = string
  description = "Volume Name"
}

variable "sources_to_configure" {
  type = list(string)
}

variable "shell_script" {
  type = list(string)
}