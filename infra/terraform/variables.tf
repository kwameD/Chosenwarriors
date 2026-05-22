variable "aws_region" {
  description = "AWS region for Chosen Warriors hosting."
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "AWS Amplify app name."
  type        = string
  default     = "Chosenwarriors"
}

variable "repository_url" {
  description = "GitHub repository connected to AWS Amplify."
  type        = string
  default     = "https://github.com/kwameD/Chosenwarriors"
}

variable "branch_name" {
  description = "Production branch deployed by Amplify."
  type        = string
  default     = "main"
}

variable "database_name" {
  description = "Initial PostgreSQL database name."
  type        = string
  default     = "chosenwarriors"
}

variable "database_vpc_cidr" {
  description = "CIDR block for the dedicated database VPC."
  type        = string
  default     = "10.42.0.0/16"
}

variable "database_username" {
  description = "Master username for the PostgreSQL database."
  type        = string
  default     = "chosenwarriors_admin"
}

variable "database_instance_class" {
  description = "RDS instance size."
  type        = string
  default     = "db.t3.micro"
}

variable "database_allocated_storage" {
  description = "Allocated database storage in GB."
  type        = number
  default     = 20
}

variable "database_max_allocated_storage" {
  description = "Autoscaling storage ceiling in GB."
  type        = number
  default     = 100
}

variable "database_publicly_accessible" {
  description = "Whether the database receives a public endpoint. Keep false unless a trusted backend cannot run inside the VPC."
  type        = bool
  default     = false
}

variable "database_allowed_cidr_blocks" {
  description = "CIDR blocks allowed to reach PostgreSQL when database_publicly_accessible is true."
  type        = list(string)
  default     = []
}
