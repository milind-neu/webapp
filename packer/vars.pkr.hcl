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
  description = "Packer IAM User Secret Key"
  default     = env("aws-secret-access-key")
}

variable "source_ami" {
  type = string
}

variable "ssh_username" {
  type = string
}

variable "ami_environment" {
  type = string
}

variable "ami_users" {
  type = list(string)
}

variable "ami_instance_type" {
  type = string
}

variable "DB_USER" {
  type    = string
  default = "admin"
}

variable "HOST" {
  type    = string
  default = "localhost"
}

variable "DB" {
  type    = string
  default = "webapp"
}

variable "PASSWORD" {
  type    = string
  default = "Boylston@1185"
}