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

variable "smtp_host" {
  description = "Secure SMTP host used by the email Lambda."
  type        = string
  default     = "smtp.gmail.com"
}

variable "smtp_port" {
  description = "Secure SMTP port used by the email Lambda."
  type        = number
  default     = 465
}

variable "smtp_secure" {
  description = "Whether the email Lambda should connect with TLS immediately."
  type        = bool
  default     = true
}

variable "smtp_user" {
  description = "SMTP username used by the email Lambda."
  type        = string
  sensitive   = true
}

variable "smtp_pass" {
  description = "SMTP password or app password used by the email Lambda."
  type        = string
  sensitive   = true
}

variable "smtp_from" {
  description = "From header used by website emails."
  type        = string
  default     = "Chosen Warriors <chosenwarriorsofficial@gmail.com>"
}
