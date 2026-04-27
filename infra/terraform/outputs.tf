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
