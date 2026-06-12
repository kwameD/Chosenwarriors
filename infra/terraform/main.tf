provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "database" {
  cidr_block           = "10.42.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "Chosenwarriors database"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_subnet" "database" {
  count             = 2
  vpc_id            = aws_vpc.database.id
  cidr_block        = "10.42.${count.index + 1}.0/24"
  availability_zone = count.index == 0 ? "us-east-1a" : "us-east-1b"

  tags = {
    Name = "Chosenwarriors database ${count.index + 1}"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_internet_gateway" "database" {
  vpc_id = aws_vpc.database.id

  tags = {
    Name = "Chosenwarriors database"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_route_table" "database" {
  vpc_id = aws_vpc.database.id

  tags = {
    Name = "Chosenwarriors database"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_route_table_association" "database" {
  count          = 2
  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database.id

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_security_group" "postgres" {
  name        = "chosenwarriors-postgres"
  description = "PostgreSQL access for the Chosen Warriors API"
  vpc_id      = aws_vpc.database.id

  egress {
    description = "Allow outbound database responses"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Chosenwarriors PostgreSQL"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_db_subnet_group" "chosen_warriors" {
  name       = "chosenwarriors-postgres-subnets"
  subnet_ids = aws_subnet.database[*].id

  tags = {
    Name = "Chosenwarriors PostgreSQL subnet group"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_db_instance" "postgres" {
  identifier                  = "chosenwarriors-postgres"
  allocated_storage           = 20
  max_allocated_storage       = 100
  db_name                     = "chosenwarriors"
  engine                      = "postgres"
  engine_version              = "16"
  instance_class              = "db.t3.micro"
  username                    = "chosenwarriors_admin"
  manage_master_user_password = true
  db_subnet_group_name        = aws_db_subnet_group.chosen_warriors.name
  vpc_security_group_ids      = [aws_security_group.postgres.id]
  storage_encrypted           = true
  storage_type                = "gp3"
  deletion_protection         = true
  skip_final_snapshot         = false
  final_snapshot_identifier   = "chosenwarriors-postgres-final"

  tags = {
    Name = "Chosenwarriors PostgreSQL"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

locals {
  build_spec        = file("${path.module}/../../amplify.yml")
  email_lambda_name = "${var.app_name}-email-handler"
  site_content_name = "${var.app_name}-site-content"
}

data "archive_file" "email_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/email-handler"
  output_path = "${path.module}/.terraform/email-handler.zip"
}

resource "aws_iam_role" "email_lambda" {
  name = "${local.email_lambda_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "email_lambda_basic" {
  role       = aws_iam_role.email_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "email_lambda_content" {
  name = "${local.email_lambda_name}-content"
  role = aws_iam_role.email_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.site_content.arn
      }
    ]
  })
}

resource "aws_dynamodb_table" "site_content" {
  name         = local.site_content_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "content_key"

  attribute {
    name = "content_key"
    type = "S"
  }
}

resource "aws_lambda_function" "email_handler" {
  function_name    = local.email_lambda_name
  role             = aws_iam_role.email_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.email_lambda.output_path
  source_code_hash = data.archive_file.email_lambda.output_base64sha256
  timeout          = 20

  environment {
    variables = {
      MINISTRY_EMAIL     = var.ministry_email
      SMTP_HOST          = var.smtp_host
      SMTP_PORT          = tostring(var.smtp_port)
      SMTP_SECURE        = tostring(var.smtp_secure)
      SMTP_USER          = var.smtp_user
      SMTP_PASS          = var.smtp_pass
      SMTP_FROM          = var.smtp_from
      ADMIN_PASSWORD     = var.admin_password
      SITE_CONTENT_TABLE = aws_dynamodb_table.site_content.name
    }
  }
}

resource "aws_cloudwatch_log_group" "email_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.email_handler.function_name}"
  retention_in_days = 14
}

resource "aws_apigatewayv2_api" "email" {
  name          = "${var.app_name}-email-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["Content-Type"]
    allow_methods = ["OPTIONS", "POST"]
    allow_origins = ["*"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "email_lambda" {
  api_id                 = aws_apigatewayv2_api.email.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.email_handler.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "contact" {
  api_id    = aws_apigatewayv2_api.email.id
  route_key = "POST /api/contact"
  target    = "integrations/${aws_apigatewayv2_integration.email_lambda.id}"
}

resource "aws_apigatewayv2_route" "admin_login" {
  api_id    = aws_apigatewayv2_api.email.id
  route_key = "POST /api/admin/login"
  target    = "integrations/${aws_apigatewayv2_integration.email_lambda.id}"
}

resource "aws_apigatewayv2_route" "content_read" {
  api_id    = aws_apigatewayv2_api.email.id
  route_key = "GET /api/content"
  target    = "integrations/${aws_apigatewayv2_integration.email_lambda.id}"
}

resource "aws_apigatewayv2_route" "content_write" {
  api_id    = aws_apigatewayv2_api.email.id
  route_key = "PUT /api/content"
  target    = "integrations/${aws_apigatewayv2_integration.email_lambda.id}"
}

resource "aws_apigatewayv2_route" "prayer" {
  api_id    = aws_apigatewayv2_api.email.id
  route_key = "POST /api/prayer"
  target    = "integrations/${aws_apigatewayv2_integration.email_lambda.id}"
}

resource "aws_apigatewayv2_stage" "email" {
  api_id      = aws_apigatewayv2_api.email.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "email_api" {
  statement_id  = "AllowEmailApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.email_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.email.execution_arn}/*/*"
}

import {
  to = aws_amplify_app.chosen_warriors
  id = "d2zuotoinh17on"
}

import {
  to = aws_amplify_branch.main
  id = "d2zuotoinh17on/main"
}

resource "aws_amplify_app" "chosen_warriors" {
  name       = var.app_name
  repository = var.repository_url
  platform   = "WEB"

  build_spec = local.build_spec

  enable_branch_auto_build    = true
  enable_branch_auto_deletion = false
  enable_auto_branch_creation = false

  custom_rule {
    source = "/api/<*>"
    target = "${aws_apigatewayv2_api.email.api_endpoint}/api/<*>"
    status = "200"
  }

  custom_rule {
    source = "/<*>"
    target = "/index.html"
    status = "404-200"
  }

  cache_config {
    type = "AMPLIFY_MANAGED_NO_COOKIES"
  }

  lifecycle {
    ignore_changes = [
      access_token,
      oauth_token,
    ]
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.chosen_warriors.id
  branch_name = var.branch_name

  display_name = var.branch_name
  framework    = "Web"
  stage        = "PRODUCTION"

  enable_auto_build           = true
  enable_basic_auth           = false
  enable_notification         = false
  enable_performance_mode     = false
  enable_pull_request_preview = false
}
