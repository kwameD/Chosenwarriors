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
