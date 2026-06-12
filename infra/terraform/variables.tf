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

variable "ministry_email" {
  description = "Inbox that receives website contact and prayer request emails."
  type        = string
  default     = "chosenwarriorsofficial@gmail.com"
}

variable "ses_from_email" {
  description = "Verified SES sender address for website emails."
  type        = string
  default     = "chosenwarriorsofficial@gmail.com"
}

variable "admin_password" {
  description = "Password used to unlock the production admin content editor."
  type        = string
  sensitive   = true
}
