output "amplify_app_id" {
  description = "Amplify app ID."
  value       = aws_amplify_app.chosen_warriors.id
}

output "amplify_default_domain" {
  description = "Amplify default domain."
  value       = aws_amplify_app.chosen_warriors.default_domain
}

output "amplify_live_url" {
  description = "Live production URL."
  value       = "https://${var.branch_name}.${aws_amplify_app.chosen_warriors.default_domain}"
}

output "postgres_endpoint" {
  description = "RDS PostgreSQL endpoint for the backend API."
  value       = aws_db_instance.postgres.address
}

output "postgres_port" {
  description = "RDS PostgreSQL port."
  value       = aws_db_instance.postgres.port
}

output "postgres_database_name" {
  description = "RDS PostgreSQL database name."
  value       = aws_db_instance.postgres.db_name
}

output "postgres_master_secret_arn" {
  description = "AWS Secrets Manager ARN containing the managed database credentials."
  value       = aws_db_instance.postgres.master_user_secret[0].secret_arn
  sensitive   = true
}
