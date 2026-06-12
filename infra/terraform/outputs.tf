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

output "email_api_endpoint" {
  description = "HTTP API endpoint used by Amplify /api rewrites for contact and prayer emails."
  value       = aws_apigatewayv2_api.email.api_endpoint
}

output "ses_sender_email" {
  description = "SES sender address that must be verified before production emails can send."
  value       = aws_ses_email_identity.ministry.email
}
